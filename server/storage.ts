import { db } from "./db";
import {
  users,
  plants,
  gardeners,
  orders,
  diseaseLogs,
  cartItems,
  bookings,
  messages,
  type User,
  type InsertUser,
  type Plant,
  type InsertPlant,
  type Gardener,
  type InsertGardener,
  type Order,
  type InsertOrder,
  type DiseaseLog,
  type InsertDiseaseLog,
  type CartItem,
  type InsertCartItem,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
  articles,
  type Article,
  type InsertArticle,
  notifications,
  type Notification,
  type InsertNotification,
  wishlist,
  type WishlistItem,
  type InsertWishlistItem,
  catalogWishlist,
  type CatalogWishlistItem,
  type InsertCatalogWishlistItem,
  plantReviews,
  type PlantReview,
  type InsertPlantReview,
  gardenerReviews,
  type GardenerReview,
  type InsertGardenerReview,
  contactMessages,
  type ContactMessage,
  type InsertContactMessage,
  newsletterSubscribers,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
} from "@shared/schema";
import { eq, and, inArray, desc, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  setUserResetToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearUserResetToken(userId: number): Promise<void>;
  getUsersByRole(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>; // Admin
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(
    userId: number,
    data: { fullName?: string; phone?: string | null; address?: string | null; profileImage?: string | null }
  ): Promise<User | undefined>;
  updateUserPassword(userId: number, password: string): Promise<User | undefined>;
  updateUserStatus(userId: number, status: string): Promise<User | undefined>; // Admin: 'active' | 'blocked'
  updateUserRole(userId: number, role: string): Promise<User | undefined>; // Admin

  // Plants
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  getPlantByNameCategory(name: string, category: string): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined>; // Admin
  deletePlant(id: number): Promise<boolean>; // Admin

  // Gardeners
  getGardeners(): Promise<Gardener[]>;
  getGardener(id: number): Promise<Gardener | undefined>;
  getGardenerByUserId(userId: number): Promise<Gardener | undefined>;
  updateGardenerUserId(gardenerId: number, userId: number): Promise<Gardener | undefined>;
  createGardener(gardener: InsertGardener): Promise<Gardener>;
  updateGardener(gardenerId: number, data: { paymentMethod?: string | null; paymentDetail?: string | null; accountTitle?: string | null }): Promise<Gardener | undefined>;
  updateGardenerVerification(gardenerId: number, verified: boolean): Promise<Gardener | undefined>; // Admin

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsForGardener(gardenerId: number): Promise<(Booking & { userName: string })[]>;
  getBookingsForUser(userId: number): Promise<(Booking & { gardenerName: string | null; gardenerTableId: number | null })[]>;
  getAllBookings(): Promise<Booking[]>; // Admin
  getAdminBookings(): Promise<(Booking & { userName: string | null; gardenerName: string | null; gardenerPaymentMethod: string | null; gardenerPaymentDetail: string | null; gardenerAccountTitle: string | null })[]>;
  updateBookingStatus(bookingId: number, gardenerId: number, status: string): Promise<Booking | undefined>;
  updateBookingGardenerId(oldGardenerId: number, newUserId: number): Promise<number>;
  getBookingForUser(bookingId: number, userId: number): Promise<Booking | undefined>;
  getBooking(bookingId: number): Promise<Booking | undefined>;
  setBookingPaymentMethod(bookingId: number, userId: number, paymentMethod: string): Promise<Booking | undefined>;
  markBookingPaid(bookingId: number, userId: number, paymentMethod: string): Promise<Booking | undefined>;
  markBookingPaidByGardenerConfirm(bookingId: number): Promise<Booking | undefined>;
  releaseGardenerPayout(bookingId: number): Promise<Booking | undefined>;
  cancelBookingForUser(bookingId: number, userId: number): Promise<boolean>;
  deleteBookingForUser(bookingId: number, userId: number): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>; // User's orders
  getAllOrders(): Promise<Order[]>; // Admin
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>; // Admin

  // Disease Logs
  logDisease(log: InsertDiseaseLog): Promise<DiseaseLog>;
  getDiseaseLogs(userId: number): Promise<DiseaseLog[]>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForBooking(bookingId: number): Promise<(Message & { senderName: string; receiverName: string })[]>;
  getMessagesForUser(userId: number): Promise<(Message & { senderName: string; receiverName: string; bookingId: number })[]>;
  markMessageAsRead(messageId: number, userId: number): Promise<Message | undefined>;

  // Cart
  getCartItems(userId: number): Promise<(CartItem & { plant: Plant })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartQuantity(userId: number, plantId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: number, plantId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Wishlist
  getWishlist(userId: number): Promise<(WishlistItem & { plant: Plant })[]>;
  addToWishlist(userId: number, plantId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: number, plantId: number): Promise<void>;
  isInWishlist(userId: number, plantId: number): Promise<boolean>;

  // Catalog wishlist (demo items: type + key)
  getCatalogWishlist(userId: number): Promise<CatalogWishlistItem[]>;
  addToCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<CatalogWishlistItem>;
  removeFromCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<void>;
  isInCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<boolean>;

  // Plant reviews
  getReviewsForPlant(plantId: number): Promise<(PlantReview & { username: string })[]>;
  createOrUpdatePlantReview(userId: number, plantId: number, rating: number, comment?: string | null): Promise<PlantReview>;
  getUserReviewForPlant(userId: number, plantId: number): Promise<PlantReview | undefined>;

  // Gardener reviews
  getReviewsForGardener(gardenerId: number): Promise<(GardenerReview & { username: string })[]>;
  createGardenerReview(bookingId: number, userId: number, gardenerId: number, rating: number, comment?: string | null): Promise<GardenerReview>;
  getGardenerReviewByBooking(bookingId: number): Promise<GardenerReview | undefined>;

  // Contact & Newsletter
  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  addNewsletterSubscriber(email: string): Promise<NewsletterSubscriber>;

  // Articles (Blog)
  getArticlesPublished(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getAllArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // ... existing methods ...
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) return undefined;
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${normalized}`);
    return user;
  }

  async setUserResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await db.update(users).set({ resetToken: token, resetTokenExpires: expiresAt }).where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    if (!token?.trim()) return undefined;
    const [user] = await db.select().from(users).where(eq(users.resetToken, token.trim()));
    if (!user || !user.resetTokenExpires) return undefined;
    if (new Date() > new Date(user.resetTokenExpires)) return undefined;
    return user;
  }

  async clearUserResetToken(userId: number): Promise<void> {
    await db.update(users).set({ resetToken: null, resetTokenExpires: null }).where(eq(users.id, userId));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(
    userId: number,
    data: { fullName?: string; phone?: string | null; address?: string | null; profileImage?: string | null }
  ): Promise<User | undefined> {
    const updates: Partial<typeof users.$inferInsert> = {};
    if (data.fullName !== undefined) updates.fullName = data.fullName;
    if (data.phone !== undefined) updates.phone = data.phone ?? null;
    if (data.address !== undefined) updates.address = data.address ?? null;
    if (data.profileImage !== undefined) updates.profileImage = data.profileImage ?? null;

    if (Object.keys(updates).length === 0) {
      return await this.getUser(userId);
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserPassword(userId: number, password: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ password })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserStatus(userId: number, status: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ status: status as "active" | "blocked" })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Plants
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant;
  }

  async getPlantByNameCategory(name: string, category: string): Promise<Plant | undefined> {
    const [plant] = await db
      .select()
      .from(plants)
      .where(and(eq(plants.name, name), eq(plants.category, category)));
    return plant;
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }

  async updatePlant(id: number, plant: Partial<InsertPlant>): Promise<Plant | undefined> {
    const [updated] = await db
      .update(plants)
      .set(plant)
      .where(eq(plants.id, id))
      .returning();
    return updated;
  }

  async deletePlant(id: number): Promise<boolean> {
    await db.delete(plants).where(eq(plants.id, id));
    return true;
  }

  // Gardeners
  async getGardeners(): Promise<Gardener[]> {
    return await db.select().from(gardeners);
  }

  async getGardener(id: number): Promise<Gardener | undefined> {
    const [gardener] = await db.select().from(gardeners).where(eq(gardeners.id, id));
    return gardener;
  }

  async getGardenerByUserId(userId: number): Promise<Gardener | undefined> {
    const [gardener] = await db.select().from(gardeners).where(eq(gardeners.userId, userId));
    return gardener;
  }

  async updateGardenerUserId(
    gardenerId: number,
    userId: number
  ): Promise<Gardener | undefined> {
    const [updated] = await db
      .update(gardeners)
      .set({ userId })
      .where(eq(gardeners.id, gardenerId))
      .returning();
    return updated;
  }

  async createGardener(gardener: InsertGardener): Promise<Gardener> {
    const [newGardener] = await db.insert(gardeners).values(gardener).returning();
    return newGardener;
  }

  async updateGardener(
    gardenerId: number,
    data: { paymentMethod?: string | null; paymentDetail?: string | null; accountTitle?: string | null }
  ): Promise<Gardener | undefined> {
    const [updated] = await db
      .update(gardeners)
      .set(data)
      .where(eq(gardeners.id, gardenerId))
      .returning();
    return updated;
  }

  async updateGardenerVerification(gardenerId: number, verified: boolean): Promise<Gardener | undefined> {
    const [updated] = await db
      .update(gardeners)
      .set({ verified })
      .where(eq(gardeners.id, gardenerId))
      .returning();
    return updated;
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getAdminBookings(): Promise<
    (Booking & {
      userName: string | null;
      gardenerName: string | null;
      gardenerPaymentMethod: string | null;
      gardenerPaymentDetail: string | null;
      gardenerAccountTitle: string | null;
    })[]
  > {
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    const userIds = Array.from(new Set(allBookings.map((b) => b.userId)));
    const gardenerIds = Array.from(new Set(allBookings.map((b) => b.gardenerId)));
    const usersList = userIds.length ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
    const gardenersById = await db.select().from(gardeners).where(inArray(gardeners.id, gardenerIds));
    const gardenersByUserId = await db.select().from(gardeners).where(inArray(gardeners.userId, gardenerIds));
    const userMap = new Map(usersList.map((u) => [u.id, u]));
    const gardenerByIdMap = new Map(gardenersById.map((g) => [g.id, g]));
    const gardenerByUserIdMap = new Map(
      gardenersByUserId.filter((g) => g.userId != null).map((g) => [g.userId as number, g])
    );

    return allBookings.map((booking) => {
      const user = userMap.get(booking.userId);
      const gardener =
        gardenerByIdMap.get(booking.gardenerId) ?? gardenerByUserIdMap.get(booking.gardenerId);
      const userName = user ? (user.fullName || user.username) : booking.userName ?? null;
      const gardenerName = gardener?.name ?? null;
      return {
        ...booking,
        userName,
        gardenerName,
        gardenerPaymentMethod: gardener?.paymentMethod ?? null,
        gardenerPaymentDetail: gardener?.paymentDetail ?? null,
        gardenerAccountTitle: gardener?.accountTitle ?? null,
      };
    });
  }

  async getBookingsForGardener(
    gardenerId: number
  ): Promise<(Booking & { userName: string })[]> {
    // First try with user ID (gardenerId parameter)
    let results = await db
      .select({
        booking: bookings,
        user: users,
      })
      .from(bookings)
      .where(eq(bookings.gardenerId, gardenerId))
      .innerJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt));

    // If no results, check if gardenerId is a user ID and try with gardener table ID
    if (results.length === 0) {
      const gardener = await db.select().from(gardeners).where(eq(gardeners.userId, gardenerId)).limit(1);
      if (gardener.length > 0) {
        // Try with gardener table ID
        results = await db
          .select({
            booking: bookings,
            user: users,
          })
          .from(bookings)
          .where(eq(bookings.gardenerId, gardener[0].id))
          .innerJoin(users, eq(bookings.userId, users.id))
          .orderBy(desc(bookings.createdAt));
        
        // Update all found bookings to use user ID for consistency
        if (results.length > 0) {
          const bookingIds = results.map(r => r.booking.id);
          await db.update(bookings)
            .set({ gardenerId })
            .where(inArray(bookings.id, bookingIds));
        }
      }
    }

    return results.map(({ booking, user }) => ({
      ...booking,
      userName: booking.userName || user.fullName || user.username,
    }));
  }

  async getBookingsForUser(
    userId: number
  ): Promise<(Booking & { gardenerName: string | null; gardenerTableId: number | null })[]> {
    const results = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
    const gardenerIds = results.map((booking) => booking.gardenerId);
    const uniqueIds = Array.from(new Set(gardenerIds));
    const byId = uniqueIds.length
      ? await db.select().from(gardeners).where(inArray(gardeners.id, uniqueIds))
      : [];
    const byUserId = uniqueIds.length
      ? await db.select().from(gardeners).where(inArray(gardeners.userId, uniqueIds))
      : [];
    const byIdMap = new Map(byId.map((entry) => [entry.id, entry.name]));
    const byUserIdMap = new Map(
      byUserId.map((entry) => [entry.userId as number, entry.name])
    );
    const byUserIdToTableId = new Map(
      byUserId.map((entry) => [entry.userId as number, entry.id])
    );
    const byIdRateMap = new Map(byId.map((entry) => [entry.id, entry.hourlyRate]));
    const byUserIdRateMap = new Map(
      byUserId.map((entry) => [entry.userId as number, entry.hourlyRate])
    );

    return results.map((booking) => {
      const gardenerHourlyRate =
        byIdRateMap.get(booking.gardenerId) ??
        byUserIdRateMap.get(booking.gardenerId) ??
        0;
      const displayAmount =
        booking.amount != null && booking.amount > 0
          ? booking.amount
          : gardenerHourlyRate * (booking.hours ?? 2);
      return {
        ...booking,
        amount: displayAmount,
        gardenerName:
          byIdMap.get(booking.gardenerId) ||
          byUserIdMap.get(booking.gardenerId) ||
          null,
        gardenerTableId: byUserIdToTableId.get(booking.gardenerId) ?? byId.find((g) => g.id === booking.gardenerId)?.id ?? null,
      };
    });
  }

  async updateBookingStatus(
    bookingId: number,
    gardenerId: number,
    status: string
  ): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(and(eq(bookings.id, bookingId), eq(bookings.gardenerId, gardenerId)))
      .returning();
    return updated;
  }

  async updateBookingGardenerId(oldGardenerId: number, newUserId: number): Promise<number> {
    const updated = await db
      .update(bookings)
      .set({ gardenerId: newUserId })
      .where(eq(bookings.gardenerId, oldGardenerId))
      .returning({ id: bookings.id });
    return updated.length;
  }

  async getBookingForUser(bookingId: number, userId: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
    return booking;
  }

  async getBooking(bookingId: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    return booking;
  }

  async setBookingPaymentMethod(bookingId: number, userId: number, paymentMethod: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
    if (!booking) return undefined;
    const [updated] = await db
      .update(bookings)
      .set({ paymentMethod: paymentMethod || null })
      .where(eq(bookings.id, bookingId))
      .returning();
    return updated;
  }

  async markBookingPaid(bookingId: number, userId: number, paymentMethod: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
    if (!booking) return undefined;
    const [updated] = await db
      .update(bookings)
      .set({
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentMethod: paymentMethod || null,
      })
      .where(eq(bookings.id, bookingId))
      .returning();
    return updated;
  }

  async markBookingPaidByGardenerConfirm(bookingId: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking || booking.paymentStatus === "paid") return undefined;
    const [updated] = await db
      .update(bookings)
      .set({
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentMethod: booking.paymentMethod || "cod",
      })
      .where(eq(bookings.id, bookingId))
      .returning();
    return updated;
  }

  async releaseGardenerPayout(bookingId: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    if (!booking || booking.paymentStatus !== "paid") return undefined;
    const [updated] = await db
      .update(bookings)
      .set({
        gardenerPayoutStatus: "released",
        gardenerPaidAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();
    return updated;
  }

  async cancelBookingForUser(bookingId: number, userId: number): Promise<boolean> {
    const updated = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
      .returning({ id: bookings.id });
    return updated.length > 0;
  }

  async deleteBookingForUser(bookingId: number, userId: number): Promise<boolean> {
    const deleted = await db
      .delete(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
      .returning({ id: bookings.id });
    return deleted.length > 0;
  }


  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Disease Logs
  async logDisease(log: InsertDiseaseLog): Promise<DiseaseLog> {
    const [newLog] = await db.insert(diseaseLogs).values(log).returning();
    return newLog;
  }

  async getDiseaseLogs(userId: number): Promise<DiseaseLog[]> {
    return await db
      .select()
      .from(diseaseLogs)
      .where(eq(diseaseLogs.userId, userId))
      .orderBy(desc(diseaseLogs.createdAt));
  }

  // Cart
  async getCartItems(userId: number): Promise<(CartItem & { plant: Plant })[]> {
    const results = await db.select({
      cartItem: cartItems,
      plant: plants
    })
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
    .innerJoin(plants, eq(cartItems.plantId, plants.id));

    return results.map(r => ({ ...r.cartItem, plant: r.plant }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db.select().from(cartItems).where(
      and(eq(cartItems.userId, item.userId), eq(cartItems.plantId, item.plantId))
    );

    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartQuantity(userId: number, plantId: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.plantId, plantId)))
      .returning();
    return updated;
  }

  async removeFromCart(userId: number, plantId: number): Promise<void> {
    await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.plantId, plantId)));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // === WISHLIST ===
  async getWishlist(userId: number): Promise<(WishlistItem & { plant: Plant })[]> {
    const results = await db
      .select({ wishlistItem: wishlist, plant: plants })
      .from(wishlist)
      .where(eq(wishlist.userId, userId))
      .innerJoin(plants, eq(wishlist.plantId, plants.id))
      .orderBy(desc(wishlist.createdAt));
    return results.map((r) => ({ ...r.wishlistItem, plant: r.plant }));
  }

  async addToWishlist(userId: number, plantId: number): Promise<WishlistItem> {
    const [existing] = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.plantId, plantId)));
    if (existing) return existing;
    const [row] = await db.insert(wishlist).values({ userId, plantId }).returning();
    return row;
  }

  async removeFromWishlist(userId: number, plantId: number): Promise<void> {
    await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.plantId, plantId)));
  }

  async isInWishlist(userId: number, plantId: number): Promise<boolean> {
    const [row] = await db
      .select({ id: wishlist.id })
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.plantId, plantId)));
    return !!row;
  }

  // === CATALOG WISHLIST ===
  async getCatalogWishlist(userId: number): Promise<CatalogWishlistItem[]> {
    return await db
      .select()
      .from(catalogWishlist)
      .where(eq(catalogWishlist.userId, userId))
      .orderBy(desc(catalogWishlist.createdAt))
      .limit(100);
  }

  async addToCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<CatalogWishlistItem> {
    const [existing] = await db
      .select()
      .from(catalogWishlist)
      .where(
        and(
          eq(catalogWishlist.userId, userId),
          eq(catalogWishlist.itemType, itemType),
          eq(catalogWishlist.itemKey, itemKey)
        )
      );
    if (existing) return existing;
    const [row] = await db
      .insert(catalogWishlist)
      .values({ userId, itemType, itemKey })
      .returning();
    return row;
  }

  async removeFromCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<void> {
    await db
      .delete(catalogWishlist)
      .where(
        and(
          eq(catalogWishlist.userId, userId),
          eq(catalogWishlist.itemType, itemType),
          eq(catalogWishlist.itemKey, itemKey)
        )
      );
  }

  async isInCatalogWishlist(userId: number, itemType: string, itemKey: string): Promise<boolean> {
    const [row] = await db
      .select({ id: catalogWishlist.id })
      .from(catalogWishlist)
      .where(
        and(
          eq(catalogWishlist.userId, userId),
          eq(catalogWishlist.itemType, itemType),
          eq(catalogWishlist.itemKey, itemKey)
        )
      );
    return !!row;
  }

  // === PLANT REVIEWS ===
  async getReviewsForPlant(plantId: number): Promise<(PlantReview & { username: string })[]> {
    const rows = await db
      .select({
        id: plantReviews.id,
        userId: plantReviews.userId,
        plantId: plantReviews.plantId,
        rating: plantReviews.rating,
        comment: plantReviews.comment,
        createdAt: plantReviews.createdAt,
        username: users.username,
      })
      .from(plantReviews)
      .innerJoin(users, eq(plantReviews.userId, users.id))
      .where(eq(plantReviews.plantId, plantId))
      .orderBy(desc(plantReviews.createdAt))
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      plantId: r.plantId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      username: r.username,
    }));
  }

  async createOrUpdatePlantReview(
    userId: number,
    plantId: number,
    rating: number,
    comment?: string | null
  ): Promise<PlantReview> {
    const [existing] = await db
      .select()
      .from(plantReviews)
      .where(and(eq(plantReviews.userId, userId), eq(plantReviews.plantId, plantId)));
    if (existing) {
      const [updated] = await db
        .update(plantReviews)
        .set({ rating, comment: comment ?? existing.comment })
        .where(eq(plantReviews.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(plantReviews)
      .values({ userId, plantId, rating, comment })
      .returning();
    return created;
  }

  async getUserReviewForPlant(userId: number, plantId: number): Promise<PlantReview | undefined> {
    const [row] = await db
      .select()
      .from(plantReviews)
      .where(and(eq(plantReviews.userId, userId), eq(plantReviews.plantId, plantId)));
    return row;
  }

  // === GARDENER REVIEWS ===
  async getReviewsForGardener(gardenerId: number): Promise<(GardenerReview & { username: string })[]> {
    const rows = await db
      .select({
        id: gardenerReviews.id,
        bookingId: gardenerReviews.bookingId,
        userId: gardenerReviews.userId,
        gardenerId: gardenerReviews.gardenerId,
        rating: gardenerReviews.rating,
        comment: gardenerReviews.comment,
        createdAt: gardenerReviews.createdAt,
        username: users.username,
      })
      .from(gardenerReviews)
      .innerJoin(users, eq(gardenerReviews.userId, users.id))
      .where(eq(gardenerReviews.gardenerId, gardenerId))
      .orderBy(desc(gardenerReviews.createdAt))
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      userId: r.userId,
      gardenerId: r.gardenerId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      username: r.username,
    }));
  }

  async createGardenerReview(
    bookingId: number,
    userId: number,
    gardenerId: number,
    rating: number,
    comment?: string | null
  ): Promise<GardenerReview> {
    const [created] = await db
      .insert(gardenerReviews)
      .values({ bookingId, userId, gardenerId, rating, comment })
      .returning();
    return created;
  }

  async getGardenerReviewByBooking(bookingId: number): Promise<GardenerReview | undefined> {
    const [row] = await db
      .select()
      .from(gardenerReviews)
      .where(eq(gardenerReviews.bookingId, bookingId));
    return row;
  }

  // === CONTACT & NEWSLETTER ===
  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const [row] = await db.insert(contactMessages).values(data).returning();
    return row;
  }

  async addNewsletterSubscriber(email: string): Promise<NewsletterSubscriber> {
    const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    if (existing) return existing;
    const [row] = await db.insert(newsletterSubscribers).values({ email }).returning();
    return row;
  }

  // === MESSAGES ===
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesForBooking(bookingId: number): Promise<(Message & { senderName: string; receiverName: string })[]> {
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(desc(messages.createdAt));

    const userIds = Array.from(new Set(allMessages.flatMap((m) => [m.senderId, m.receiverId])));
    const usersList = userIds.length > 0 ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
    const userMap = new Map(usersList.map((u) => [u.id, u.fullName || u.username]));

    return allMessages.map((msg) => ({
      ...msg,
      senderName: userMap.get(msg.senderId) || "Unknown",
      receiverName: userMap.get(msg.receiverId) || "Unknown",
    }));
  }

  async getMessagesForUser(userId: number): Promise<(Message & { senderName: string; receiverName: string; bookingId: number })[]> {
    const allMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const userIds = Array.from(new Set(allMessages.flatMap((m) => [m.senderId, m.receiverId])));
    const usersList = userIds.length > 0 ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
    const userMap = new Map(usersList.map((u) => [u.id, u.fullName || u.username]));

    return allMessages.map((msg) => ({
      ...msg,
      senderName: userMap.get(msg.senderId) || "Unknown",
      receiverName: userMap.get(msg.receiverId) || "Unknown",
    }));
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.id, messageId), eq(messages.receiverId, userId)))
      .returning();
    return updated;
  }

  // === NOTIFICATIONS ===
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [row] = await db.insert(notifications).values(notification).returning();
    return row;
  }

  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadCountForUser(userId: number): Promise<number> {
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return rows.length;
  }

  async markNotificationRead(notificationId: number, userId: number): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return updated;
  }

  // === ARTICLES ===
  async getArticlesPublished(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [a] = await db.select().from(articles).where(eq(articles.id, id));
    return a;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [a] = await db.select().from(articles).where(eq(articles.slug, slug));
    return a;
  }

  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
