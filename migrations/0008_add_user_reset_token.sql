-- Add password reset columns to users (for forgot password flow)
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "reset_token" text;

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "reset_token_expires" timestamp;
