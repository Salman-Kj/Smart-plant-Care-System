CREATE TABLE IF NOT EXISTS "bookings" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users" ("id"),
  "gardener_id" integer NOT NULL REFERENCES "gardeners" ("id"),
  "service_date" date NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now()
);
