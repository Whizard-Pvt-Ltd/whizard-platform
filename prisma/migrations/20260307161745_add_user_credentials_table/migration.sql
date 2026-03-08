-- CreateTable
CREATE TABLE "iam_user_credentials" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "salt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iam_user_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iam_user_credentials_userAccountId_key" ON "iam_user_credentials"("userAccountId");

-- CreateIndex
CREATE INDEX "iam_user_credentials_userAccountId_idx" ON "iam_user_credentials"("userAccountId");

-- AddForeignKey
ALTER TABLE "iam_user_credentials" ADD CONSTRAINT "iam_user_credentials_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "iam_user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
