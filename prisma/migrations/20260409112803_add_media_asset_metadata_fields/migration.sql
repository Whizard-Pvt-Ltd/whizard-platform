-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "thumbnail_key" TEXT,
ADD COLUMN     "thumbnail_xl_key" TEXT,
ADD COLUMN     "thumbnail_xl_url" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE INDEX "media_assets_created_by_idx" ON "media_assets"("created_by");
