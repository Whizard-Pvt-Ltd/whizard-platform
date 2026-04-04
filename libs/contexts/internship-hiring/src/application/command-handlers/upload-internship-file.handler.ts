import type { UploadInternshipFileCommand, UploadInternshipFileResult } from '../commands/upload-internship-file.command.js';

export interface IFileStorage {
  upload(buffer: Buffer, key: string, mimeType: string): Promise<{ url: string; key: string }>;
}

export class UploadInternshipFileCommandHandler {
  constructor(private readonly storage: IFileStorage) {}

  async execute(cmd: UploadInternshipFileCommand): Promise<UploadInternshipFileResult> {
    const key = `internships/${cmd.tenantId}/${Date.now()}-${cmd.fileName}`;
    const result = await this.storage.upload(cmd.buffer, key, cmd.mimeType);
    return { url: result.url, key: result.key };
  }
}
