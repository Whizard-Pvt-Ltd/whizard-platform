import { randomUUID } from 'crypto';
import type { IStoragePort } from '@whizard/shared-infrastructure';
import type { UploadMediaAssetCommand } from '../commands/upload-media-asset.command.js';
import type { MediaAssetDto } from '../dto/company.dto.js';

export interface IMediaAssetRepository {
  save(asset: { id: string; tenantId: string; name: string; url: string; key: string; type: string; mimeType: string; sizeBytes: number; thumbnailUrl: null; createdBy: string }): Promise<void>;
}

export class UploadMediaAssetCommandHandler {
  constructor(
    private readonly mediaRepo: IMediaAssetRepository,
    private readonly storage: IStoragePort,
  ) {}

  async execute(cmd: UploadMediaAssetCommand): Promise<MediaAssetDto> {
    const ext  = cmd.fileName.split('.').pop() ?? '';
    const type = cmd.mimeType.startsWith('video') ? 'video' : cmd.mimeType === 'application/pdf' ? 'pdf' : 'image';
    const key  = `${cmd.tenantId}/company-media/${type}/${randomUUID()}.${ext}`;

    const { url } = await this.storage.upload(cmd.buffer, key, cmd.mimeType);

    const asset = {
      id: randomUUID(),
      tenantId: cmd.tenantId,
      name: cmd.fileName,
      url,
      key,
      type,
      mimeType: cmd.mimeType,
      sizeBytes: cmd.sizeBytes,
      thumbnailUrl: null as null,
      createdBy: cmd.actorUserId,
    };

    await this.mediaRepo.save(asset);

    return {
      id: asset.id,
      name: asset.name,
      url: asset.url,
      key: asset.key,
      type: asset.type,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      thumbnailUrl: null,
    };
  }
}
