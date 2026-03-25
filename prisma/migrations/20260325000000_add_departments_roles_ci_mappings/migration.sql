-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operationalCriticalityScore" DOUBLE PRECISION,
    "revenueContributionWeight" DOUBLE PRECISION,
    "regulatoryExposureLevel" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_fg_mappings" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "fgId" TEXT NOT NULL,

    CONSTRAINT "department_fg_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_roles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "reportingTo" TEXT,
    "roleCriticalityScore" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "industry_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_ci_mappings" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "ciId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_ci_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_fg_mappings_departmentId_fgId_key" ON "department_fg_mappings"("departmentId", "fgId");

-- CreateIndex
CREATE UNIQUE INDEX "role_ci_mappings_roleId_ciId_key" ON "role_ci_mappings"("roleId", "ciId");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_fg_mappings" ADD CONSTRAINT "department_fg_mappings_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_fg_mappings" ADD CONSTRAINT "department_fg_mappings_fgId_fkey" FOREIGN KEY ("fgId") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_roles" ADD CONSTRAINT "industry_roles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_ci_mappings" ADD CONSTRAINT "role_ci_mappings_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "industry_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_ci_mappings" ADD CONSTRAINT "role_ci_mappings_ciId_fkey" FOREIGN KEY ("ciId") REFERENCES "capability_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
