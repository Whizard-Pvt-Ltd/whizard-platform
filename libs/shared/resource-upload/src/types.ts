export type ResourceType = 'image' | 'video' | 'audio' | 'pdf' | 'doc';

export interface UploadResult {
  url: string;
  key: string;
}

export interface IStoragePort {
  upload(buffer: Buffer, key: string, contentType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export interface FileInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface ProcessedFile {
  path: string;
  name: string;
  ext: string;
  mime: string;
  type: ResourceType;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface AVMetadata {
  duration: number;
  bitRate: number;
  width?: number;
  height?: number;
  frameRate?: number;
  audioCodec?: string;
  videoCodec?: string;
}

export interface ThumbnailResult {
  url: string;
  key: string;
}

export interface ResourceUploadResult {
  resourceType: ResourceType;
  url: string;
  key: string;
  format: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  pages: number | null;
  thumbnailUrl: string | null;
  thumbnailKey: string | null;
  thumbnailXlUrl: string | null;
  thumbnailXlKey: string | null;
  originalFilename: string;
}

export interface UploadOptions {
  tenantId: string;
  folder?: string;
  generateThumbnails?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
}

