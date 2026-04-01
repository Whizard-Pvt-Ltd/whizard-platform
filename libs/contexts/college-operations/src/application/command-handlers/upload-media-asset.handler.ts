import { randomUUID } from 'crypto';
import type { IMediaAssetRepository } from '../../domain/repositories/media-asset.repository.js';
import type { UploadMediaAssetCommand } from '../commands/upload-media-asset.command.js';
import type { MediaAssetDto } from '../dto/college.dto.js';
import type { IStoragePort } from '../ports/storage.port.js';

export class UploadMediaAssetCommandHandler {
  constructor(
    private readonly mediaRepo: IMediaAssetRepository,
    private readonly storage: IStoragePort,
  ) {}

  async execute(cmd: UploadMediaAssetCommand): Promise<MediaAssetDto> {
    const ext = cmd.fileName.split('.').pop() ?? '';
    const key = `${cmd.tenantId}/college-media/${cmd.assetType}/${randomUUID()}.${ext}`;

    const { url } = await this.storage.upload(cmd.buffer, key, cmd.contentType);

    const asset = {
      id: randomUUID(),
      tenantId: cmd.tenantId,
      name: cmd.fileName,
      url,
      key,
      type: cmd.assetType,
      mimeType: cmd.contentType,
      sizeBytes: cmd.buffer.length,
      thumbnailUrl: null,
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
