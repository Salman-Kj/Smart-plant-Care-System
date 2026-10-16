ALTER TABLE "gardeners"
ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users" ("id");

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_gardener_id_fkey";
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_gardener_id_fkey" FOREIGN KEY ("gardener_id") REFERENCES "users" ("id");

UPDATE "bookings"
SET "gardener_id" = "gardeners"."user_id"
FROM "gardeners"
WHERE "bookings"."gardener_id" = "gardeners"."id"
AND "gardeners"."user_id" IS NOT NULL;
