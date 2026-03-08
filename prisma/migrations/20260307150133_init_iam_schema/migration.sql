-- CreateTable
CREATE TABLE "iam_user_accounts" (
    "id" TEXT NOT NULL,
    "primaryLoginId" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "authMode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mfaRequired" BOOLEAN NOT NULL DEFAULT true,
    "tenantType" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "iam_user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_access_principals" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "tenantType" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "iam_access_principals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_role_assignments" (
    "id" TEXT NOT NULL,
    "accessPrincipalId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "iam_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_permission_grants" (
    "id" TEXT NOT NULL,
    "accessPrincipalId" TEXT NOT NULL,
    "permissionCode" TEXT NOT NULL,
    "grantSource" TEXT NOT NULL,
    "scopeType" TEXT,
    "scopeValue" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "iam_permission_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_scope_restrictions" (
    "id" TEXT NOT NULL,
    "accessPrincipalId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "restrictionType" TEXT NOT NULL,
    "scopeExpression" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iam_scope_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_user_sessions" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshExpiresAt" TIMESTAMP(3) NOT NULL,
    "clientContext" TEXT NOT NULL,

    CONSTRAINT "iam_user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_outbox_events" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "iam_outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iam_user_accounts_primaryLoginId_key" ON "iam_user_accounts"("primaryLoginId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_user_accounts_primaryEmail_key" ON "iam_user_accounts"("primaryEmail");

-- CreateIndex
CREATE INDEX "iam_user_accounts_tenantType_tenantId_idx" ON "iam_user_accounts"("tenantType", "tenantId");

-- CreateIndex
CREATE INDEX "iam_user_accounts_status_idx" ON "iam_user_accounts"("status");

-- CreateIndex
CREATE INDEX "iam_access_principals_tenantType_tenantId_status_idx" ON "iam_access_principals"("tenantType", "tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "iam_access_principals_userAccountId_tenantType_tenantId_key" ON "iam_access_principals"("userAccountId", "tenantType", "tenantId");

-- CreateIndex
CREATE INDEX "iam_role_assignments_accessPrincipalId_status_idx" ON "iam_role_assignments"("accessPrincipalId", "status");

-- CreateIndex
CREATE INDEX "iam_role_assignments_roleCode_idx" ON "iam_role_assignments"("roleCode");

-- CreateIndex
CREATE INDEX "iam_permission_grants_accessPrincipalId_permissionCode_idx" ON "iam_permission_grants"("accessPrincipalId", "permissionCode");

-- CreateIndex
CREATE INDEX "iam_permission_grants_permissionCode_revokedAt_idx" ON "iam_permission_grants"("permissionCode", "revokedAt");

-- CreateIndex
CREATE INDEX "iam_scope_restrictions_accessPrincipalId_resourceType_idx" ON "iam_scope_restrictions"("accessPrincipalId", "resourceType");

-- CreateIndex
CREATE INDEX "iam_user_sessions_userAccountId_status_idx" ON "iam_user_sessions"("userAccountId", "status");

-- CreateIndex
CREATE INDEX "iam_user_sessions_expiresAt_idx" ON "iam_user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "iam_outbox_events_eventType_publishedAt_idx" ON "iam_outbox_events"("eventType", "publishedAt");

-- CreateIndex
CREATE INDEX "iam_outbox_events_status_occurredAt_idx" ON "iam_outbox_events"("status", "occurredAt");

-- AddForeignKey
ALTER TABLE "iam_access_principals" ADD CONSTRAINT "iam_access_principals_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "iam_user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_role_assignments" ADD CONSTRAINT "iam_role_assignments_accessPrincipalId_fkey" FOREIGN KEY ("accessPrincipalId") REFERENCES "iam_access_principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_permission_grants" ADD CONSTRAINT "iam_permission_grants_accessPrincipalId_fkey" FOREIGN KEY ("accessPrincipalId") REFERENCES "iam_access_principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_scope_restrictions" ADD CONSTRAINT "iam_scope_restrictions_accessPrincipalId_fkey" FOREIGN KEY ("accessPrincipalId") REFERENCES "iam_access_principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_user_sessions" ADD CONSTRAINT "iam_user_sessions_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "iam_user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
