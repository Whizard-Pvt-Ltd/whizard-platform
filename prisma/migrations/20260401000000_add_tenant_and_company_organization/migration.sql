-- CreateTable: tenants
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: WRCF models (column: tenant_id)
ALTER TABLE "functional_groups" ADD CONSTRAINT "functional_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pwos" ADD CONSTRAINT "pwos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "swos" ADD CONSTRAINT "swos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "skills" ADD CONSTRAINT "skills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "control_points" ADD CONSTRAINT "control_points_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "department_functional_groups" ADD CONSTRAINT "department_functional_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: College Operations models (column: tenantId - camelCase, no @map)
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "industryId" UUID,
    "companyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT,
    "companyType" TEXT,
    "establishedYear" INTEGER,
    "description" TEXT,
    "whatWeOffer" TEXT,
    "awardsRecognition" TEXT,
    "keyProductsServices" TEXT,
    "recruitmentHighlights" TEXT,
    "placementStats" TEXT,
    "inquiryEmail" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "companies_companyCode_key" ON "companies"("companyCode");
CREATE INDEX "companies_tenantId_status_idx" ON "companies"("tenantId", "status");
CREATE INDEX "companies_tenantId_isActive_idx" ON "companies"("tenantId", "isActive");

ALTER TABLE "companies" ADD CONSTRAINT "companies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "companies" ADD CONSTRAINT "companies_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "industries"("public_uuid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "companies" ADD CONSTRAINT "companies_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: clubs_companies
CREATE TABLE "clubs_companies" (
    "companyId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "isParent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "clubs_companies_pkey" PRIMARY KEY ("companyId","clubId")
);

ALTER TABLE "clubs_companies" ADD CONSTRAINT "clubs_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clubs_companies" ADD CONSTRAINT "clubs_companies_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: companies_media_assets
CREATE TABLE "companies_media_assets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "mediaRole" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "companies_media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "companies_media_assets_companyId_mediaAssetId_mediaRole_key" ON "companies_media_assets"("companyId", "mediaAssetId", "mediaRole");
CREATE INDEX "companies_media_assets_companyId_mediaRole_idx" ON "companies_media_assets"("companyId", "mediaRole");

ALTER TABLE "companies_media_assets" ADD CONSTRAINT "companies_media_assets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "companies_media_assets" ADD CONSTRAINT "companies_media_assets_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: company_contacts
CREATE TABLE "company_contacts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactRole" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedOn" TIMESTAMP(3),

    CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "company_contacts_companyId_userId_contactRole_key" ON "company_contacts"("companyId", "userId", "contactRole");
CREATE INDEX "company_contacts_companyId_idx" ON "company_contacts"("companyId");

ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_services
CREATE TABLE "company_services" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_services_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_services_companyId_idx" ON "company_services"("companyId");

ALTER TABLE "company_services" ADD CONSTRAINT "company_services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_products
CREATE TABLE "company_products" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_products_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_products_companyId_idx" ON "company_products"("companyId");

ALTER TABLE "company_products" ADD CONSTRAINT "company_products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_hiring_stats
CREATE TABLE "company_hiring_stats" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hires" INTEGER,
    "internshipConversionRate" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_hiring_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "company_hiring_stats_companyId_year_key" ON "company_hiring_stats"("companyId", "year");
CREATE INDEX "company_hiring_stats_companyId_idx" ON "company_hiring_stats"("companyId");

ALTER TABLE "company_hiring_stats" ADD CONSTRAINT "company_hiring_stats_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_hiring_roles
CREATE TABLE "company_hiring_roles" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_hiring_roles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_hiring_roles_companyId_idx" ON "company_hiring_roles"("companyId");

ALTER TABLE "company_hiring_roles" ADD CONSTRAINT "company_hiring_roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_hiring_domains
CREATE TABLE "company_hiring_domains" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_hiring_domains_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "company_hiring_domains_companyId_idx" ON "company_hiring_domains"("companyId");

ALTER TABLE "company_hiring_domains" ADD CONSTRAINT "company_hiring_domains_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: company_compensation_stats
CREATE TABLE "company_compensation_stats" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "highestPackage" DOUBLE PRECISION,
    "averagePackage" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_compensation_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "company_compensation_stats_companyId_year_key" ON "company_compensation_stats"("companyId", "year");
CREATE INDEX "company_compensation_stats_companyId_idx" ON "company_compensation_stats"("companyId");

ALTER TABLE "company_compensation_stats" ADD CONSTRAINT "company_compensation_stats_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
