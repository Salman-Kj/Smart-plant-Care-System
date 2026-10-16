-- Newsletter email signup (footer)
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_idx" ON "newsletter_subscribers" ("email");
