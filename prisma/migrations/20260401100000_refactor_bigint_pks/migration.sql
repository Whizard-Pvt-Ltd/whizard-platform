-- ============================================================
-- Migration: Refactor all tables to BigInt PKs + public_uuid
-- Strategy: DROP CASCADE then CREATE in dependency order
-- WARNING: Destructive — dev environment only; reseed after running
-- ============================================================

-- Step 1: Drop all tables (CASCADE handles FK order)
DROP TABLE IF EXISTS "company_compensation_stats" CASCADE;
DROP TABLE IF EXISTS "company_hiring_domains" CASCADE;
DROP TABLE IF EXISTS "company_hiring_roles" CASCADE;
DROP TABLE IF EXISTS "company_hiring_stats" CASCADE;
DROP TABLE IF EXISTS "company_products" CASCADE;
DROP TABLE IF EXISTS "company_services" CASCADE;
DROP TABLE IF EXISTS "company_contacts" CASCADE;
DROP TABLE IF EXISTS "companies_media_assets" CASCADE;
DROP TABLE IF EXISTS "clubs_companies" CASCADE;
DROP TABLE IF EXISTS "companies" CASCADE;

DROP TABLE IF EXISTS "college_contacts" CASCADE;
DROP TABLE IF EXISTS "colleges_media_assets" CASCADE;
DROP TABLE IF EXISTS "colleges_degree_programs" CASCADE;
DROP TABLE IF EXISTS "clubs_colleges" CASCADE;
DROP TABLE IF EXISTS "colleges" CASCADE;

DROP TABLE IF EXISTS "program_specializations" CASCADE;
DROP TABLE IF EXISTS "degree_programs" CASCADE;
DROP TABLE IF EXISTS "media_assets" CASCADE;
DROP TABLE IF EXISTS "clubs" CASCADE;
DROP TABLE IF EXISTS "cities" CASCADE;

DROP TABLE IF EXISTS "role_capability_instances" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "department_functional_groups" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "learner_evidences" CASCADE;
DROP TABLE IF EXISTS "control_points" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "skills" CASCADE;
DROP TABLE IF EXISTS "capability_instances" CASCADE;
DROP TABLE IF EXISTS "proficiencies" CASCADE;
DROP TABLE IF EXISTS "capabilities" CASCADE;
DROP TABLE IF EXISTS "swos" CASCADE;
DROP TABLE IF EXISTS "pwos" CASCADE;
DROP TABLE IF EXISTS "functional_groups" CASCADE;
DROP TABLE IF EXISTS "industries" CASCADE;
DROP TABLE IF EXISTS "industry_sectors" CASCADE;

DROP TABLE IF EXISTS "tenants" CASCADE;
DROP TABLE IF EXISTS "user_accounts" CASCADE;

-- Step 2: Create tables in dependency order

-- No-dependency tables first
CREATE TABLE "user_accounts" (
  "id"               BIGSERIAL PRIMARY KEY,
  "public_uuid"      TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "primary_login_id" TEXT      NOT NULL,
  "primary_email"    TEXT      NOT NULL,
  "auth_mode"        TEXT      NOT NULL,
  "is_active"        BOOLEAN   NOT NULL DEFAULT true,
  "mfa_required"     BOOLEAN   NOT NULL DEFAULT false,
  "activated_at"     TIMESTAMP,
  "last_login_at"    TIMESTAMP,
  "version"          FLOAT     NOT NULL DEFAULT 1,
  "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
  "created_by"       BIGINT,
  "updated_at"       TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"       BIGINT,
  CONSTRAINT "user_accounts_public_uuid_key"      UNIQUE ("public_uuid"),
  CONSTRAINT "user_accounts_primary_login_id_key" UNIQUE ("primary_login_id"),
  CONSTRAINT "user_accounts_primary_email_key"    UNIQUE ("primary_email")
);

CREATE TABLE "tenants" (
  "id"         BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT     NOT NULL DEFAULT gen_random_uuid()::text,
  "name"       TEXT      NOT NULL,
  "type"       TEXT      NOT NULL,
  "is_active"  BOOLEAN   NOT NULL DEFAULT true,
  "created_by" BIGINT,
  "created_on" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by" BIGINT,
  "updated_on" TIMESTAMP,
  CONSTRAINT "tenants_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "industry_sectors" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        VARCHAR(50) NOT NULL,
  "description" TEXT,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "type"        VARCHAR(50) NOT NULL,
  "version"     FLOAT     NOT NULL DEFAULT 1,
  "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
  "created_by"  BIGINT,
  "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  CONSTRAINT "industry_sectors_public_uuid_key" UNIQUE ("public_uuid"),
  CONSTRAINT "industry_sectors_name_key"        UNIQUE ("name")
);

CREATE TABLE "capabilities" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "code"        VARCHAR(15) NOT NULL,
  "name"        VARCHAR(50) NOT NULL,
  "description" TEXT,
  "type"        VARCHAR(30) NOT NULL,
  "is_active"   BOOLEAN     NOT NULL DEFAULT true,
  "version"     FLOAT       NOT NULL DEFAULT 1,
  "created_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"  BIGINT,
  "updated_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  CONSTRAINT "capabilities_public_uuid_key" UNIQUE ("public_uuid"),
  CONSTRAINT "capabilities_code_key"        UNIQUE ("code")
);

CREATE TABLE "proficiencies" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "level"       VARCHAR(5)  NOT NULL,
  "label"       VARCHAR(50) NOT NULL,
  "description" TEXT,
  "weightage"   FLOAT,
  "is_active"   BOOLEAN     NOT NULL DEFAULT true,
  "version"     FLOAT       NOT NULL DEFAULT 1,
  "created_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"  BIGINT,
  "updated_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  CONSTRAINT "proficiencies_public_uuid_key" UNIQUE ("public_uuid"),
  CONSTRAINT "proficiencies_level_key"       UNIQUE ("level"),
  CONSTRAINT "proficiencies_label_key"       UNIQUE ("label")
);

CREATE TABLE "degree_programs" (
  "id"            BIGSERIAL PRIMARY KEY,
  "public_uuid"   TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "name"          TEXT      NOT NULL,
  "level"         TEXT      NOT NULL,
  "duration_years" INT,
  "is_active"     BOOLEAN   NOT NULL DEFAULT true,
  "created_by"    BIGINT    NOT NULL,
  "created_on"    TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "degree_programs_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "cities" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT    NOT NULL,
  "state"       TEXT    NOT NULL,
  "is_active"   BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "cities_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "cities_state_idx" ON "cities" ("state");

-- Tables depending on industry_sectors
CREATE TABLE "industries" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "sector_id"   BIGINT      NOT NULL REFERENCES "industry_sectors" ("id"),
  "name"        VARCHAR(50) NOT NULL,
  "description" TEXT,
  "is_active"   BOOLEAN     NOT NULL DEFAULT true,
  "version"     FLOAT       NOT NULL DEFAULT 1,
  "created_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"  BIGINT,
  "updated_at"  TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  CONSTRAINT "industries_public_uuid_key"    UNIQUE ("public_uuid"),
  CONSTRAINT "industries_sector_id_name_key" UNIQUE ("sector_id", "name")
);

-- Tables depending on tenants
CREATE TABLE "media_assets" (
  "id"            BIGSERIAL PRIMARY KEY,
  "public_uuid"   TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"     BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "name"          TEXT      NOT NULL,
  "url"           TEXT      NOT NULL,
  "key"           TEXT      NOT NULL,
  "type"          TEXT      NOT NULL,
  "mime_type"     TEXT      NOT NULL,
  "size_bytes"    INT       NOT NULL,
  "thumbnail_url" TEXT,
  "is_active"     BOOLEAN   NOT NULL DEFAULT true,
  "created_by"    BIGINT    NOT NULL,
  "created_on"    TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"    BIGINT,
  "updated_on"    TIMESTAMP,
  CONSTRAINT "media_assets_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "media_assets_tenant_id_type_idx" ON "media_assets" ("tenant_id", "type");

CREATE TABLE "clubs" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"   BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "name"        TEXT      NOT NULL,
  "description" TEXT,
  "logo_url"    TEXT,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  "updated_on"  TIMESTAMP,
  CONSTRAINT "clubs_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "clubs_tenant_id_idx" ON "clubs" ("tenant_id");

-- Tables depending on industries + tenants
CREATE TABLE "functional_groups" (
  "id"                 BIGSERIAL PRIMARY KEY,
  "public_uuid"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "industry_id"        BIGINT      NOT NULL REFERENCES "industries" ("id"),
  "tenant_id"          BIGINT      NOT NULL REFERENCES "tenants" ("id"),
  "name"               VARCHAR(50) NOT NULL,
  "description"        TEXT,
  "source_template_id" TEXT,
  "domain_type"        VARCHAR(20) NOT NULL,
  "is_active"          BOOLEAN     NOT NULL DEFAULT true,
  "version"            FLOAT       NOT NULL DEFAULT 1,
  "created_at"         TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"         BIGINT,
  "updated_at"         TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"         BIGINT,
  CONSTRAINT "functional_groups_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "departments" (
  "id"                           BIGSERIAL PRIMARY KEY,
  "public_uuid"                  TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"                    BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "name"                         VARCHAR(100) NOT NULL,
  "description"                  TEXT,
  "source_template_id"           TEXT,
  "is_active"                    BOOLEAN      NOT NULL DEFAULT true,
  "version"                      FLOAT        NOT NULL DEFAULT 1,
  "created_at"                   TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"                   BIGINT,
  "updated_at"                   TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"                   BIGINT,
  "industry_id"                  BIGINT       REFERENCES "industries" ("id"),
  "operational_criticality_score" FLOAT,
  "revenue_contribution_weight"   FLOAT,
  "regulatory_exposure_level"     FLOAT,
  CONSTRAINT "departments_public_uuid_key" UNIQUE ("public_uuid")
);

-- Tables depending on cities + tenants + industries
CREATE TABLE "colleges" (
  "id"                   BIGSERIAL PRIMARY KEY,
  "public_uuid"          TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"            BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "college_code"         TEXT      NOT NULL,
  "name"                 TEXT      NOT NULL,
  "affiliated_university" TEXT     NOT NULL,
  "city_id"              BIGINT    REFERENCES "cities" ("id"),
  "college_type"         TEXT      NOT NULL,
  "established_year"     INT,
  "description"          TEXT,
  "degrees_offered"      TEXT,
  "placement_highlights" TEXT,
  "inquiry_email"        TEXT,
  "status"               INT       NOT NULL DEFAULT 0,
  "is_active"            BOOLEAN   NOT NULL DEFAULT true,
  "created_by"           BIGINT    NOT NULL,
  "created_on"           TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"           BIGINT,
  "updated_on"           TIMESTAMP,
  CONSTRAINT "colleges_public_uuid_key"   UNIQUE ("public_uuid"),
  CONSTRAINT "colleges_college_code_key"  UNIQUE ("college_code")
);
CREATE INDEX "colleges_tenant_id_status_idx"    ON "colleges" ("tenant_id", "status");
CREATE INDEX "colleges_tenant_id_is_active_idx" ON "colleges" ("tenant_id", "is_active");

CREATE TABLE "companies" (
  "id"                    BIGSERIAL PRIMARY KEY,
  "public_uuid"           TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "tenant_id"             BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "industry_id"           BIGINT    REFERENCES "industries" ("id"),
  "company_code"          TEXT      NOT NULL,
  "name"                  TEXT      NOT NULL,
  "city_id"               BIGINT    REFERENCES "cities" ("id"),
  "company_type"          TEXT,
  "established_year"      INT,
  "description"           TEXT,
  "what_we_offer"         TEXT,
  "awards_recognition"    TEXT,
  "key_products_services" TEXT,
  "recruitment_highlights" TEXT,
  "placement_stats"       TEXT,
  "inquiry_email"         TEXT,
  "status"                INT       NOT NULL DEFAULT 0,
  "is_active"             BOOLEAN   NOT NULL DEFAULT true,
  "created_by"            BIGINT    NOT NULL,
  "created_on"            TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"            BIGINT,
  "updated_on"            TIMESTAMP,
  CONSTRAINT "companies_public_uuid_key"  UNIQUE ("public_uuid"),
  CONSTRAINT "companies_company_code_key" UNIQUE ("company_code")
);
CREATE INDEX "companies_tenant_id_status_idx"    ON "companies" ("tenant_id", "status");
CREATE INDEX "companies_tenant_id_is_active_idx" ON "companies" ("tenant_id", "is_active");

-- Tables depending on pwos (need pwos first)
CREATE TABLE "pwos" (
  "id"                        BIGSERIAL PRIMARY KEY,
  "public_uuid"               TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "functional_group_id"       BIGINT       NOT NULL REFERENCES "functional_groups" ("id"),
  "tenant_id"                 BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "name"                      VARCHAR(100) NOT NULL,
  "source_template_id"        TEXT,
  "strategic_importance_level" SMALLINT    NOT NULL,
  "revenue_impact_level"      VARCHAR(10)  NOT NULL,
  "downtime_sensitivity"      VARCHAR(10)  NOT NULL,
  "is_active"                 BOOLEAN      NOT NULL DEFAULT true,
  "version"                   FLOAT        NOT NULL DEFAULT 1,
  "created_at"                TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"                BIGINT,
  "updated_at"                TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"                BIGINT,
  CONSTRAINT "pwos_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "swos" (
  "id"                    BIGSERIAL PRIMARY KEY,
  "public_uuid"           TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "pwo_id"                BIGINT       NOT NULL REFERENCES "pwos" ("id"),
  "tenant_id"             BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "name"                  VARCHAR(100) NOT NULL,
  "source_template_id"    TEXT,
  "operational_complexity" VARCHAR(10) NOT NULL,
  "asset_criticality"     VARCHAR(10)  NOT NULL,
  "failure_frequency"     VARCHAR(10)  NOT NULL,
  "is_active"             BOOLEAN      NOT NULL DEFAULT true,
  "version"               FLOAT        NOT NULL DEFAULT 1,
  "created_at"            TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"            BIGINT,
  "updated_at"            TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"            BIGINT,
  CONSTRAINT "swos_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "capability_instances" (
  "id"                   BIGSERIAL PRIMARY KEY,
  "public_uuid"          TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "functional_group_id"  BIGINT    NOT NULL REFERENCES "functional_groups" ("id"),
  "pwo_id"               BIGINT    REFERENCES "pwos" ("id"),
  "swo_id"               BIGINT    REFERENCES "swos" ("id"),
  "capability_id"        BIGINT    NOT NULL REFERENCES "capabilities" ("id"),
  "proficiency_id"       BIGINT    NOT NULL REFERENCES "proficiencies" ("id"),
  "tenant_id"            BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "is_active"            BOOLEAN   NOT NULL DEFAULT true,
  "version"              FLOAT     NOT NULL DEFAULT 1,
  "created_at"           TIMESTAMP NOT NULL DEFAULT now(),
  "created_by"           BIGINT,
  "updated_at"           TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"           BIGINT,
  CONSTRAINT "capability_instances_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "skills" (
  "id"                         BIGSERIAL PRIMARY KEY,
  "public_uuid"                TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "capability_instance_id"     BIGINT       NOT NULL REFERENCES "capability_instances" ("id"),
  "tenant_id"                  BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "name"                       VARCHAR(100) NOT NULL,
  "source_template_id"         TEXT,
  "cognitive_type"             VARCHAR(20)  NOT NULL,
  "skill_criticality"          VARCHAR(10)  NOT NULL,
  "recertification_cycle_months" INT        NOT NULL,
  "ai_impact"                  VARCHAR(10)  NOT NULL,
  "is_active"                  BOOLEAN      NOT NULL DEFAULT true,
  "version"                    FLOAT        NOT NULL DEFAULT 1,
  "created_at"                 TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"                 BIGINT,
  "updated_at"                 TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"                 BIGINT,
  CONSTRAINT "skills_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "tasks" (
  "id"                       BIGSERIAL PRIMARY KEY,
  "public_uuid"              TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "skill_id"                 BIGINT       NOT NULL REFERENCES "skills" ("id"),
  "tenant_id"                BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "name"                     VARCHAR(100) NOT NULL,
  "description"              TEXT,
  "source_template_id"       TEXT,
  "frequency"                VARCHAR(20)  NOT NULL,
  "complexity"               VARCHAR(10)  NOT NULL,
  "standard_duration"        INT          NOT NULL,
  "required_proficiency_level" VARCHAR(5) NOT NULL,
  "is_active"                BOOLEAN      NOT NULL DEFAULT true,
  "version"                  FLOAT        NOT NULL DEFAULT 1,
  "created_at"               TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"               BIGINT,
  "updated_at"               TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"               BIGINT,
  CONSTRAINT "tasks_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "control_points" (
  "id"                  BIGSERIAL PRIMARY KEY,
  "public_uuid"         TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "task_id"             BIGINT      NOT NULL REFERENCES "tasks" ("id"),
  "tenant_id"           BIGINT      NOT NULL REFERENCES "tenants" ("id"),
  "name"                VARCHAR(100) NOT NULL,
  "description"         TEXT,
  "source_template_id"  TEXT,
  "risk_level"          VARCHAR(20) NOT NULL,
  "failure_impact_type" VARCHAR(20) NOT NULL,
  "evidence_type"       VARCHAR(50),
  "kpi_threshold"       INT,
  "escalation_required" BOOLEAN     NOT NULL DEFAULT false,
  "is_active"           BOOLEAN     NOT NULL DEFAULT true,
  "version"             FLOAT       NOT NULL DEFAULT 1,
  "created_at"          TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"          BIGINT,
  "updated_at"          TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"          BIGINT,
  CONSTRAINT "control_points_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "learner_evidences" (
  "id"               BIGSERIAL PRIMARY KEY,
  "public_uuid"      TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "learner_id"       BIGINT      NOT NULL,
  "control_point_id" BIGINT      NOT NULL,
  "evidence_type"    VARCHAR(30) NOT NULL,
  "evidence_url"     TEXT,
  "validation_status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
  "submission_date"  TIMESTAMP   NOT NULL DEFAULT now(),
  "remarks"          TEXT,
  "is_active"        BOOLEAN     NOT NULL DEFAULT true,
  "version"          FLOAT       NOT NULL DEFAULT 1,
  "created_at"       TIMESTAMP   NOT NULL DEFAULT now(),
  "created_by"       BIGINT,
  "updated_at"       TIMESTAMP   NOT NULL DEFAULT now(),
  "updated_by"       BIGINT,
  CONSTRAINT "learner_evidences_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "roles" (
  "id"                    BIGSERIAL PRIMARY KEY,
  "public_uuid"           TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "department_id"         BIGINT       NOT NULL REFERENCES "departments" ("id"),
  "tenant_id"             BIGINT       NOT NULL REFERENCES "tenants" ("id"),
  "industry_id"           BIGINT,
  "name"                  VARCHAR(100) NOT NULL,
  "seniority_level"       VARCHAR(50),
  "reporting_to"          BIGINT,
  "role_criticality_score" INT,
  "description"           TEXT,
  "source_template_id"    TEXT,
  "is_active"             BOOLEAN      NOT NULL DEFAULT true,
  "version"               FLOAT        NOT NULL DEFAULT 1,
  "created_at"            TIMESTAMP    NOT NULL DEFAULT now(),
  "created_by"            BIGINT,
  "updated_at"            TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_by"            BIGINT,
  CONSTRAINT "roles_public_uuid_key" UNIQUE ("public_uuid")
);

CREATE TABLE "role_capability_instances" (
  "id"                    BIGSERIAL PRIMARY KEY,
  "public_uuid"           TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "role_id"               BIGINT    NOT NULL REFERENCES "roles" ("id"),
  "capability_instance_id" BIGINT   NOT NULL REFERENCES "capability_instances" ("id"),
  "is_mandatory"          BOOLEAN   NOT NULL DEFAULT true,
  "is_active"             BOOLEAN   NOT NULL DEFAULT true,
  "version"               FLOAT     NOT NULL DEFAULT 1,
  "created_at"            TIMESTAMP NOT NULL DEFAULT now(),
  "created_by"            BIGINT,
  "updated_at"            TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"            BIGINT,
  CONSTRAINT "role_capability_instances_public_uuid_key"        UNIQUE ("public_uuid"),
  CONSTRAINT "role_capability_instances_role_id_ci_id_key"      UNIQUE ("role_id", "capability_instance_id")
);

CREATE TABLE "department_functional_groups" (
  "id"                  BIGSERIAL PRIMARY KEY,
  "public_uuid"         TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "department_id"       BIGINT    NOT NULL REFERENCES "departments" ("id"),
  "functional_group_id" BIGINT    NOT NULL REFERENCES "functional_groups" ("id"),
  "tenant_id"           BIGINT    NOT NULL REFERENCES "tenants" ("id"),
  "source_template_id"  TEXT,
  "is_active"           BOOLEAN   NOT NULL DEFAULT true,
  "version"             FLOAT     NOT NULL DEFAULT 1,
  "created_at"          TIMESTAMP NOT NULL DEFAULT now(),
  "created_by"          BIGINT,
  "updated_at"          TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"          BIGINT,
  CONSTRAINT "department_functional_groups_public_uuid_key"           UNIQUE ("public_uuid"),
  CONSTRAINT "department_functional_groups_dept_fg_key"               UNIQUE ("department_id", "functional_group_id")
);

-- College-related join tables
CREATE TABLE "college_contacts" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "college_id"  BIGINT    NOT NULL REFERENCES "colleges" ("id") ON DELETE CASCADE,
  "user_id"     BIGINT    NOT NULL,
  "role"        TEXT      NOT NULL,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"  BIGINT,
  "updated_on"  TIMESTAMP,
  CONSTRAINT "college_contacts_public_uuid_key"    UNIQUE ("public_uuid"),
  CONSTRAINT "college_contacts_college_id_role_key" UNIQUE ("college_id", "role")
);
CREATE INDEX "college_contacts_college_id_idx" ON "college_contacts" ("college_id");

CREATE TABLE "clubs_colleges" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "college_id"  BIGINT  NOT NULL REFERENCES "colleges" ("id") ON DELETE CASCADE,
  "club_id"     BIGINT  NOT NULL REFERENCES "clubs" ("id"),
  CONSTRAINT "clubs_colleges_public_uuid_key"           UNIQUE ("public_uuid"),
  CONSTRAINT "clubs_colleges_college_id_club_id_key"    UNIQUE ("college_id", "club_id")
);

CREATE TABLE "colleges_media_assets" (
  "id"             BIGSERIAL PRIMARY KEY,
  "public_uuid"    TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "college_id"     BIGINT  NOT NULL REFERENCES "colleges" ("id") ON DELETE CASCADE,
  "media_asset_id" BIGINT  NOT NULL REFERENCES "media_assets" ("id"),
  "media_role"     TEXT    NOT NULL,
  "sort_order"     INT     NOT NULL DEFAULT 0,
  CONSTRAINT "colleges_media_assets_public_uuid_key"                    UNIQUE ("public_uuid"),
  CONSTRAINT "colleges_media_assets_college_id_media_asset_id_role_key" UNIQUE ("college_id", "media_asset_id", "media_role")
);
CREATE INDEX "colleges_media_assets_college_id_role_idx" ON "colleges_media_assets" ("college_id", "media_role");

CREATE TABLE "program_specializations" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "program_id"  BIGINT    NOT NULL REFERENCES "degree_programs" ("id"),
  "name"        TEXT      NOT NULL,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "program_specializations_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "program_specializations_program_id_idx" ON "program_specializations" ("program_id");

CREATE TABLE "colleges_degree_programs" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "college_id"  BIGINT  NOT NULL REFERENCES "colleges" ("id") ON DELETE CASCADE,
  "program_id"  BIGINT  NOT NULL REFERENCES "degree_programs" ("id"),
  CONSTRAINT "colleges_degree_programs_public_uuid_key"              UNIQUE ("public_uuid"),
  CONSTRAINT "colleges_degree_programs_college_id_program_id_key"    UNIQUE ("college_id", "program_id")
);

-- Company-related join/child tables
CREATE TABLE "clubs_companies" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"  BIGINT  NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "club_id"     BIGINT  NOT NULL REFERENCES "clubs" ("id"),
  "is_parent"   BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "clubs_companies_public_uuid_key"            UNIQUE ("public_uuid"),
  CONSTRAINT "clubs_companies_company_id_club_id_key"     UNIQUE ("company_id", "club_id")
);

CREATE TABLE "companies_media_assets" (
  "id"             BIGSERIAL PRIMARY KEY,
  "public_uuid"    TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"     BIGINT  NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "media_asset_id" BIGINT  NOT NULL REFERENCES "media_assets" ("id"),
  "media_role"     TEXT    NOT NULL,
  "sort_order"     INT     NOT NULL DEFAULT 0,
  CONSTRAINT "companies_media_assets_public_uuid_key"                     UNIQUE ("public_uuid"),
  CONSTRAINT "companies_media_assets_company_id_media_asset_id_role_key"  UNIQUE ("company_id", "media_asset_id", "media_role")
);
CREATE INDEX "companies_media_assets_company_id_role_idx" ON "companies_media_assets" ("company_id", "media_role");

CREATE TABLE "company_contacts" (
  "id"           BIGSERIAL PRIMARY KEY,
  "public_uuid"  TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"   BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "user_id"      BIGINT    NOT NULL,
  "contact_role" TEXT      NOT NULL,
  "is_active"    BOOLEAN   NOT NULL DEFAULT true,
  "created_by"   BIGINT    NOT NULL,
  "created_on"   TIMESTAMP NOT NULL DEFAULT now(),
  "updated_by"   BIGINT,
  "updated_on"   TIMESTAMP,
  CONSTRAINT "company_contacts_public_uuid_key"                   UNIQUE ("public_uuid"),
  CONSTRAINT "company_contacts_company_id_user_id_role_key"       UNIQUE ("company_id", "user_id", "contact_role")
);
CREATE INDEX "company_contacts_company_id_idx" ON "company_contacts" ("company_id");

CREATE TABLE "company_services" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"  BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "category"    TEXT      NOT NULL,
  "description" TEXT,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_services_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "company_services_company_id_idx" ON "company_services" ("company_id");

CREATE TABLE "company_products" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"  BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "name"        TEXT      NOT NULL,
  "description" TEXT,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_products_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "company_products_company_id_idx" ON "company_products" ("company_id");

CREATE TABLE "company_hiring_stats" (
  "id"                       BIGSERIAL PRIMARY KEY,
  "public_uuid"              TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"               BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "year"                     INT       NOT NULL,
  "hires"                    INT,
  "internship_conversion_rate" FLOAT,
  "created_by"               BIGINT    NOT NULL,
  "created_on"               TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_hiring_stats_public_uuid_key"        UNIQUE ("public_uuid"),
  CONSTRAINT "company_hiring_stats_company_id_year_key"    UNIQUE ("company_id", "year")
);
CREATE INDEX "company_hiring_stats_company_id_idx" ON "company_hiring_stats" ("company_id");

CREATE TABLE "company_hiring_roles" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"  BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "role_name"   TEXT      NOT NULL,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_hiring_roles_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "company_hiring_roles_company_id_idx" ON "company_hiring_roles" ("company_id");

CREATE TABLE "company_hiring_domains" (
  "id"          BIGSERIAL PRIMARY KEY,
  "public_uuid" TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"  BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "domain"      TEXT      NOT NULL,
  "is_active"   BOOLEAN   NOT NULL DEFAULT true,
  "created_by"  BIGINT    NOT NULL,
  "created_on"  TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_hiring_domains_public_uuid_key" UNIQUE ("public_uuid")
);
CREATE INDEX "company_hiring_domains_company_id_idx" ON "company_hiring_domains" ("company_id");

CREATE TABLE "company_compensation_stats" (
  "id"              BIGSERIAL PRIMARY KEY,
  "public_uuid"     TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "company_id"      BIGINT    NOT NULL REFERENCES "companies" ("id") ON DELETE CASCADE,
  "year"            INT       NOT NULL,
  "highest_package" FLOAT,
  "average_package" FLOAT,
  "created_by"      BIGINT    NOT NULL,
  "created_on"      TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "company_compensation_stats_public_uuid_key"     UNIQUE ("public_uuid"),
  CONSTRAINT "company_compensation_stats_company_id_year_key" UNIQUE ("company_id", "year")
);
CREATE INDEX "company_compensation_stats_company_id_idx" ON "company_compensation_stats" ("company_id");
