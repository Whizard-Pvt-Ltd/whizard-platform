export interface MediaAssetRecord {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  key: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailUrl: string | null;
}

export interface IMediaAssetRepository {
  findById(id: string): Promise<MediaAssetRecord | null>;
  findByTenant(tenantId: string, type?: string): Promise<MediaAssetRecord[]>;
  save(asset: MediaAssetRecord & { createdBy: string }): Promise<void>;
}
