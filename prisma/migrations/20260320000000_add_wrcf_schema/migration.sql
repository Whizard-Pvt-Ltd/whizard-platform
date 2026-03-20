-- CreateTable
CREATE TABLE "industry_sectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "industry_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "functional_groups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT,
    "industryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domainType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "functional_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "primary_work_objects" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT,
    "functionalGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "strategicImportance" INTEGER NOT NULL,
    "revenueImpact" TEXT NOT NULL,
    "downtimeSensitivity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "primary_work_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secondary_work_objects" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT,
    "pwoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "operationalComplexity" TEXT NOT NULL,
    "assetCriticality" TEXT NOT NULL,
    "failureFrequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "secondary_work_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capabilities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proficiencies" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "independenceLevel" TEXT,

    CONSTRAINT "proficiencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_instances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "versionId" TEXT,
    "functionalGroupId" TEXT NOT NULL,
    "pwoId" TEXT NOT NULL,
    "swoId" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "proficiencyId" TEXT NOT NULL,

    CONSTRAINT "capability_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capabilities_code_key" ON "capabilities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "capability_instances_tenantId_versionId_functionalGroupId_p_key" ON "capability_instances"("tenantId", "versionId", "functionalGroupId", "pwoId", "swoId", "capabilityId", "proficiencyId");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "industry_sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "functional_groups" ADD CONSTRAINT "functional_groups_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primary_work_objects" ADD CONSTRAINT "primary_work_objects_functionalGroupId_fkey" FOREIGN KEY ("functionalGroupId") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secondary_work_objects" ADD CONSTRAINT "secondary_work_objects_pwoId_fkey" FOREIGN KEY ("pwoId") REFERENCES "primary_work_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_functionalGroupId_fkey" FOREIGN KEY ("functionalGroupId") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_pwoId_fkey" FOREIGN KEY ("pwoId") REFERENCES "primary_work_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_swoId_fkey" FOREIGN KEY ("swoId") REFERENCES "secondary_work_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_proficiencyId_fkey" FOREIGN KEY ("proficiencyId") REFERENCES "proficiencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
