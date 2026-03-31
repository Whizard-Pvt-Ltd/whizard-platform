-- Add evidenceType to control_points
ALTER TABLE "control_points" ADD COLUMN "evidence_type" VARCHAR(50);

-- Add new fields to roles
ALTER TABLE "roles" ADD COLUMN "industry_id" TEXT;
ALTER TABLE "roles" ADD COLUMN "seniority_level" VARCHAR(50);
ALTER TABLE "roles" ADD COLUMN "reporting_to" TEXT;
ALTER TABLE "roles" ADD COLUMN "role_criticality_score" INTEGER;
