import { getPrisma } from '@whizard/shared-infrastructure';
import type { IMediaAssetRepository } from '../../../../application/command-handlers/upload-media-asset.handler.js';

export class PrismaMediaAssetRepository implements IMediaAssetRepository {
  private get prisma() { return getPrisma(); }

  async save(asset: { id: string; tenantId: string; name: string; url: string; key: string; type: string; mimeType: string; sizeBytes: number; thumbnailUrl: null; createdBy: string }): Promise<void> {
    await this.prisma.mediaAsset.create({
      data: {
        tenantId: BigInt(asset.tenantId),
        name: asset.name,
        url: asset.url,
        key: asset.key,
        type: asset.type,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        thumbnailUrl: asset.thumbnailUrl,
        createdBy: BigInt(0),
      },
    });
  }
}
