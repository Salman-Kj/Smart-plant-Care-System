-- Gardener reviews: one review per completed booking
CREATE TABLE IF NOT EXISTS "gardener_reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "booking_id" integer NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "gardener_id" integer NOT NULL REFERENCES "gardeners"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" text,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "gardener_reviews_booking_idx" ON "gardener_reviews" ("booking_id");
CREATE INDEX IF NOT EXISTS "gardener_reviews_gardener_id_idx" ON "gardener_reviews" ("gardener_id");
