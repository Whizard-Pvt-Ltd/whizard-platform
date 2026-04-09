-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "thumbnail_key" TEXT,
ADD COLUMN     "thumbnail_xl_key" TEXT,
ADD COLUMN     "thumbnail_xl_url" TEXT,
ADD COLUMN     "width" INTEGER;
