ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "user_name" text;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "user_email" text;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "user_phone" text;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "user_address" text;
