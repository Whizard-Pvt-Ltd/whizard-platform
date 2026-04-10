import type { ResourceType } from './types.js';

export const VALID_FORMATS: Record<ResourceType, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'webm', 'ogg', 'mov', 'mkv', '3gp', '3gpp'],
  audio: ['mp3', 'wav', 'aac', 'wma', 'gsm'],
  pdf: ['pdf'],
  doc: ['xls', 'xlsx', 'ppt', 'pptx', 'doc', 'docx'],
};

export const MIME_TO_TYPE: Record<string, ResourceType> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/bmp': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
  'video/x-matroska': 'video',
  'video/3gpp': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/aac': 'audio',
  'audio/x-ms-wma': 'audio',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'doc',
  'application/vnd.ms-powerpoint': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'doc',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
};

export const MB = 1048576;

export const FILE_SIZE_LIMITS: Record<ResourceType, number> = {
  image: 10 * MB,
  pdf: 10 * MB,
  doc: 10 * MB,
  video: 40 * MB,
  audio: 40 * MB,
};

export const IMAGE_RESIZE = { maxWidth: 2400, maxHeight: 1500 } as const;

export const THUMB = { width: 196, height: 110 } as const;
export const THUMB_XL = { width: 500, height: 282 } as const;
