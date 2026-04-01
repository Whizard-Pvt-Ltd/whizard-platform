export interface UploadMediaAssetCommand {
  actorUserId: string;
  tenantId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
}
