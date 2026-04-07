-- Add stack_auth_id, tenant_type, tenant_id to user_accounts
ALTER TABLE "user_accounts" ADD COLUMN "stack_auth_id" TEXT;
ALTER TABLE "user_accounts" ADD COLUMN "tenant_type" TEXT;
ALTER TABLE "user_accounts" ADD COLUMN "tenant_id" BIGINT;

CREATE UNIQUE INDEX "user_accounts_stack_auth_id_key" ON "user_accounts"("stack_auth_id");
CREATE INDEX "user_accounts_tenant_id_idx" ON "user_accounts"("tenant_id");

-- Add company_tenant_id to internships
ALTER TABLE "internships" ADD COLUMN "company_tenant_id" BIGINT;

CREATE INDEX "internships_company_tenant_id_idx" ON "internships"("company_tenant_id");

-- Add FK constraint for company_tenant_id
ALTER TABLE "internships" ADD CONSTRAINT "internships_company_tenant_id_fkey"
  FOREIGN KEY ("company_tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
