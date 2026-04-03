-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_capability_id_fkey";

-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_functional_group_id_fkey";

-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_proficiency_id_fkey";

-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_pwo_id_fkey";

-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_swo_id_fkey";

-- DropForeignKey
ALTER TABLE "capability_instances" DROP CONSTRAINT "capability_instances_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "clubs" DROP CONSTRAINT "clubs_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "clubs_colleges" DROP CONSTRAINT "clubs_colleges_club_id_fkey";

-- DropForeignKey
ALTER TABLE "clubs_colleges" DROP CONSTRAINT "clubs_colleges_college_id_fkey";

-- DropForeignKey
ALTER TABLE "clubs_companies" DROP CONSTRAINT "clubs_companies_club_id_fkey";

-- DropForeignKey
ALTER TABLE "clubs_companies" DROP CONSTRAINT "clubs_companies_company_id_fkey";

-- DropForeignKey
ALTER TABLE "college_contacts" DROP CONSTRAINT "college_contacts_college_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges" DROP CONSTRAINT "colleges_city_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges" DROP CONSTRAINT "colleges_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges_degree_programs" DROP CONSTRAINT "colleges_degree_programs_college_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges_degree_programs" DROP CONSTRAINT "colleges_degree_programs_program_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges_media_assets" DROP CONSTRAINT "colleges_media_assets_college_id_fkey";

-- DropForeignKey
ALTER TABLE "colleges_media_assets" DROP CONSTRAINT "colleges_media_assets_media_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_city_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "companies_media_assets" DROP CONSTRAINT "companies_media_assets_company_id_fkey";

-- DropForeignKey
ALTER TABLE "companies_media_assets" DROP CONSTRAINT "companies_media_assets_media_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "company_compensation_stats" DROP CONSTRAINT "company_compensation_stats_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_contacts" DROP CONSTRAINT "company_contacts_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_hiring_domains" DROP CONSTRAINT "company_hiring_domains_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_hiring_roles" DROP CONSTRAINT "company_hiring_roles_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_hiring_stats" DROP CONSTRAINT "company_hiring_stats_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_products" DROP CONSTRAINT "company_products_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_services" DROP CONSTRAINT "company_services_company_id_fkey";

-- DropForeignKey
ALTER TABLE "control_points" DROP CONSTRAINT "control_points_task_id_fkey";

-- DropForeignKey
ALTER TABLE "control_points" DROP CONSTRAINT "control_points_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "department_functional_groups" DROP CONSTRAINT "department_functional_groups_department_id_fkey";

-- DropForeignKey
ALTER TABLE "department_functional_groups" DROP CONSTRAINT "department_functional_groups_functional_group_id_fkey";

-- DropForeignKey
ALTER TABLE "department_functional_groups" DROP CONSTRAINT "department_functional_groups_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "functional_groups" DROP CONSTRAINT "functional_groups_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "functional_groups" DROP CONSTRAINT "functional_groups_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "industries" DROP CONSTRAINT "industries_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "media_assets" DROP CONSTRAINT "media_assets_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "program_specializations" DROP CONSTRAINT "program_specializations_program_id_fkey";

-- DropForeignKey
ALTER TABLE "pwos" DROP CONSTRAINT "pwos_functional_group_id_fkey";

-- DropForeignKey
ALTER TABLE "pwos" DROP CONSTRAINT "pwos_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "role_capability_instances" DROP CONSTRAINT "role_capability_instances_capability_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "role_capability_instances" DROP CONSTRAINT "role_capability_instances_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_department_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_capability_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "swos" DROP CONSTRAINT "swos_pwo_id_fkey";

-- DropForeignKey
ALTER TABLE "swos" DROP CONSTRAINT "swos_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_tenant_id_fkey";

-- AlterTable
ALTER TABLE "capabilities" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "capability_instances" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "city_code" TEXT,
ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "clubs" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "clubs_colleges" ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "clubs_companies" ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "college_contacts" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "colleges" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "colleges_degree_programs" ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "colleges_media_assets" ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "companies_media_assets" ALTER COLUMN "public_uuid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "company_compensation_stats" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_contacts" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_hiring_domains" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_hiring_roles" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_hiring_stats" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_products" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_services" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "control_points" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "degree_programs" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "department_functional_groups" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "departments" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "functional_groups" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "industries" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "industry_sectors" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "learner_evidences" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "submission_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "media_assets" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "proficiencies" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "program_specializations" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pwos" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "role_capability_instances" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "skills" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "swos" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_on" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_accounts" ALTER COLUMN "public_uuid" DROP DEFAULT,
ALTER COLUMN "activated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_login_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "industry_sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "functional_groups" ADD CONSTRAINT "functional_groups_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "functional_groups" ADD CONSTRAINT "functional_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwos" ADD CONSTRAINT "pwos_functional_group_id_fkey" FOREIGN KEY ("functional_group_id") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwos" ADD CONSTRAINT "pwos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swos" ADD CONSTRAINT "swos_pwo_id_fkey" FOREIGN KEY ("pwo_id") REFERENCES "pwos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swos" ADD CONSTRAINT "swos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_functional_group_id_fkey" FOREIGN KEY ("functional_group_id") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_pwo_id_fkey" FOREIGN KEY ("pwo_id") REFERENCES "pwos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_swo_id_fkey" FOREIGN KEY ("swo_id") REFERENCES "swos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "capabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_proficiency_id_fkey" FOREIGN KEY ("proficiency_id") REFERENCES "proficiencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_instances" ADD CONSTRAINT "capability_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_capability_instance_id_fkey" FOREIGN KEY ("capability_instance_id") REFERENCES "capability_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_points" ADD CONSTRAINT "control_points_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_points" ADD CONSTRAINT "control_points_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_functional_groups" ADD CONSTRAINT "department_functional_groups_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_functional_groups" ADD CONSTRAINT "department_functional_groups_functional_group_id_fkey" FOREIGN KEY ("functional_group_id") REFERENCES "functional_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_functional_groups" ADD CONSTRAINT "department_functional_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_capability_instances" ADD CONSTRAINT "role_capability_instances_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_capability_instances" ADD CONSTRAINT "role_capability_instances_capability_instance_id_fkey" FOREIGN KEY ("capability_instance_id") REFERENCES "capability_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_specializations" ADD CONSTRAINT "program_specializations_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "degree_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_contacts" ADD CONSTRAINT "college_contacts_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_colleges" ADD CONSTRAINT "clubs_colleges_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_colleges" ADD CONSTRAINT "clubs_colleges_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_media_assets" ADD CONSTRAINT "colleges_media_assets_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_media_assets" ADD CONSTRAINT "colleges_media_assets_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_degree_programs" ADD CONSTRAINT "colleges_degree_programs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges_degree_programs" ADD CONSTRAINT "colleges_degree_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "degree_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_companies" ADD CONSTRAINT "clubs_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs_companies" ADD CONSTRAINT "clubs_companies_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies_media_assets" ADD CONSTRAINT "companies_media_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies_media_assets" ADD CONSTRAINT "companies_media_assets_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_products" ADD CONSTRAINT "company_products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hiring_stats" ADD CONSTRAINT "company_hiring_stats_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hiring_roles" ADD CONSTRAINT "company_hiring_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hiring_domains" ADD CONSTRAINT "company_hiring_domains_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_compensation_stats" ADD CONSTRAINT "company_compensation_stats_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "colleges_media_assets_college_id_media_asset_id_role_key" RENAME TO "colleges_media_assets_college_id_media_asset_id_media_role_key";

-- RenameIndex
ALTER INDEX "colleges_media_assets_college_id_role_idx" RENAME TO "colleges_media_assets_college_id_media_role_idx";

-- RenameIndex
ALTER INDEX "companies_media_assets_company_id_media_asset_id_role_key" RENAME TO "companies_media_assets_company_id_media_asset_id_media_role_key";

-- RenameIndex
ALTER INDEX "companies_media_assets_company_id_role_idx" RENAME TO "companies_media_assets_company_id_media_role_idx";

-- RenameIndex
ALTER INDEX "company_contacts_company_id_user_id_role_key" RENAME TO "company_contacts_company_id_user_id_contact_role_key";

-- RenameIndex
ALTER INDEX "department_functional_groups_dept_fg_key" RENAME TO "department_functional_groups_department_id_functional_group_key";

-- RenameIndex
ALTER INDEX "role_capability_instances_role_id_ci_id_key" RENAME TO "role_capability_instances_role_id_capability_instance_id_key";
