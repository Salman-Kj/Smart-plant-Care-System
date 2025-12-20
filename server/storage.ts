import { db } from "./db";
import {
  users, plants, gardeners, orders, diseaseLogs,
  type User, type InsertUser, type Plant, type InsertPlant,
  type Gardener, type InsertGardener, type Order, type InsertOrder,
  type DiseaseLog, type InsertDiseaseLog
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Plants
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;

  // Gardeners
  getGardeners(): Promise<Gardener[]>;
  getGardener(id: number): Promise<Gardener | undefined>;
  createGardener(gardener: InsertGardener): Promise<Gardener>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>; // User's orders
  getAllOrders(): Promise<Order[]>; // Admin

  // Disease Logs
  logDisease(log: InsertDiseaseLog): Promise<DiseaseLog>;
  getDiseaseLogs(userId: number): Promise<DiseaseLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Plants
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant;
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }

  // Gardeners
  async getGardeners(): Promise<Gardener[]> {
    return await db.select().from(gardeners);
  }

  async getGardener(id: number): Promise<Gardener | undefined> {
    const [gardener] = await db.select().from(gardeners).where(eq(gardeners.id, id));
    return gardener;
  }

  async createGardener(gardener: InsertGardener): Promise<Gardener> {
    const [newGardener] = await db.insert(gardeners).values(gardener).returning();
    return newGardener;
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

  // Disease Logs
  async logDisease(log: InsertDiseaseLog): Promise<DiseaseLog> {
    const [newLog] = await db.insert(diseaseLogs).values(log).returning();
    return newLog;
  }

  async getDiseaseLogs(userId: number): Promise<DiseaseLog[]> {
    return await db.select().from(diseaseLogs).where(eq(diseaseLogs.userId, userId));
  }
}

export const storage = new DatabaseStorage();
