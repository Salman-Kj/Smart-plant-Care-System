import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // 'user', 'gardener', 'admin'
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  profileImage: text("profile_image"),
  status: text("status").default("active").notNull(), // 'active', 'blocked'
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// === PLANTS (Buy/Sell) ===
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents or base unit
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // 'indoor', 'outdoor', etc.
  sellerId: integer("seller_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlantSchema = createInsertSchema(plants).omit({ id: true, createdAt: true });

// === GARDENERS (Hire) ===
export const gardeners = pgTable("gardeners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  experience: text("experience").notNull(), // e.g., "5 years"
  hourlyRate: integer("hourly_rate").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").default(5),
  available: boolean("available").default(true),
  verified: boolean("verified").default(false), // Admin verification
  phone: text("phone"),
  bio: text("bio"),
  paymentMethod: text("payment_method"), // 'bank' | 'jazzcash' | 'easypaisa' | 'other'
  paymentDetail: text("payment_detail"), // account number or mobile number
  accountTitle: text("account_title"), // bank account holder name
});

export const insertGardenerSchema = createInsertSchema(gardeners).omit({ id: true });

// === BOOKINGS (Gardener requests) ===
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gardenerId: integer("gardener_id").references(() => users.id).notNull(),
  userName: text("user_name"),
  userEmail: text("user_email"),
  userPhone: text("user_phone"),
  userAddress: text("user_address"),
  serviceDate: timestamp("service_date").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'rejected', 'completed'
  amount: integer("amount").default(0).notNull(), // total amount (e.g. rupees) for gardener
  hours: integer("hours").default(2).notNull(), // estimated hours for amount calculation
  paymentStatus: text("payment_status").default("unpaid").notNull(), // 'unpaid' | 'paid' | 'refunded'
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"), // 'card' | 'cash' | 'wallet' | 'cod'
  gardenerPayoutStatus: text("gardener_payout_status").default("pending").notNull(), // 'pending' | 'released' | 'paid_out'
  gardenerPaidAt: timestamp("gardener_paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });

// === MESSAGES (User-Gardener communication) ===
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === ORDERS ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'dispatched' | 'delivered' | 'completed'
  address: text("address").notNull(),
  items: jsonb("items").notNull(), // Store simplified items array [{ plantId, quantity, price }]
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });

// === DISEASE LOGS (Detection History) ===
export const diseaseLogs = pgTable("disease_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageName: text("image_name"),
  imageUrl: text("image_url").notNull(),
  diseaseName: text("disease_name").notNull(),
  confidence: integer("confidence"),
  cause: text("cause"),
  solution: text("solution"),
  medicine: text("medicine"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiseaseLogSchema = createInsertSchema(diseaseLogs).omit({ id: true, createdAt: true });


// === CART ===
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plantId: integer("plant_id").references(() => plants.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

// === ARTICLES (Blog) ===
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  authorId: integer("author_id").references(() => users.id),
  status: text("status").default("draft").notNull(), // 'draft' | 'published'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, updatedAt: true });

// === NOTIFICATIONS ===
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // 'new_order' | 'new_booking'
  relatedId: integer("related_id"), // order id or booking id
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// === WISHLIST ===
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plantId: integer("plant_id").references(() => plants.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWishlistSchema = createInsertSchema(wishlist).omit({ id: true, createdAt: true });

// === CATALOG WISHLIST (demo items: type + key e.g. plants, indoor-1) ===
export const catalogWishlist = pgTable("catalog_wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemType: text("item_type").notNull(),
  itemKey: text("item_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCatalogWishlistSchema = createInsertSchema(catalogWishlist).omit({ id: true, createdAt: true });

// === PLANT REVIEWS ===
export const plantReviews = pgTable("plant_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plantId: integer("plant_id").references(() => plants.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlantReviewSchema = createInsertSchema(plantReviews).omit({ id: true, createdAt: true });

// === GARDENER REVIEWS ===
export const gardenerReviews = pgTable("gardener_reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  gardenerId: integer("gardener_id").references(() => gardeners.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGardenerReviewSchema = createInsertSchema(gardenerReviews).omit({ id: true, createdAt: true });

// === CONTACT MESSAGES ===
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });

// === NEWSLETTER SUBSCRIBERS ===
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Gardener = typeof gardeners.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Order = typeof orders.$inferSelect;
export type DiseaseLog = typeof diseaseLogs.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertGardener = z.infer<typeof insertGardenerSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertDiseaseLog = z.infer<typeof insertDiseaseLogSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type CatalogWishlistItem = typeof catalogWishlist.$inferSelect;
export type InsertCatalogWishlistItem = z.infer<typeof insertCatalogWishlistSchema>;
export type PlantReview = typeof plantReviews.$inferSelect;
export type InsertPlantReview = z.infer<typeof insertPlantReviewSchema>;
export type GardenerReview = typeof gardenerReviews.$inferSelect;
export type InsertGardenerReview = z.infer<typeof insertGardenerReviewSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type DiseaseResult = {
  disease: string;
  cause: string;
  solution: string;
  medicine: string;
};
