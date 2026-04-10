/**
 * Shared Resource Upload Module
 *
 * Provides file upload processing with image resize, video/audio metadata extraction,
 * PDF processing, and thumbnail generation. Uses pluggable storage via IStoragePort.
 */

export { ResourceUploadService } from './resource-upload.service.js';

export type {
  ResourceType,
  FileInput,
  ResourceUploadResult,
  UploadOptions,
  ImageDimensions,
  AVMetadata,
  ThumbnailResult,
} from './types.js';

export { UploadError, fileSizeError, invalidFileTypeError, zeroSizeFileError } from './errors.js';
export { detectResourceType, getExtension, validateFileSize } from './file-detector.js';
export { VALID_FORMATS, FILE_SIZE_LIMITS, MIME_TO_TYPE } from './constants.js';

export {
  getImageDimensions,
  resizeImage,
  generateImageThumbnail,
  getAVMetadata,
  extractVideoThumbnail,
  getPDFInfo,
  generatePDFThumbnail,
  convertPDFToImages,
} from './processing/index.js';
