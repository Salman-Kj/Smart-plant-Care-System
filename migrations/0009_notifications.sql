-- Notifications: in-app alerts for admin (new order) and gardener (new booking)
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "related_id" integer,
  "message" text NOT NULL,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_idx" ON "notifications" ("user_id", "read");
