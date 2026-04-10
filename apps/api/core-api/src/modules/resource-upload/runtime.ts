import { S3StorageAdapter, getPrisma } from '@whizard/shared-infrastructure';
import { ResourceUploadService } from '@whizard/shared-resource-upload';
import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerResourceUploadModule } from './resource-upload.module';

export interface MediaAssetSaveInput {
  tenantId: string;
  name: string;
  fileName: string;
  url: string;
  key: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  pages: number | null;
  thumbnailUrl: string | null;
  thumbnailKey: string | null;
  thumbnailXlUrl: string | null;
  thumbnailXlKey: string | null;
  createdBy: string;
}

export interface MediaAssetDto {
  id: string;
  name: string;
  url: string;
  key: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  pages: number | null;
  thumbnailUrl: string | null;
  thumbnailXlUrl: string | null;
}

export interface ResourceUploadModuleDependencies {
  readonly uploadService: ResourceUploadService;
  readonly saveMediaAsset: (input: MediaAssetSaveInput) => Promise<MediaAssetDto>;
  readonly getSignedUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
}

async function saveMediaAsset(input: MediaAssetSaveInput): Promise<MediaAssetDto> {
  const prisma = getPrisma();

  let createdById = BigInt(0);
  if (input.createdBy) {
    const user = await prisma.userAccount.findFirst({
      where: { publicUuid: input.createdBy },
      select: { id: true },
    });
    if (user) createdById = user.id;
  }

  const record = await prisma.mediaAsset.create({
    data: {
      tenantId: BigInt(input.tenantId),
      name: input.name,
      fileName: input.fileName,
      url: input.url,
      key: input.key,
      type: input.type,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      format: input.format,
      width: input.width,
      height: input.height,
      duration: input.duration,
      pages: input.pages,
      thumbnailUrl: input.thumbnailUrl,
      thumbnailKey: input.thumbnailKey,
      thumbnailXlUrl: input.thumbnailXlUrl,
      thumbnailXlKey: input.thumbnailXlKey,
      createdBy: createdById,
    },
  });

  return {
    id: record.publicUuid,
    name: record.name,
    url: record.url,
    key: record.key,
    type: record.type,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    format: record.format,
    width: record.width,
    height: record.height,
    duration: record.duration,
    pages: record.pages,
    thumbnailUrl: record.thumbnailUrl,
    thumbnailXlUrl: record.thumbnailXlUrl,
  };
}

export const registerResourceUploadCoreApiRuntime = async (app: FastifyInstanceLike): Promise<void> => {
  const storage = new S3StorageAdapter();
  const uploadService = new ResourceUploadService(storage);

  const deps: ResourceUploadModuleDependencies = {
    uploadService,
    saveMediaAsset,
    getSignedUrl: (key, expiresInSeconds) => storage.getSignedUrl(key, expiresInSeconds),
  };

  await registerResourceUploadModule(app, deps);
};
