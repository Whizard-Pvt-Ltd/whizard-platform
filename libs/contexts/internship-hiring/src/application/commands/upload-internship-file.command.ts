export interface UploadInternshipFileCommand {
  actorUserId: string;
  tenantId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
}

export interface UploadInternshipFileResult {
  url: string;
  key: string;
}
