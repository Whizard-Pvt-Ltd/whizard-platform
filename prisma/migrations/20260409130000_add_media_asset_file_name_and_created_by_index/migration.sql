-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN "file_name" TEXT;

-- CreateIndex
CREATE INDEX "media_assets_created_by_idx" ON "media_assets"("created_by");
