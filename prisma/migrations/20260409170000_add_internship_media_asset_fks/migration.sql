-- AlterTable
ALTER TABLE "internships" ADD COLUMN "banner_image_asset_id" BIGINT;
ALTER TABLE "internships" ADD COLUMN "offer_letter_asset_id" BIGINT;
ALTER TABLE "internships" ADD COLUMN "terms_condition_asset_id" BIGINT;
ALTER TABLE "internships" ADD COLUMN "certificate_asset_id" BIGINT;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_banner_image_asset_id_fkey" FOREIGN KEY ("banner_image_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "internships" ADD CONSTRAINT "internships_offer_letter_asset_id_fkey" FOREIGN KEY ("offer_letter_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "internships" ADD CONSTRAINT "internships_terms_condition_asset_id_fkey" FOREIGN KEY ("terms_condition_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "internships" ADD CONSTRAINT "internships_certificate_asset_id_fkey" FOREIGN KEY ("certificate_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
