export interface UploadMediaAssetCommand {
  actorUserId: string;
  tenantId: string;
  fileName: string;
  contentType: string;
  buffer: Buffer;
  assetType: 'image' | 'video' | 'pdf';
}
