-- Add description column to pwos and swos tables
-- These were added to schema.prisma but omitted from the original refactor_bigint_pks migration

ALTER TABLE "pwos" ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "swos" ADD COLUMN IF NOT EXISTS "description" TEXT;
