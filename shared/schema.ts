import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // 'user' or 'admin'
  fullName: text("full_name"),
  email: text("email"),
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
  name: text("name").notNull(),
  experience: text("experience").notNull(), // e.g., "5 years"
  hourlyRate: integer("hourly_rate").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").default(5),
  available: boolean("available").default(true),
});

export const insertGardenerSchema = createInsertSchema(gardeners).omit({ id: true });

// === ORDERS ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'completed'
  address: text("address").notNull(),
  items: jsonb("items").notNull(), // Store simplified items array [{ plantId, quantity, price }]
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });

// === DISEASE LOGS (Detection History) ===
export const diseaseLogs = pgTable("disease_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageName: text("image_name"), // For simulation logic
  imageUrl: text("image_url").notNull(),
  diseaseName: text("disease_name").notNull(),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDiseaseLogSchema = createInsertSchema(diseaseLogs).omit({ id: true, createdAt: true });


// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Gardener = typeof gardeners.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type DiseaseLog = typeof diseaseLogs.$inferSelect;

export type DiseaseResult = {
  disease: string;
  cause: string;
  solution: string;
  medicine: string;
};
