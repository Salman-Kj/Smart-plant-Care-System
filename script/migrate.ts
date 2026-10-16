/**
 * Run pending migrations (0007, 0008) to add missing columns.
 * Usage: npm run db:migrate (from project root)
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const migrationsDir = join(projectRoot, "migrations");

const PENDING_MIGRATIONS = [
  "0007_add_booking_payment_columns.sql",
  "0008_add_user_reset_token.sql",
  "0009_notifications.sql",
  "0010_wishlist.sql",
  "0011_plant_reviews.sql",
  "0012_gardener_reviews.sql",
  "0013_contact_messages.sql",
  "0016_newsletter_subscribers.sql",
  "0017_catalog_wishlist.sql",
];

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set. Create a .env file with DATABASE_URL.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    for (const file of PENDING_MIGRATIONS) {
      const migrationPath = join(migrationsDir, file);
      try {
        const sql = readFileSync(migrationPath, "utf-8");
        await client.query(sql);
        console.log(`✅ ${file} applied successfully.`);
      } catch (err) {
        console.error(`❌ Migration failed (${file}):`, err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
