-- Contact form submissions (guest or logged-in)
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "subject" text,
  "message" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" ON "contact_messages" ("created_at");
