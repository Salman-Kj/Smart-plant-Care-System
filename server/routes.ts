import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, requireUser, requireGardener, requireAdmin } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import passport from "passport";
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import readline from "readline";
import { randomBytes } from "crypto";
import { db } from "./db";
import { bookings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword, comparePasswords } = setupAuth(app);

  let worker: ChildProcessWithoutNullStreams | null = null;
  const pending = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }
  >();
  let requestCounter = 0;
  let workerReady: Promise<void> | null = null;
  let workerReadyResolve: (() => void) | null = null;

  const startWorker = () => {
    const pythonBin = process.env.PYTHON_BIN || "python";
    const modelPath = path.resolve("ml", "plant_disease_model.keras");
    const classMapPath = path.resolve("ml", "model", "class_names.json");
    const infoPath = path.resolve("ml", "disease_info.json");

    worker = spawn(pythonBin, [
      path.resolve("ml", "predict_worker.py"),
      "--model",
      modelPath,
      "--classes",
      classMapPath,
      "--info",
      infoPath,
    ]);

    workerReady = new Promise<void>((resolve) => {
      workerReadyResolve = resolve;
    });

    const rl = readline.createInterface({ input: worker.stdout });
    rl.on("line", (line) => {
      try {
        const message = JSON.parse(line);
        if (message.type === "ready") {
          workerReadyResolve?.();
          return;
        }
        const id = String(message.id ?? "");
        const entry = pending.get(id);
        if (!entry) return;
        pending.delete(id);
        clearTimeout(entry.timeout);
        if (message.error) {
          entry.reject(new Error(message.error));
        } else {
          entry.resolve(message);
        }
      } catch (err) {
        console.error("Predict worker output parse error:", err);
      }
    });

    worker.stderr.on("data", (data) => {
      console.error("Predict worker stderr:", data.toString());
    });

    worker.on("close", (code) => {
      console.error(`Predict worker exited with code ${code}`);
      workerReady = null;
      workerReadyResolve = null;
      for (const [id, entry] of Array.from(pending.entries())) {
        clearTimeout(entry.timeout);
        entry.reject(new Error("Predict worker exited"));
        pending.delete(id);
      }
      worker = null;
    });
  };

  const ensureWorker = () => {
    if (!worker) {
      startWorker();
    }
  };

  ensureWorker();

  const normalizeName = (value: string) =>
    value.toLowerCase().replace(/\s+/g, " ").trim();

  const ensureGardenerUserLink = async (gardenerId: number) => {
    const gardener = await storage.getGardener(gardenerId);
    if (!gardener) return null;
    if (gardener.userId) return gardener;

    const gardeners = await storage.getGardeners();
    const gardenerUsers = await storage.getUsersByRole("gardener");
    const linkedUserIds = new Set(
      gardeners.map((entry) => entry.userId).filter(Boolean) as number[]
    );
    const unlinkedUsers = gardenerUsers
      .filter((user) => !linkedUserIds.has(user.id))
      .sort((a, b) => a.id - b.id);
    const unlinkedGardeners = gardeners
      .filter((entry) => !entry.userId)
      .sort((a, b) => a.id - b.id);

    const gardenerName = normalizeName(gardener.name);
    if (gardenerName === "john smith") {
      const rashidUser = await storage.getUserByUsername("rashid12");
      if (rashidUser && !linkedUserIds.has(rashidUser.id)) {
        const updated = await storage.updateGardenerUserId(gardener.id, rashidUser.id);
        if (updated?.userId) {
          await storage.updateBookingGardenerId(gardener.id, updated.userId);
        }
        return updated || gardener;
      }
    }

    const nameMatch = unlinkedUsers.find((user) => {
      const fullName = user.fullName ? normalizeName(user.fullName) : "";
      const username = normalizeName(user.username || "");
      return fullName === gardenerName || username === gardenerName;
    });

    let chosen = nameMatch || null;
    if (!chosen) {
      const index = unlinkedGardeners.findIndex((entry) => entry.id === gardener.id);
      if (index >= 0 && unlinkedUsers[index]) {
        chosen = unlinkedUsers[index];
      }
    }

    if (!chosen) return gardener;
    const updated = await storage.updateGardenerUserId(gardener.id, chosen.id);
    if (updated?.userId) {
      await storage.updateBookingGardenerId(gardener.id, updated.userId);
    }
    return updated || gardener;
  };

  const forceJohnSmithToRashid = async () => {
    const rashidUser = await storage.getUserByUsername("rashid12");
    if (!rashidUser) return;
    const gardeners = await storage.getGardeners();
    const john = gardeners.find(
      (entry) => normalizeName(entry.name) === "john smith"
    );
    if (!john) return;
    if (john.userId !== rashidUser.id) {
      const updated = await storage.updateGardenerUserId(john.id, rashidUser.id);
      if (updated?.userId) {
        await storage.updateBookingGardenerId(john.id, updated.userId);
      }
    }
  };

  async function runLocalDiseaseDetection(imageBuffer: Buffer) {
    ensureWorker();
    if (workerReady) {
      await workerReady;
    }
    const id = `${Date.now()}-${requestCounter++}`;
    const imageBase64 = imageBuffer.toString("base64");

    return new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error("Prediction timed out"));
      }, 8000);

      pending.set(id, { resolve, reject, timeout });
      worker?.stdin.write(JSON.stringify({ id, image_base64: imageBase64 }) + "\n");
    });
  }
  
  // === AUTH ===
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const parsedRegistration = api.auth.register.input.safeParse(req.body);
      if (!parsedRegistration.success) {
        return res.status(400).json({ message: "Invalid registration details" });
      }

      const {
        username,
        password,
        fullName,
        email,
        phone,
        address,
        profileImage,
        role,
      } = parsedRegistration.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        role: role === "gardener" ? "gardener" : "user",
        fullName,
        email: email ? email.trim().toLowerCase() : email,
        phone,
        address,
        profileImage,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.status(201).json(user);
      });
    } catch (err) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const { role: selectedRole } = req.body;
    const authMiddleware = passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      // Check if selected role matches user's actual role
      if (selectedRole && user.role !== selectedRole) {
        return res.status(401).json({ 
          message: `Please login as ${user.role === "user" ? "User" : user.role === "gardener" ? "Gardener" : "Admin"}. You selected ${selectedRole === "user" ? "User" : selectedRole === "gardener" ? "Gardener" : "Admin"}.` 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    });
    // This is required to access passport inside the route handler wrapper
    // We need to pass the req, res, next to the middleware returned by authenticate
    authMiddleware(req, res, next);
  });
  
  // Need to import passport for the route above, or just use req.login which is added by passport
  // Since we don't import passport here, let's fix the login route to use the middleware properly
  // Actually, I can just require it or import it if needed. 
  // Let's use the standard pattern:
  
  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.status(200).json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, requireUser, (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await storage.getUserByEmail(email);
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setUserResetToken(user.id, token, expiresAt);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[FORGOT PASSWORD] Reset link for ${email}: ${baseUrl}/reset-password?token=${token}`);
      }
    }
    res.status(200).json({
      message: "If an account exists with that email, you will receive a password reset link.",
    });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
    }
    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPassword(user.id, hashedPassword);
    await storage.clearUserResetToken(user.id);
    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  });

  // === PLANTS ===
  app.get(api.plants.list.path, async (req, res) => {
    const plants = await storage.getPlants();
    res.json(plants);
  });

  app.get(api.plants.get.path, async (req, res) => {
    const plant = await storage.getPlant(Number(req.params.id));
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  });

  app.post(api.plants.create.path, requireUser, async (req, res) => {
    try {
      const input = api.plants.create.input.parse(req.body);
      const plant = await storage.createPlant({ ...input, sellerId: (req.user as any).id });
      res.status(201).json(plant);
    } catch (err) {
      console.error("addStoreItem error:", err);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/plants/:id/reviews", async (req, res) => {
    const plantId = Number(req.params.id);
    if (Number.isNaN(plantId)) return res.status(400).json({ message: "Invalid plant ID" });
    try {
      const reviews = await storage.getReviewsForPlant(plantId);
      res.json(reviews);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to load reviews" });
    }
  });

  app.post("/api/plants/:id/reviews", requireUser, async (req, res) => {
    const plantId = Number(req.params.id);
    if (Number.isNaN(plantId)) return res.status(400).json({ message: "Invalid plant ID" });
    const plant = await storage.getPlant(plantId);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }
    const comment = typeof req.body?.comment === "string" ? req.body.comment : undefined;
    try {
      const review = await storage.createOrUpdatePlantReview((req.user as any).id, plantId, rating, comment ?? null);
      res.status(201).json(review);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to save review" });
    }
  });

  // === GARDENERS ===
  app.get(api.gardeners.list.path, async (req, res) => {
    const gardeners = await storage.getGardeners();
    res.json(gardeners);
  });

  app.get("/api/gardeners/:id/reviews", async (req, res) => {
    const gardenerId = Number(req.params.id);
    if (Number.isNaN(gardenerId)) return res.status(400).json({ message: "Invalid gardener ID" });
    try {
      const reviews = await storage.getReviewsForGardener(gardenerId);
      res.json(reviews);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to load reviews" });
    }
  });

  app.post("/api/gardeners/:id/reviews", requireUser, async (req, res) => {
    const gardenerId = Number(req.params.id);
    if (Number.isNaN(gardenerId)) return res.status(400).json({ message: "Invalid gardener ID" });
    const bookingId = Number(req.body?.bookingId);
    if (!Number.isInteger(bookingId)) return res.status(400).json({ message: "bookingId required" });
    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be 1-5" });
    const comment = typeof req.body?.comment === "string" ? req.body.comment : undefined;
    const booking = await storage.getBookingForUser(bookingId, (req.user as any).id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Can only review completed bookings" });
    const gardener = await storage.getGardenerByUserId(booking.gardenerId);
    if (!gardener || gardener.id !== gardenerId) return res.status(400).json({ message: "Booking does not match gardener" });
    const existing = await storage.getGardenerReviewByBooking(bookingId);
    if (existing) return res.status(400).json({ message: "You already reviewed this booking" });
    try {
      const review = await storage.createGardenerReview(bookingId, (req.user as any).id, gardenerId, rating, comment ?? null);
      res.status(201).json(review);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to save review" });
    }
  });

  app.post(api.gardeners.hire.path, requireUser, async (req, res) => {
    const gardenerId = Number(req.params.id);
    if (Number.isNaN(gardenerId)) {
      return res.status(400).json({ message: "Invalid gardener ID" });
    }
    if ((req.user as any).role !== "user") {
      return res.status(403).json({ message: "Only users can create bookings" });
    }
    const gardener = await storage.getGardener(gardenerId);
    if (!gardener) {
      return res.status(404).json({ message: "Gardener not found" });
    }
    const ensured = await ensureGardenerUserLink(gardener.id);
    const gardenerUserId = ensured?.userId ?? null;
    if (!gardenerUserId) {
      return res.status(400).json({ message: "Gardener account not linked" });
    }
    const serviceDateInput = req.body.dateTime || req.body.date;
    if (!serviceDateInput) {
      return res.status(400).json({ message: "Service date is required" });
    }
    if (!req.body.userPhone || !req.body.userAddress) {
      return res.status(400).json({ message: "Phone and address are required" });
    }
    const hours = typeof req.body.hours === "number" ? req.body.hours : 2;
    const amount =
      typeof req.body.amount === "number" && req.body.amount > 0
        ? req.body.amount
        : gardener.hourlyRate * hours;
    const booking = await storage.createBooking({
      userId: (req.user as any).id,
      gardenerId: gardenerUserId,
      userName: req.body.userName || (req.user as any).fullName || (req.user as any).username,
      userEmail: req.body.userEmail || (req.user as any).email,
      userPhone: req.body.userPhone,
      userAddress: req.body.userAddress,
      serviceDate: new Date(serviceDateInput),
      message: req.body.message,
      status: "pending",
      amount,
      hours,
    });
    try {
      await storage.createNotification({
        userId: gardenerUserId,
        type: "new_booking",
        relatedId: booking.id,
        message: `New booking request #${booking.id} received.`,
      });
    } catch (e) {
      console.error("[Notifications] Failed to create booking notification:", e);
    }
    res.json({ message: "Hire request sent successfully", bookingId: booking.id });
  });

  app.get(api.bookings.list.path, requireUser, async (req, res) => {
    const bookings = await storage.getBookingsForUser((req.user as any).id);
    res.json(bookings);
  });

  app.post(api.bookings.pay.path, requireUser, async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const booking = await storage.getBookingForUser(bookingId, (req.user as any).id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "accepted") {
      return res.status(400).json({ message: "Payment only allowed after gardener accepts the booking" });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }
    const paymentMethod = (req.body?.paymentMethod as string) || "card";
    const updated =
      paymentMethod === "cod"
        ? await storage.setBookingPaymentMethod(bookingId, (req.user as any).id, "cod")
        : await storage.markBookingPaid(bookingId, (req.user as any).id, paymentMethod);
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  });

  app.get(api.profile.get.path, requireUser, async (req, res) => {
    const user = await storage.getUser((req.user as any).id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      profileImage: user.profileImage || "",
    });
  });

  app.put(api.profile.update.path, requireUser, async (req, res) => {
    try {
      const input = api.profile.update.input.parse(req.body);
      const updated = await storage.updateUserProfile((req.user as any).id, {
        fullName: input.fullName,
        phone: input.phone ?? null,
        address: input.address ?? null,
        profileImage: input.profileImage ?? null,
      });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Profile updated" });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put(api.profile.changePassword.path, requireUser, async (req, res) => {
    try {
      const input = api.profile.changePassword.input.parse(req.body);
      const user = req.user as any;
      const isValid = await comparePasswords(input.oldPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
      const hashed = await hashPassword(input.newPassword);
      await storage.updateUserPassword(user.id, hashed);
      res.json({ message: "Password updated" });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.bookings.remove.path, requireUser, async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const booking = await storage.getBookingForUser(bookingId, (req.user as any).id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status === "completed" || booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Cannot delete a completed or paid booking.",
      });
    }
    const forceDelete = req.query.mode === "delete";
    if (!forceDelete && booking.status === "pending") {
      const cancelled = await storage.cancelBookingForUser(bookingId, (req.user as any).id);
      if (!cancelled) {
        return res.status(404).json({ message: "Booking not found" });
      }
      return res.json({ message: "Booking cancelled" });
    }
    if (booking.status === "pending" && forceDelete) {
      return res.status(400).json({ message: "Cancel pending bookings before delete" });
    }
    const deleted = await storage.deleteBookingForUser(bookingId, (req.user as any).id);
    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted" });
  });

  app.get(api.gardenerBookings.list.path, requireGardener, async (req, res) => {
    if ((req.user as any)?.username === "rashid12") {
      await forceJohnSmithToRashid();
    }
    // Proactively update all bookings to use user ID instead of gardener table ID
    const gardener = await storage.getGardenerByUserId((req.user as any).id);
    if (gardener) {
      await storage.updateBookingGardenerId(gardener.id, (req.user as any).id);
    }
    let bookings = await storage.getBookingsForGardener((req.user as any).id);
    res.json(bookings);
  });

  app.post(api.gardenerBookings.accept.path, requireGardener, async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    let updated = await storage.updateBookingStatus(
      bookingId,
      (req.user as any).id,
      "accepted"
    );
    if (!updated) {
      const gardener = await storage.getGardenerByUserId((req.user as any).id);
      if (gardener) {
        updated = await storage.updateBookingStatus(bookingId, gardener.id, "accepted");
        if (updated) {
          await storage.updateBookingGardenerId(gardener.id, (req.user as any).id);
        }
      }
    }
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  });

  app.post(api.gardenerBookings.reject.path, requireGardener, async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    let updated = await storage.updateBookingStatus(
      bookingId,
      (req.user as any).id,
      "rejected"
    );
    if (!updated) {
      const gardener = await storage.getGardenerByUserId((req.user as any).id);
      if (gardener) {
        updated = await storage.updateBookingStatus(bookingId, gardener.id, "rejected");
        if (updated) {
          await storage.updateBookingGardenerId(gardener.id, (req.user as any).id);
        }
      }
    }
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  });

  app.post(api.gardenerBookings.complete.path, requireGardener, async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const existing = await storage.getBooking(bookingId);
    if (!existing) return res.status(404).json({ message: "Booking not found" });
    if (existing.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted bookings can be marked complete." });
    }
    const isCod = (existing.paymentMethod ?? "").toLowerCase() === "cod";
    const isUnpaid = (existing.paymentStatus ?? "unpaid") !== "paid";
    const isCodUnpaid = isCod && isUnpaid;
    if (!isCod && isUnpaid) {
      return res.status(400).json({
        message: "Customer must pay before you can complete this booking.",
      });
    }
    const cashReceived = req.body?.cashReceived === true;
    if (isCodUnpaid && !cashReceived) {
      return res.status(400).json({
        message: "For COD bookings, please confirm that you received cash from the customer.",
      });
    }
    if (isCodUnpaid && cashReceived) {
      await storage.markBookingPaidByGardenerConfirm(bookingId);
    }
    let updated = await storage.updateBookingStatus(
      bookingId,
      (req.user as any).id,
      "completed"
    );
    if (!updated) {
      const gardener = await storage.getGardenerByUserId((req.user as any).id);
      if (gardener) {
        updated = await storage.updateBookingStatus(bookingId, gardener.id, "completed");
        if (updated) {
          await storage.updateBookingGardenerId(gardener.id, (req.user as any).id);
        }
      }
    }
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    const afterComplete = await storage.getBooking(bookingId);
    if (afterComplete?.paymentStatus === "paid") {
      const released = await storage.releaseGardenerPayout(bookingId);
      if (released) updated = released;
    }
    res.json(updated);
  });

  // === MESSAGES ===
  console.log(`[ROUTE REGISTRATION] Registering POST ${api.messages.create.path}`);
  app.post(api.messages.create.path, requireUser, async (req, res) => {
    try {
      console.log(`[MESSAGES CREATE] ========== ROUTE HIT ==========`);
      console.log(`[MESSAGES CREATE] Route hit! Path: ${api.messages.create.path}`);
      console.log(`[MESSAGES CREATE] Method: ${req.method}`);
      console.log(`[MESSAGES CREATE] Request body:`, JSON.stringify(req.body));
      console.log(`[MESSAGES CREATE] User:`, req.user ? { id: (req.user as any).id, username: (req.user as any).username } : "NO USER");
      
      const bookingId = Number(req.body.bookingId);
      const userId = (req.user as any).id;
      
      console.log(`[MESSAGES CREATE] Received bookingId: ${req.body.bookingId} (parsed: ${bookingId}), userId: ${userId}`);
      
      if (Number.isNaN(bookingId) || bookingId <= 0) {
        console.log(`[MESSAGES CREATE] Invalid booking ID: ${bookingId}`);
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      // First, get gardener info to check both user ID and table ID
      const gardener = await storage.getGardenerByUserId(userId);
      console.log(`[MESSAGES CREATE] User ${userId}, Gardener:`, gardener ? `table ID ${gardener.id}` : "not a gardener");
      
      // Find booking by ID (regardless of gardenerId)
      let allBookings = await db.select().from(bookings).where(eq(bookings.id, bookingId));
      console.log(`[MESSAGES CREATE] Found ${allBookings.length} bookings with ID ${bookingId}`);
      
      // Debug: Check all bookings in database
      if (allBookings.length === 0) {
        const allBookingsDebug = await db.select().from(bookings).limit(10);
        console.log(`[MESSAGES CREATE] DEBUG: First 10 bookings in DB:`, allBookingsDebug.map(b => ({ id: b.id, userId: b.userId, gardenerId: b.gardenerId })));
        console.log(`[MESSAGES CREATE] ERROR: Booking ${bookingId} does not exist in database`);
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const booking = allBookings[0];
      console.log(`[MESSAGES CREATE] Booking found:`, { id: booking.id, userId: booking.userId, gardenerId: booking.gardenerId });
      
      // Check authorization and determine receiver
      let isAuthorized = false;
      let receiverId: number;
      
      // Case 1: User is the customer
      if (booking.userId === userId) {
        isAuthorized = true;
        receiverId = booking.gardenerId;
        console.log(`[MESSAGES CREATE] User ${userId} is the customer, receiver is gardenerId: ${receiverId}`);
      }
      // Case 2: User is the gardener (check both user ID and gardener table ID)
      else {
        if (!gardener) {
          console.log(`[MESSAGES CREATE] User ${userId} is not a gardener`);
          return res.status(403).json({ message: "Not authorized" });
        }
        
        // Check if booking's gardenerId matches user ID
        if (booking.gardenerId === userId) {
          isAuthorized = true;
          receiverId = booking.userId;
          console.log(`[MESSAGES CREATE] User ${userId} is the gardener (user ID match), receiver is userId: ${receiverId}`);
        }
        // Check if booking's gardenerId matches gardener table ID
        else if (booking.gardenerId === gardener.id) {
          // Update booking to use user ID for consistency
          await db.update(bookings).set({ gardenerId: userId }).where(eq(bookings.id, bookingId));
          booking.gardenerId = userId;
          isAuthorized = true;
          receiverId = booking.userId;
          console.log(`[MESSAGES CREATE] User ${userId} is the gardener (table ID match), updated booking, receiver is userId: ${receiverId}`);
        } else {
          console.log(`[MESSAGES CREATE] User ${userId} is not authorized. Booking gardenerId: ${booking.gardenerId}, User ID: ${userId}, Gardener table ID: ${gardener.id}`);
          return res.status(403).json({ message: "Not authorized" });
        }
      }
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const message = await storage.createMessage({
        bookingId,
        senderId: userId,
        receiverId,
        content: req.body.content,
        read: false,
      });
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error("[MESSAGES] Error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get(api.messages.getForBooking.path, requireUser, async (req, res) => {
    const bookingId = Number(req.params.bookingId);
    const booking = await storage.getBookingForUser(bookingId, (req.user as any).id);
    if (!booking) {
      // Check if user is gardener
      const gardener = await storage.getGardenerByUserId((req.user as any).id);
      if (gardener) {
        const gardenerBooking = await storage.getBookingsForGardener((req.user as any).id);
        const found = gardenerBooking.find((b) => b.id === bookingId);
        if (!found) {
          return res.status(404).json({ message: "Booking not found" });
        }
      } else {
        return res.status(404).json({ message: "Booking not found" });
      }
    }
    const msgs = await storage.getMessagesForBooking(bookingId);
    res.json(msgs);
  });

  app.get(api.messages.getForUser.path, requireUser, async (req, res) => {
    const msgs = await storage.getMessagesForUser((req.user as any).id);
    res.json(msgs);
  });

  app.put(api.messages.markRead.path, requireUser, async (req, res) => {
    const messageId = Number(req.params.id);
    const updated = await storage.markMessageAsRead(messageId, (req.user as any).id);
    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(updated);
  });

  // === NOTIFICATIONS ===
  app.get("/api/notifications", requireUser, async (req, res) => {
    try {
      const list = await storage.getNotificationsForUser((req.user as any).id);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to load notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireUser, async (req, res) => {
    try {
      const count = await storage.getUnreadCountForUser((req.user as any).id);
      res.json({ count });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to get count" });
    }
  });

  app.put("/api/notifications/:id/read", requireUser, async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const updated = await storage.markNotificationRead(id, (req.user as any).id);
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json(updated);
  });

  // === GARDENER PROFILE ===
  app.post("/api/gardener/profile", requireGardener, async (req, res) => {
    const userId = (req.user as any).id;
    const existingGardener = await storage.getGardenerByUserId(userId);
    
    if (existingGardener) {
      return res.status(400).json({ message: "Gardener profile already exists" });
    }

    const gardener = await storage.createGardener({
      userId,
      name: req.body.name,
      experience: req.body.experience,
      hourlyRate: req.body.hourlyRate,
      imageUrl: req.body.imageUrl,
      rating: 5,
      available: true,
      paymentMethod: req.body.paymentMethod ?? null,
      paymentDetail: req.body.paymentDetail ?? null,
      accountTitle: req.body.accountTitle ?? null,
    });

    // Update user phone if provided
    if (req.body.phone) {
      await storage.updateUserProfile(userId, { phone: req.body.phone });
    }

    res.json(gardener);
  });

  app.put("/api/gardener/profile", requireGardener, async (req, res) => {
    const userId = (req.user as any).id;
    const gardener = await storage.getGardenerByUserId(userId);
    if (!gardener) {
      return res.status(404).json({ message: "Gardener profile not found" });
    }
    const updated = await storage.updateGardener(gardener.id, {
      paymentMethod: req.body.paymentMethod ?? (gardener as { paymentMethod?: string | null }).paymentMethod ?? null,
      paymentDetail: req.body.paymentDetail ?? (gardener as { paymentDetail?: string | null }).paymentDetail ?? null,
      accountTitle: req.body.accountTitle ?? (gardener as { accountTitle?: string | null }).accountTitle ?? null,
    });
    if (!updated) return res.status(404).json({ message: "Gardener not found" });
    res.json(updated);
  });

  // === DISEASE DETECTION ===
  app.post(api.disease.detect.path, upload.single("image"), async (req, res) => {
    try {
      let plantName = "";
      let imageBuffer: Buffer | null = null;

      if (req.file) {
        // If file is uploaded, we'll use a placeholder or extraction if possible
        // For this task, we'll use the original name
        plantName = req.file.originalname;
        imageBuffer = req.file.buffer;
      } else {
        plantName = req.body.imageName || "Unknown Plant";
      }

      if (!imageBuffer) {
        return res.status(400).json({ message: "Image is required for detection" });
      }

      const result = await runLocalDiseaseDetection(imageBuffer);

      const requiredFields = [
        "disease_name",
        "confidence_percentage",
        "cause",
        "solution",
        "medicine",
      ];
      for (const field of requiredFields) {
        if (!(field in result)) {
          console.error("Prediction missing field:", field, result);
          return res.status(500).json({ message: "Invalid model response structure" });
        }
      }

      // Log if user is logged in
      if (req.isAuthenticated()) {
        await storage.logDisease({
          userId: (req.user as any).id,
          imageUrl: req.body.imageUrl || "uploaded-file",
          imageName: plantName,
          diseaseName: result.disease_name || "Unknown",
          confidence: Math.round(Number(result.confidence_percentage)) || 0,
          cause: result.cause,
          solution: result.solution,
          medicine: result.medicine
        });
      }

      res.json(result);
    } catch (err) {
      console.error("Disease detection error:", err);
      res.status(500).json({ message: "Detection failed" });
    }
  });
  
  app.get(api.disease.history.path, requireUser, async (req, res) => {
    const logs = await storage.getDiseaseLogs((req.user as any).id);
    res.json(logs);
  });

  // === ORDERS ===
  app.post(api.orders.create.path, requireUser, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      try {
        const admins = await storage.getUsersByRole("admin");
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "new_order",
            relatedId: order.id,
            message: `New order #${order.id} placed.`,
          });
        }
      } catch (e) {
        console.error("[Notifications] Failed to create order notification:", e);
      }
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get(api.orders.list.path, requireUser, async (req, res) => {
    const user = req.user as any;
    if (user.role === 'admin') {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrders(user.id);
      res.json(orders);
    }
  });

  // === CART ===
  app.get(api.cart.list.path, requireUser, async (req, res) => {
    const items = await storage.getCartItems((req.user as any).id);
    res.json(items);
  });

  app.post(api.cart.add.path, requireUser, async (req, res) => {
    const plantId = Number(req.body?.plantId);
    if (Number.isNaN(plantId)) return res.status(400).json({ message: "Invalid plant ID" });
    try {
      const plant = await storage.getPlant(plantId);
      if (!plant) return res.status(404).json({ message: "Plant not found" });
      const item = await storage.addToCart({
        userId: (req.user as any).id,
        plantId,
        quantity: Number(req.body?.quantity) || 1,
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.cart.addStore.path, requireUser, async (req, res) => {
    try {
      const input = api.cart.addStore.input.parse(req.body);
      const existing = await storage.getPlantByNameCategory(input.name, input.category);
      const plant = existing ?? await storage.createPlant({
        name: input.name,
        description: input.description || `${input.category} item`,
        price: input.price * 100,
        imageUrl: input.imageUrl,
        category: input.category,
        sellerId: null,
      });
      const item = await storage.addToCart({
        userId: (req.user as any).id,
        plantId: plant.id,
        quantity: 1,
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.cart.update.path, requireUser, async (req, res) => {
    try {
      const plantId = Number(req.params.plantId);
      const { quantity } = req.body;
      const item = await storage.updateCartQuantity((req.user as any).id, plantId, quantity);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/cart/clear", requireUser, async (req, res) => {
    await storage.clearCart((req.user as any).id);
    res.json({ message: "Cart cleared" });
  });

  app.delete(api.cart.remove.path, requireUser, async (req, res) => {
    if (req.params.plantId === "clear") {
      await storage.clearCart((req.user as any).id);
      return res.json({ message: "Cart cleared" });
    }
    const plantId = Number(req.params.plantId);
    if (Number.isNaN(plantId)) {
      return res.status(400).json({ message: "Invalid plant ID" });
    }
    await storage.removeFromCart((req.user as any).id, plantId);
    res.json({ message: "Removed from cart" });
  });

  // === WISHLIST ===
  app.get("/api/wishlist", requireUser, async (req, res) => {
    try {
      const [list, catalog] = await Promise.all([
        storage.getWishlist((req.user as any).id),
        storage.getCatalogWishlist((req.user as any).id),
      ]);
      res.json({ items: list, catalog });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to load wishlist" });
    }
  });

  app.post("/api/wishlist/catalog", requireUser, async (req, res) => {
    const itemType = typeof req.body?.type === "string" ? req.body.type.trim() : "";
    const itemKey = typeof req.body?.key === "string" ? req.body.key.trim() : "";
    if (!itemType || !itemKey) return res.status(400).json({ message: "type and key required" });
    try {
      const item = await storage.addToCatalogWishlist((req.user as any).id, itemType, itemKey);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/catalog/:type/:key", requireUser, async (req, res) => {
    const itemType = decodeURIComponent(req.params.type || "");
    const itemKey = decodeURIComponent(req.params.key || "");
    if (!itemType || !itemKey) return res.status(400).json({ message: "type and key required" });
    await storage.removeFromCatalogWishlist((req.user as any).id, itemType, itemKey);
    res.json({ message: "Removed from wishlist" });
  });

  app.post("/api/wishlist/:plantId", requireUser, async (req, res) => {
    const plantId = Number(req.params.plantId);
    if (Number.isNaN(plantId)) return res.status(400).json({ message: "Invalid plant ID" });
    const plant = await storage.getPlant(plantId);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    try {
      const item = await storage.addToWishlist((req.user as any).id, plantId);
      res.status(201).json(item);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:plantId", requireUser, async (req, res) => {
    const plantId = Number(req.params.plantId);
    if (Number.isNaN(plantId)) return res.status(400).json({ message: "Invalid plant ID" });
    await storage.removeFromWishlist((req.user as any).id, plantId);
    res.json({ message: "Removed from wishlist" });
  });

  // === CONTACT ===
  app.post("/api/contact", async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : null;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    try {
      const msg = await storage.createContactMessage({ name, email, message, subject });
      res.status(201).json({ id: msg.id, message: "Message sent successfully" });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to send message" });
    }
  });

  // === NEWSLETTER ===
  app.post("/api/newsletter/subscribe", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    try {
      const sub = await storage.addNewsletterSubscriber(email);
      res.status(201).json({ message: "Subscribed successfully", id: sub.id });
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Failed to subscribe" });
    }
  });

  // === PUBLIC ARTICLES (Blog) ===
  app.get("/api/articles", async (_req, res) => {
    try {
      const list = await storage.getArticlesPublished().catch(() => []);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to load articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      if (article.status !== "published") {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to load article" });
    }
  });

  // === ADMIN ROUTES ===
  // IMPORTANT: These routes must be registered BEFORE Vite middleware
  // Express matches routes in order, so these will be matched before Vite catch-all
  
  // Admin Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers().catch(() => []);
      const allGardeners = await storage.getGardeners().catch(() => []);
      const allOrders = await storage.getAllOrders().catch(() => []);
      const allBookings = await storage.getAllBookings().catch(() => []);
      
      const totalUsers = (allUsers || []).length;
      const totalGardeners = (allGardeners || []).length;
      const totalOrders = (allOrders || []).length;
      const totalBookings = (allBookings || []).length;
      const totalSales = (allOrders || []).reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      // Calculate user growth (last 7 months) - simplified distribution
      const userGrowth = Array.from({ length: 7 }, () => {
        return Math.floor(totalUsers / 7) || 0;
      });
      
      // Calculate sales performance (last 7 months)
      const now = new Date();
      const salesPerformance = Array.from({ length: 7 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (6 - i) + 1, 0);
        return (allOrders || [])
          .filter((o: any) => {
            if (!o || !o.createdAt) return false;
            const orderDate = new Date(o.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      });
      
      res.json({
        stats: {
          totalUsers,
          totalGardeners,
          totalOrders,
          totalBookings,
          totalSales,
        },
        userGrowth,
        salesPerformance,
      });
    } catch (error: any) {
      console.error("[Admin Stats] Error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Admin Users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers().catch(() => []);
      res.json((users || []).map((u: any) => ({
        id: u.id,
        name: u.fullName || u.username,
        email: u.email || null,
        phone: u.phone || null,
        role: u.role || "user",
        status: u.status || "active",
      })));
    } catch (error: any) {
      console.error("[Admin Users] Error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Admin Orders: update status (dispatch / delivered)
  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order id" });
      }

      const status = String(req.body?.status || "").trim().toLowerCase();
      const allowed = ["pending", "dispatched", "delivered", "completed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateOrderStatus(orderId, status);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      res.json(updated);
    } catch (error: any) {
      console.error("[Admin Orders] Error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  app.put("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { status } = req.body;
      if (!["active", "blocked"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateUserStatus(userId, status);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  app.put("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;
      if (!["user", "gardener", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const updated = await storage.updateUserRole(userId, role);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Admin Bookings (hire bookings with payment details)
  app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const list = await storage.getAdminBookings();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Admin Gardeners
  app.put("/api/admin/gardeners/:id/verify", requireAdmin, async (req, res) => {
    try {
      const gardenerId = Number(req.params.id);
      const { verified } = req.body;
      const updated = await storage.updateGardenerVerification(gardenerId, verified);
      if (!updated) {
        return res.status(404).json({ message: "Gardener not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Admin Plants
  app.put("/api/admin/plants/:id", requireAdmin, async (req, res) => {
    try {
      const plantId = Number(req.params.id);
      const updates = req.body;
      const updated = await storage.updatePlant(plantId, updates);
      if (!updated) {
        return res.status(404).json({ message: "Plant not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  app.delete("/api/admin/plants/:id", requireAdmin, async (req, res) => {
    try {
      const plantId = Number(req.params.id);
      await storage.deletePlant(plantId);
      res.json({ message: "Plant deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Admin Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      // For now, return default settings
      // In future, can store in database
      res.json({
        adminName: "Admin",
        supportEmail: "support@smartplantcare.com",
        notificationPreference: "enabled",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      // For now, just return success
      // In future, can store in database
      res.json({ message: "Settings saved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Admin Articles (Blog)
  app.get("/api/admin/articles", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getAllArticles().catch(() => []);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to load articles" });
    }
  });

  app.post("/api/admin/articles", requireAdmin, async (req, res) => {
    try {
      const user = req.user as { id: number };
      const { title, slug, content, imageUrl, status } = req.body;
      if (!title || !slug || !content) {
        return res.status(400).json({ message: "Title, slug, and content are required" });
      }
      const article = await storage.createArticle({
        title,
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        content,
        imageUrl: imageUrl || null,
        authorId: user.id,
        status: status === "published" ? "published" : "draft",
      });
      res.status(201).json(article);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to create article" });
    }
  });

  app.put("/api/admin/articles/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, slug, content, imageUrl, status } = req.body;
      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (slug !== undefined) updates.slug = slug.trim().toLowerCase().replace(/\s+/g, "-");
      if (content !== undefined) updates.content = content;
      if (imageUrl !== undefined) updates.imageUrl = imageUrl;
      if (status !== undefined) updates.status = status === "published" ? "published" : "draft";
      const updated = await storage.updateArticle(id, updates as any);
      if (!updated) return res.status(404).json({ message: "Article not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to update article" });
    }
  });

  app.delete("/api/admin/articles/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteArticle(id);
      if (!deleted) return res.status(404).json({ message: "Article not found" });
      res.json({ message: "Article deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to delete article" });
    }
  });

  return httpServer;
}
