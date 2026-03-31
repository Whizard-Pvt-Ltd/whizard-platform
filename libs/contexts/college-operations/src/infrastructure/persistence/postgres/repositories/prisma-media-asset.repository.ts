import { getPrisma } from '@whizard/shared-infrastructure';
import type { IMediaAssetRepository, MediaAssetRecord } from '../../../../domain/repositories/media-asset.repository.js';

export class PrismaMediaAssetRepository implements IMediaAssetRepository {
  private get prisma() { return getPrisma(); }

  async findById(id: string): Promise<MediaAssetRecord | null> {
    const row = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!row) return null;
    return { id: row.id, tenantId: row.tenantId, name: row.name, url: row.url, key: row.key, type: row.type, mimeType: row.mimeType, sizeBytes: row.sizeBytes, thumbnailUrl: row.thumbnailUrl };
  }

  async findByTenant(tenantId: string, type?: string): Promise<MediaAssetRecord[]> {
    const rows = await this.prisma.mediaAsset.findMany({
      where: { tenantId, isActive: true, ...(type && { type }) },
      orderBy: { createdOn: 'desc' },
    });
    return rows.map(r => ({ id: r.id, tenantId: r.tenantId, name: r.name, url: r.url, key: r.key, type: r.type, mimeType: r.mimeType, sizeBytes: r.sizeBytes, thumbnailUrl: r.thumbnailUrl }));
  }

  async save(asset: MediaAssetRecord & { createdBy: string }): Promise<void> {
    await this.prisma.mediaAsset.upsert({
      where: { id: asset.id },
      update: { name: asset.name, url: asset.url, thumbnailUrl: asset.thumbnailUrl, updatedBy: asset.createdBy },
      create: {
        id: asset.id, tenantId: asset.tenantId, name: asset.name, url: asset.url, key: asset.key,
        type: asset.type, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes,
        thumbnailUrl: asset.thumbnailUrl, isActive: true, createdBy: asset.createdBy,
      },
    });
  }
}
