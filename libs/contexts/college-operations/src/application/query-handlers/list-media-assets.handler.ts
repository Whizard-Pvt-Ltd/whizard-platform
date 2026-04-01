import type { IMediaAssetRepository } from '../../domain/repositories/media-asset.repository.js';
import type { MediaAssetDto } from '../dto/college.dto.js';

export interface ListMediaAssetsQuery {
  tenantId: string;
  type?: string;
}

export class ListMediaAssetsQueryHandler {
  constructor(private readonly mediaRepo: IMediaAssetRepository) {}

  async execute(query: ListMediaAssetsQuery): Promise<MediaAssetDto[]> {
    const assets = await this.mediaRepo.findByTenant(query.tenantId, query.type);
    return assets.map(a => ({
      id: a.id,
      name: a.name,
      url: a.url,
      key: a.key,
      type: a.type,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      thumbnailUrl: a.thumbnailUrl,
    }));
  }
}
