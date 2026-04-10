import { randomUUID } from 'crypto';
import type { IStoragePort, FileInput, ResourceUploadResult, UploadOptions } from './types.js';
import { IMAGE_RESIZE, THUMB, THUMB_XL } from './constants.js';
import { detectResourceType, getExtension, validateFileSize } from './file-detector.js';
import {
  getImageDimensions,
  resizeImage,
  generateImageThumbnail,
  getAVMetadata,
  extractVideoThumbnail,
  getPDFInfo,
  generatePDFThumbnail,
  convertPDFToImages,
} from './processing/index.js';

export class ResourceUploadService {
  constructor(private readonly storage: IStoragePort) {}

  async processAndUpload(file: FileInput, options: UploadOptions): Promise<ResourceUploadResult> {
    const { buffer, fileName, mimeType } = file;
    const { tenantId, folder = 'media', generateThumbnails = true } = options;

    const resourceType = detectResourceType(mimeType);
    const ext = getExtension(fileName) || mimeType.split('/').pop() || 'bin';
    validateFileSize(resourceType, buffer.length);

    const basePath = `${folder}/${resourceType}`;
    const fileId = randomUUID();
    const key = `${basePath}/${fileId}.${ext}`;

    const result: ResourceUploadResult = {
      resourceType,
      url: '',
      key,
      format: ext,
      mimeType,
      sizeBytes: buffer.length,
      width: null,
      height: null,
      duration: null,
      pages: null,
      thumbnailUrl: null,
      thumbnailKey: null,
      thumbnailXlUrl: null,
      thumbnailXlKey: null,
      originalFilename: fileName,
    };

    switch (resourceType) {
      case 'image':
        await this.processImage(buffer, key, ext, basePath, fileId, generateThumbnails, options, result);
        break;

      case 'video':
        await this.processVideo(buffer, key, ext, basePath, fileId, mimeType, generateThumbnails, result);
        break;

      case 'audio':
        await this.processAudio(buffer, key, ext, mimeType, result);
        break;

      case 'pdf':
        await this.processPDF(buffer, key, basePath, fileId, generateThumbnails, result);
        break;

      case 'doc':
        await this.processDoc(buffer, key, result);
        break;
    }

    return result;
  }

  async convertPdfToImages(buffer: Buffer, _tenantId: string, folder = 'media'): Promise<ResourceUploadResult[]> {
    const basePath = `${folder}/pdf-pages`;
    const pageBuffers = await convertPDFToImages(buffer);

    const results: ResourceUploadResult[] = [];
    for (let i = 0; i < pageBuffers.length; i++) {
      const pageBuffer = pageBuffers[i];
      const pageKey = `${basePath}/${randomUUID()}.jpg`;
      const { url } = await this.storage.upload(pageBuffer, pageKey, 'image/jpeg');
      const dims = await getImageDimensions(pageBuffer);

      results.push({
        resourceType: 'image',
        url,
        key: pageKey,
        format: 'jpg',
        mimeType: 'image/jpeg',
        sizeBytes: pageBuffer.length,
        width: dims.width,
        height: dims.height,
        duration: null,
        pages: null,
        thumbnailUrl: null,
        thumbnailKey: null,
        thumbnailXlUrl: null,
        thumbnailXlKey: null,
        originalFilename: `page-${i + 1}.jpg`,
      });
    }

    return results;
  }

  private async processImage(
    buffer: Buffer, key: string, ext: string, basePath: string,
    fileId: string, generateThumbnails: boolean,
    options: UploadOptions, result: ResourceUploadResult,
  ): Promise<void> {
    const maxW = options.maxImageWidth ?? IMAGE_RESIZE.maxWidth;
    const maxH = options.maxImageHeight ?? IMAGE_RESIZE.maxHeight;

    const resized = await resizeImage(buffer, maxW, maxH);
    const dims = await getImageDimensions(resized);
    result.width = dims.width;
    result.height = dims.height;
    result.sizeBytes = resized.length;

    const uploadPromises: Promise<void>[] = [
      this.storage.upload(resized, key, result.mimeType).then(({ url }) => { result.url = url; }),
    ];

    if (generateThumbnails) {
      uploadPromises.push(
        this.uploadThumbnail(resized, basePath, fileId, THUMB_XL.width, THUMB_XL.height)
          .then(t => { if (t) { result.thumbnailXlUrl = t.url; result.thumbnailXlKey = t.key; } }),
        this.uploadThumbnail(resized, basePath, fileId, THUMB.width, THUMB.height)
          .then(t => { if (t) { result.thumbnailUrl = t.url; result.thumbnailKey = t.key; } }),
      );
    }

    await Promise.all(uploadPromises);
  }

  private async processVideo(
    buffer: Buffer, key: string, ext: string, basePath: string,
    fileId: string, mimeType: string, generateThumbnails: boolean,
    result: ResourceUploadResult,
  ): Promise<void> {
    const [uploadResult, metadata] = await Promise.all([
      this.storage.upload(buffer, key, mimeType),
      getAVMetadata(buffer, ext).catch(() => null),
    ]);

    result.url = uploadResult.url;

    if (metadata) {
      result.duration = metadata.duration;
      result.width = metadata.width ?? null;
      result.height = metadata.height ?? null;
    }

    if (generateThumbnails && metadata?.duration) {
      try {
        const thumbBuffer = await extractVideoThumbnail(buffer, ext, metadata.duration);
        const thumbResult = await this.uploadThumbnail(thumbBuffer, basePath, fileId, THUMB_XL.width, THUMB_XL.height);
        if (thumbResult) {
          result.thumbnailXlUrl = thumbResult.url;
          result.thumbnailXlKey = thumbResult.key;
        }
        const thumbSmResult = await this.uploadThumbnail(thumbBuffer, basePath, fileId, THUMB.width, THUMB.height);
        if (thumbSmResult) {
          result.thumbnailUrl = thumbSmResult.url;
          result.thumbnailKey = thumbSmResult.key;
        }
      } catch {
        // Video thumbnail generation is best-effort
      }
    }
  }

  private async processAudio(
    buffer: Buffer, key: string, ext: string, mimeType: string,
    result: ResourceUploadResult,
  ): Promise<void> {
    const [uploadResult, metadata] = await Promise.all([
      this.storage.upload(buffer, key, mimeType),
      getAVMetadata(buffer, ext).catch(() => null),
    ]);

    result.url = uploadResult.url;
    if (metadata) {
      result.duration = metadata.duration;
    }
  }

  private async processPDF(
    buffer: Buffer, key: string, basePath: string,
    fileId: string, generateThumbnails: boolean,
    result: ResourceUploadResult,
  ): Promise<void> {
    const [uploadResult, pdfInfo] = await Promise.all([
      this.storage.upload(buffer, key, 'application/pdf'),
      getPDFInfo(buffer),
    ]);

    result.url = uploadResult.url;
    result.pages = pdfInfo.pages;
    result.width = pdfInfo.width || null;
    result.height = pdfInfo.height || null;

    if (generateThumbnails) {
      try {
        const thumbBuffer = await generatePDFThumbnail(buffer);
        if (thumbBuffer) {
          const [thumbXl, thumbSm] = await Promise.all([
            this.uploadThumbnail(thumbBuffer, basePath, fileId, THUMB_XL.width, THUMB_XL.height),
            this.uploadThumbnail(thumbBuffer, basePath, fileId, THUMB.width, THUMB.height),
          ]);
          if (thumbXl) { result.thumbnailXlUrl = thumbXl.url; result.thumbnailXlKey = thumbXl.key; }
          if (thumbSm) { result.thumbnailUrl = thumbSm.url; result.thumbnailKey = thumbSm.key; }
        }
      } catch {
        // PDF thumbnail generation is best-effort
      }
    }
  }

  private async processDoc(
    buffer: Buffer, key: string, result: ResourceUploadResult,
  ): Promise<void> {
    const { url } = await this.storage.upload(buffer, key, result.mimeType);
    result.url = url;
  }

  private async uploadThumbnail(
    sourceBuffer: Buffer, basePath: string, fileId: string,
    width: number, height: number,
  ): Promise<{ url: string; key: string } | null> {
    try {
      const thumbBuffer = await generateImageThumbnail(sourceBuffer, width, height);
      const thumbKey = `${basePath}/thumb/${fileId}_${width}x${height}.jpg`;
      const { url } = await this.storage.upload(thumbBuffer, thumbKey, 'image/jpeg');
      return { url, key: thumbKey };
    } catch {
      return null;
    }
  }
}
