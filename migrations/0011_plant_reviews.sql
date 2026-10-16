-- Plant reviews: rating (1-5) and optional comment per user per plant
CREATE TABLE IF NOT EXISTS "plant_reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "plant_id" integer NOT NULL REFERENCES "plants"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" text,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "plant_reviews_user_plant_idx" ON "plant_reviews" ("user_id", "plant_id");
CREATE INDEX IF NOT EXISTS "plant_reviews_plant_id_idx" ON "plant_reviews" ("plant_id");
