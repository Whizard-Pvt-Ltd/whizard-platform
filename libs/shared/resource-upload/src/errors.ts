export class UploadError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function fileSizeError(limitMB: number): UploadError {
  return new UploadError(`File size exceeds ${limitMB} MB limit`, 'INVALID_FILE_SIZE');
}

export function invalidFileTypeError(mimeType: string): UploadError {
  return new UploadError(`File type not allowed: ${mimeType}`, 'FILE_TYPE_NOT_ALLOWED');
}

export function zeroSizeFileError(): UploadError {
  return new UploadError('File size is 0 bytes', 'FILE_SIZE_ZERO');
}

export function processingError(detail: string): UploadError {
  return new UploadError(`File processing failed: ${detail}`, 'PROCESSING_ERROR', 500);
}
