ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "phone" text;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "address" text;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "profile_image" text;
