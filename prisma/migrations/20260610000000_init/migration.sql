CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('REPORTER', 'EDITOR');
CREATE TYPE "JobLocationType" AS ENUM ('PHYSICAL', 'REMOTE');
CREATE TYPE "JobStatus" AS ENUM ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "city" TEXT,
  "is_available" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "jobs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_name" TEXT NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "location_type" "JobLocationType" NOT NULL,
  "city" TEXT,
  "status" "JobStatus" NOT NULL DEFAULT 'NEW',
  "reporter_id" UUID,
  "editor_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "jobs_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "jobs_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "jobs_physical_city_check" CHECK (
    ("location_type" = 'PHYSICAL' AND "city" IS NOT NULL) OR
    ("location_type" = 'REMOTE' AND "city" IS NULL)
  )
);

CREATE INDEX "users_role_is_available_idx" ON "users"("role", "is_available");
CREATE INDEX "users_city_idx" ON "users"("city");
CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_location_type_city_idx" ON "jobs"("location_type", "city");
CREATE INDEX "jobs_reporter_id_idx" ON "jobs"("reporter_id");
CREATE INDEX "jobs_editor_id_idx" ON "jobs"("editor_id");
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");
