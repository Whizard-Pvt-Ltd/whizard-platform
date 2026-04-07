-- Create user_account_tenants mapping table
CREATE TABLE "user_account_tenants" (
  "id"              BIGSERIAL PRIMARY KEY,
  "user_account_id" BIGINT    NOT NULL REFERENCES "user_accounts" ("id") ON DELETE CASCADE,
  "tenant_id"       BIGINT    NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE,
  "tenant_type"     TEXT      NOT NULL,
  "is_active"       BOOLEAN   NOT NULL DEFAULT true,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "user_account_tenants_user_account_id_tenant_id_key" UNIQUE ("user_account_id", "tenant_id")
);

CREATE INDEX "user_account_tenants_user_account_id_idx" ON "user_account_tenants" ("user_account_id");
CREATE INDEX "user_account_tenants_tenant_id_idx"       ON "user_account_tenants" ("tenant_id");

-- Migrate existing tenant assignments from user_accounts to the new table
INSERT INTO "user_account_tenants" ("user_account_id", "tenant_id", "tenant_type")
SELECT ua.id, ua.tenant_id, ua.tenant_type
FROM "user_accounts" ua
WHERE ua.tenant_id IS NOT NULL AND ua.tenant_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop old columns from user_accounts
DROP INDEX IF EXISTS "user_accounts_tenant_id_idx";
ALTER TABLE "user_accounts" DROP COLUMN IF EXISTS "tenant_type";
ALTER TABLE "user_accounts" DROP COLUMN IF EXISTS "tenant_id";
