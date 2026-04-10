import type { ResourceType } from './types.js';
import { MIME_TO_TYPE, VALID_FORMATS, FILE_SIZE_LIMITS } from './constants.js';
import { invalidFileTypeError, fileSizeError, zeroSizeFileError } from './errors.js';

export function detectResourceType(mimeType: string): ResourceType {
  const type = MIME_TO_TYPE[mimeType];
  if (type) return type;

  const [category] = mimeType.split('/');
  if (category === 'image') return 'image';
  if (category === 'video') return 'video';
  if (category === 'audio') return 'audio';

  throw invalidFileTypeError(mimeType);
}

export function getExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function validateFormat(type: ResourceType, ext: string): void {
  const allowed = VALID_FORMATS[type];
  if (!allowed.includes(ext)) {
    throw invalidFileTypeError(`${type}/${ext}`);
  }
}

export function validateFileSize(type: ResourceType, sizeBytes: number): void {
  if (sizeBytes === 0) throw zeroSizeFileError();

  const limit = FILE_SIZE_LIMITS[type];
  if (sizeBytes > limit) {
    throw fileSizeError(Math.round(limit / (1024 * 1024)));
  }
}
