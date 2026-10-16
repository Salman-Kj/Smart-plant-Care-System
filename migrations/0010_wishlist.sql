-- Wishlist: users can save plants for later
CREATE TABLE IF NOT EXISTS "wishlist" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "plant_id" integer NOT NULL REFERENCES "plants"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_user_plant_idx" ON "wishlist" ("user_id", "plant_id");
CREATE INDEX IF NOT EXISTS "wishlist_user_id_idx" ON "wishlist" ("user_id");
