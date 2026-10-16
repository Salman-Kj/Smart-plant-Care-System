import { eq } from "drizzle-orm";
import { db } from "./db";
import { gardeners } from "@shared/schema";

/**
 * One-time patch: update gardener hourly rates 25 → 250 and 35 → 350.
 * Safe to run on every startup (idempotent after first run).
 */
export async function patchGardenerRatesIfNeeded(): Promise<void> {
  try {
    const r25 = await db.update(gardeners).set({ hourlyRate: 250 }).where(eq(gardeners.hourlyRate, 25)).returning({ id: gardeners.id });
    const r35 = await db.update(gardeners).set({ hourlyRate: 350 }).where(eq(gardeners.hourlyRate, 35)).returning({ id: gardeners.id });
    if (r25.length > 0 || r35.length > 0) {
      console.log(`[patch-gardeners] Updated rates: ${r25.length} gardener(s) 25→250, ${r35.length} gardener(s) 35→350`);
    }
  } catch (e) {
    console.warn("[patch-gardeners] Skipped or failed:", (e as Error).message);
  }
}
