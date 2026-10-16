ALTER TABLE "bookings"
ALTER COLUMN "service_date" TYPE timestamp USING "service_date"::timestamp;
