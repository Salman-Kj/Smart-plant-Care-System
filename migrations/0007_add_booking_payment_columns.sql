-- Add payment and amount columns to bookings (required by schema and getBookingsForUser)
ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "amount" integer NOT NULL DEFAULT 0;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "hours" integer NOT NULL DEFAULT 2;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "payment_status" text NOT NULL DEFAULT 'unpaid';

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "paid_at" timestamp;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "payment_method" text;

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "gardener_payout_status" text NOT NULL DEFAULT 'pending';

ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "gardener_paid_at" timestamp;
