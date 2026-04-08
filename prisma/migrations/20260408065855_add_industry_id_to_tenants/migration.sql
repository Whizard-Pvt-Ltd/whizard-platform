-- DropForeignKey
ALTER TABLE "user_account_tenants" DROP CONSTRAINT "user_account_tenants_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "user_account_tenants" DROP CONSTRAINT "user_account_tenants_user_account_id_fkey";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "industry_id" BIGINT;

-- AddForeignKey
ALTER TABLE "user_account_tenants" ADD CONSTRAINT "user_account_tenants_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_tenants" ADD CONSTRAINT "user_account_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
