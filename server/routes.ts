import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import passport from "passport";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  // Serve uploaded files (if any were persisted to disk, but we are using memory/base64 mostly)
  // For this demo, we'll assume image URLs are external or handled via simple strings
  
  // === AUTH ===
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
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
    const authMiddleware = passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
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

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
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

  app.post(api.plants.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.plants.create.input.parse(req.body);
      const plant = await storage.createPlant({ ...input, sellerId: (req.user as any).id });
      res.status(201).json(plant);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === GARDENERS ===
  app.get(api.gardeners.list.path, async (req, res) => {
    const gardeners = await storage.getGardeners();
    res.json(gardeners);
  });

  app.post(api.gardeners.hire.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // In a real app, this would create a booking record
    res.json({ message: "Hire request sent successfully", bookingId: Date.now() });
  });

  // === DISEASE DETECTION ===
  app.post(api.disease.detect.path, async (req, res) => {
    // Simulated AI Logic
    // If filename or selected option contains “leaf spot” → show Leaf Spot disease
    // If “yellow” → Nitrogen deficiency
    // If “brown” → Fungal infection
    
    const { imageName, imageUrl } = req.body;
    const lowerName = (imageName || "").toLowerCase();
    const lowerUrl = (imageUrl || "").toLowerCase();
    
    let result = {
      name: "Healthy",
      cause: "N/A",
      solution: "Continue regular care.",
      medicine: "None"
    };

    if (lowerName.includes("leaf spot") || lowerUrl.includes("leaf-spot")) {
      result = {
        name: "Leaf Spot",
        cause: "Fungal or bacterial infection.",
        solution: "Remove infected leaves, improve air circulation.",
        medicine: "Copper-based fungicide"
      };
    } else if (lowerName.includes("yellow") || lowerUrl.includes("yellow")) {
      result = {
        name: "Nitrogen Deficiency",
        cause: "Lack of nitrogen in soil.",
        solution: "Apply nitrogen-rich fertilizer.",
        medicine: "NPK Fertilizer (High N)"
      };
    } else if (lowerName.includes("brown") || lowerUrl.includes("brown")) {
      result = {
        name: "Fungal Infection",
        cause: "Overwatering or humidity.",
        solution: "Reduce watering, apply fungicide.",
        medicine: "Organic Fungicide"
      };
    }

    // Log if user is logged in
    if (req.isAuthenticated()) {
      await storage.logDisease({
        userId: (req.user as any).id,
        imageUrl: imageUrl,
        imageName: imageName || "Uploaded Image",
        diseaseName: result.name,
        confidence: 95
      });
    }

    res.json(result);
  });
  
  app.get(api.disease.history.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const logs = await storage.getDiseaseLogs((req.user as any).id);
    res.json(logs);
  });

  // === ORDERS ===
  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    if (user.role === 'admin') {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrders(user.id);
      res.json(orders);
    }
  });

  // SEED DATA
  // Check if gardeners exist, if not seed them
  const existingGardeners = await storage.getGardeners();
  if (existingGardeners.length === 0) {
    await storage.createGardener({
      name: "John Smith",
      experience: "5 years",
      hourlyRate: 25,
      imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
      rating: 5,
      available: true
    });
    await storage.createGardener({
      name: "Sarah Johnson",
      experience: "8 years",
      hourlyRate: 35,
      imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      rating: 4,
      available: true
    });
  }
  
  const existingPlants = await storage.getPlants();
  if (existingPlants.length === 0) {
    // We need a user to assign these to. Create a default admin or seller if none.
    // For now, let's just assume we might have users later or nullable sellerId?
    // Schema has sellerId as nullable reference? No, it's reference.
    // We'll skip seeding plants if no users, or create a system user.
    // Let's create a system user for seeding.
    let systemUser = await storage.getUserByUsername("admin");
    if (!systemUser) {
      const hash = await hashPassword("admin123");
      systemUser = await storage.createUser({
        username: "admin",
        password: hash,
        role: "admin",
        fullName: "System Admin",
        email: "admin@smartplant.com"
      });
    }

    await storage.createPlant({
      name: "Monstera Deliciosa",
      description: "Beautiful swiss cheese plant",
      price: 2500,
      imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
      category: "indoor",
      sellerId: systemUser.id
    });
    await storage.createPlant({
      name: "Snake Plant",
      description: "Hardy and low light tolerant",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1580458148391-7c08344e67cf",
      category: "indoor",
      sellerId: systemUser.id
    });
  }

  return httpServer;
}
