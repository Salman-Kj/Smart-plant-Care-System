import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Test database connection
export async function testDatabaseConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connection successful!");
    console.log(`   Connected to: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")}`);
    console.log(`   Server time: ${result.rows[0].now}`);
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")}`);
    throw error;
  }
}
