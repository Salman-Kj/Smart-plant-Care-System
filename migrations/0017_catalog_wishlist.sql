-- Catalog wishlist: demo/catalog items (e.g. plants with string id like indoor-1)
CREATE TABLE IF NOT EXISTS "catalog_wishlist" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "item_type" text NOT NULL,
  "item_key" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "catalog_wishlist_user_type_key_idx" ON "catalog_wishlist" ("user_id", "item_type", "item_key");
CREATE INDEX IF NOT EXISTS "catalog_wishlist_user_id_idx" ON "catalog_wishlist" ("user_id");
