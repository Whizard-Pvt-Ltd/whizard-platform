-- AddColumn: stackAuthUserId to UserAccount
ALTER TABLE "iam_user_accounts" ADD COLUMN "stackAuthUserId" TEXT;

-- CreateIndex: stackAuthUserId unique constraint
CREATE UNIQUE INDEX "iam_user_accounts_stackAuthUserId_key" ON "iam_user_accounts"("stackAuthUserId");

-- CreateIndex: stackAuthUserId index for faster lookups
CREATE INDEX "iam_user_accounts_stackAuthUserId_idx" ON "iam_user_accounts"("stackAuthUserId");
