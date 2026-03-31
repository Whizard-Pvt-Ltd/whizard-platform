-- AlterTable
ALTER TABLE "capability_instances_industry_roles" RENAME CONSTRAINT "role_ci_mappings_pkey" TO "capability_instances_industry_roles_pkey";

-- AlterTable
ALTER TABLE "departments_functional_groups" RENAME CONSTRAINT "department_fg_mappings_pkey" TO "departments_functional_groups_pkey";

-- AlterTable
ALTER TABLE "pwos" RENAME CONSTRAINT "primary_work_objects_pkey" TO "pwos_pkey";

-- AlterTable
ALTER TABLE "swos" RENAME CONSTRAINT "secondary_work_objects_pkey" TO "swos_pkey";

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degree_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "durationYears" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "degree_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_specializations" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collegeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "affiliatedUniversity" TEXT NOT NULL,
    "cityId" TEXT,
    "collegeType" TEXT NOT NULL,
    "establishedYear" INTEGER,
    "description" TEXT,
    "degreesOffered" TEXT,
    "placementHighlights" TEXT,
    "inquiryEmail" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_contacts" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "college_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs_colleges" (
    "collegeId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "clubs_colleges_pkey" PRIMARY KEY ("collegeId","clubId")
);

-- CreateTable
CREATE TABLE "colleges_media_assets" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "mediaRole" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "colleges_media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges_degree_programs" (
    "collegeId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "colleges_degree_programs_pkey" PRIMARY KEY ("collegeId","programId")
);

-- CreateIndex
CREATE INDEX "cities_state_idx" ON "cities"("state");

-- CreateIndex
CREATE INDEX "clubs_tenantId_idx" ON "clubs"("tenantId");

-- CreateIndex
CREATE INDEX "program_specializations_programId_idx" ON "program_specializations"("programId");

-- CreateIndex
CREATE INDEX "media_assets_tenantId_type_idx" ON "media_assets"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_collegeCode_key" ON "colleges"("collegeCode");

-- CreateIndex
CREATE INDEX "colleges_tenantId_status_idx" ON "colleges"("tenantId", "status");

-- CreateIndex
CREATE INDEX "colleges_tenantId_isActive_idx" ON "colleges"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "college_contacts_collegeId_idx" ON "college_contacts"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "college_contacts_collegeId_role_key" ON "college_contacts"("collegeId", "role");

-- CreateIndex
CREATE INDEX "colleges_media_assets_collegeId_mediaRole_idx" ON "colleges_media_assets"("collegeId", "mediaRole");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_media_assets_collegeId_mediaAssetId_mediaRole_key" ON "colleges_media_assets"("collegeId", "mediaAssetId", "mediaRole");

-- RenameForeignKey
ALTER TABLE "capability_instances_industry_roles" RENAME CONSTRAINT "role_ci_mappings_ciId_fkey" TO "capability_instances_industry_roles_ciId_fkey";

-- RenameForeignKey
ALTER TABLE "capability_instances_industry_roles" RENAME CONSTRAINT "role_ci_mappings_roleId_fkey" TO "capability_instances_industry_roles_roleId_fkey";

-- RenameForeignKey
ALTER TABLE "departments_functional_groups" RENAME CONSTRAINT "department_fg_mappings_departmentId_fkey" TO "departments_functional_groups_departmentId_fkey";

-- RenameForeignKey
ALTER TABLE "departments_functional_groups" RENAME CONSTRAINT "department_fg_mappings_fgId_fkey" TO "departments_functional_groups_fgId_fkey";

-- RenameForeignKey
ALTER TABLE "pwos" RENAME CONSTRAINT "primary_work_objects_functionalGroupId_fkey" TO "pwos_functionalGroupId_fkey";

-- RenameForeignKey
ALTER TABLE "swos" RENAME CONSTRAINT "secondary_work_objects_pwoId_fkey" TO "swos_pwoId_fkey";

-- AddForeignKey
ALTER TABLE "program_specializations" ADD CONSTRAINT "program_specializations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "degree_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_contacts" ADD CONSTRAINT "college_contacts_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_colleges" ADD CONSTRAINT "clubs_colleges_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_colleges" ADD CONSTRAINT "clubs_colleges_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_media_assets" ADD CONSTRAINT "colleges_media_assets_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_media_assets" ADD CONSTRAINT "colleges_media_assets_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_degree_programs" ADD CONSTRAINT "colleges_degree_programs_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_degree_programs" ADD CONSTRAINT "colleges_degree_programs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "degree_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "role_ci_mappings_roleId_ciId_key" RENAME TO "capability_instances_industry_roles_roleId_ciId_key";

-- RenameIndex
ALTER INDEX "department_fg_mappings_departmentId_fgId_key" RENAME TO "departments_functional_groups_departmentId_fgId_key";
