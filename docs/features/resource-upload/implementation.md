# Resource Upload Service

Date: 2026-04-09

## Overview

A full-featured file upload processing service ported from the `lil-upload` microservice into the whizard-platform monorepo. Lives at `libs/shared/resource-upload/` and is consumed via Core API routes or directly from any backend context.

## Architecture

```
Frontend (multipart POST)
  |
  v
Core API Route (POST /api/resource-upload/upload)
  |
  v
ResourceUploadService (libs/shared/resource-upload)
  |--- file-detector.ts      --> detect type, validate size/format
  |--- image.processor.ts    --> Sharp: resize, dimensions, thumbnails
  |--- av.processor.ts       --> FFprobe/FFmpeg: metadata, video thumbnails
  |--- pdf.processor.ts      --> pdfinfo/mutool: page count, PDF-to-image
  |
  v
IStoragePort (S3StorageAdapter)  --> uploads to Wasabi S3
  |
  v
Prisma (media_assets table)     --> persists metadata + URLs
```

## Library: `@whizard/shared-resource-upload`

**Location:** `libs/shared/resource-upload/src/`

### Entry Point

```ts
import { ResourceUploadService } from '@whizard/shared-resource-upload';

const service = new ResourceUploadService(storageAdapter);
const result = await service.processAndUpload(
  { buffer, fileName: 'photo.jpg', mimeType: 'image/jpeg' },
  { tenantId: '1', folder: 'media', generateThumbnails: true },
);
```

### Key Files

| File | Responsibility |
|---|---|
| `resource-upload.service.ts` | Main orchestrator. Detects type, processes, uploads original + thumbnails, returns `ResourceUploadResult`. |
| `file-detector.ts` | MIME-to-type detection, format validation, per-type size limits. |
| `types.ts` | All interfaces: `FileInput`, `ResourceUploadResult`, `UploadOptions`, `IStoragePort`. |
| `constants.ts` | Format arrays, MIME map, size limits (10MB image/pdf/doc, 40MB audio/video), thumbnail dimensions. |
| `errors.ts` | `UploadError` class with `statusCode` and `code`. Factories: `fileSizeError`, `invalidFileTypeError`, `zeroSizeFileError`. |
| `processing/image.processor.ts` | `getImageDimensions()`, `resizeImage()`, `generateImageThumbnail()` — all using Sharp. |
| `processing/av.processor.ts` | `getAVMetadata()` via FFprobe, `extractVideoThumbnail()` via FFmpeg. Writes temp files, cleans up after. |
| `processing/pdf.processor.ts` | `getPDFInfo()` via pdfinfo, `generatePDFThumbnail()` via mutool/ImageMagick, `convertPDFToImages()` for full PDF-to-image. |

### ResourceUploadResult

```ts
{
  resourceType: 'image' | 'video' | 'audio' | 'pdf' | 'doc',
  url: string,              // CDN URL of original file
  key: string,              // S3 object key
  format: string,           // file extension (jpg, mp4, pdf, etc.)
  mimeType: string,
  sizeBytes: number,
  width: number | null,     // images, videos, PDFs
  height: number | null,
  duration: number | null,  // audio/video in seconds
  pages: number | null,     // PDFs
  thumbnailUrl: string | null,     // small thumb (196x110)
  thumbnailKey: string | null,
  thumbnailXlUrl: string | null,   // large thumb (500x282)
  thumbnailXlKey: string | null,
  originalFilename: string,
}
```

## Processing Pipelines

### Image Upload
1. Detect type from MIME, validate format & size (max 10MB)
2. Resize if larger than 2400x1500 (aspect ratio preserved)
3. Extract final dimensions via Sharp
4. Generate XL thumbnail (500x282, JPEG, cover crop)
5. Generate small thumbnail (196x110, JPEG, cover crop)
6. Upload original + both thumbnails to S3 (parallel)

### Video Upload
1. Detect type, validate (max 40MB)
2. Upload original to S3 + extract FFprobe metadata (parallel)
3. Extract duration, dimensions, frame rate, codecs
4. Generate thumbnail at 50% duration mark via FFmpeg
5. Resize thumbnail and upload XL + small variants

### Audio Upload
1. Detect type, validate (max 40MB)
2. Upload original to S3 + extract FFprobe metadata (parallel)
3. Extract duration, codecs (no thumbnails)

### PDF Upload
1. Detect type, validate (max 10MB)
2. Upload original to S3 + extract page info via pdfinfo (parallel)
3. Extract page count, dimensions
4. Generate thumbnail from first page via mutool/ImageMagick (best-effort)
5. Resize and upload thumbnails

### Document Upload (xls, pptx, docx, etc.)
1. Detect type, validate (max 10MB)
2. Upload original to S3 (no processing)

### PDF-to-Images (separate endpoint)
1. Convert all pages to images via mutool (or ImageMagick fallback)
2. Compress to JPEG, thumbnail at 800px width
3. Upload each page image to S3
4. Return array of `ResourceUploadResult` per page

## Core API Routes

**Module prefix:** `/api/resource-upload`

### POST /api/resource-upload/upload

Upload a single file with full processing.

**Auth:** Requires `MEDIA.UPLOAD` permission.

**Request:** `multipart/form-data` with a single file field.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "photo.jpg",
    "url": "https://cdn.example.com/bucket/1/media/image/uuid.jpg",
    "key": "1/media/image/uuid.jpg",
    "type": "image",
    "mimeType": "image/jpeg",
    "sizeBytes": 245000,
    "format": "jpg",
    "width": 1920,
    "height": 1080,
    "duration": null,
    "pages": null,
    "thumbnailUrl": "https://cdn.example.com/bucket/1/media/image/thumb/uuid_196x110.jpg",
    "thumbnailXlUrl": "https://cdn.example.com/bucket/1/media/image/thumb/uuid_500x282.jpg"
  },
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "File size exceeds 10 MB limit",
  "code": "INVALID_FILE_SIZE"
}
```

### POST /api/resource-upload/pdf-to-images

Convert a PDF into individual page images.

**Auth:** Requires `MEDIA.UPLOAD` permission.

**Request:** `multipart/form-data` with a PDF file.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pages": [
      { "resourceType": "image", "url": "...", "key": "...", "width": 800, "height": 1132 },
      { "resourceType": "image", "url": "...", "key": "...", "width": 800, "height": 1132 }
    ]
  }
}
```

## Database Schema

**Table:** `media_assets`

New fields added in migration `20260409112803_add_media_asset_metadata_fields`:

| Column | Type | Description |
|---|---|---|
| `format` | `String?` | File extension (jpg, mp4, pdf) |
| `width` | `Int?` | Width in pixels (images, videos, PDFs) |
| `height` | `Int?` | Height in pixels |
| `duration` | `Float?` | Duration in seconds (audio/video) |
| `pages` | `Int?` | Page count (PDFs) |
| `thumbnail_key` | `String?` | S3 key for small thumbnail |
| `thumbnail_xl_url` | `String?` | CDN URL for large thumbnail |
| `thumbnail_xl_key` | `String?` | S3 key for large thumbnail |

Existing fields: `id`, `public_uuid`, `tenant_id`, `name`, `url`, `key`, `type`, `mime_type`, `size_bytes`, `thumbnail_url`, `is_active`, `created_by`, `created_on`, `updated_by`, `updated_on`.

## S3 Key Structure

```
{tenantId}/{folder}/{resourceType}/{uuid}.{ext}          -- original
{tenantId}/{folder}/{resourceType}/thumb/{uuid}_500x282.jpg  -- XL thumbnail
{tenantId}/{folder}/{resourceType}/thumb/{uuid}_196x110.jpg  -- small thumbnail
```

Example: `42/media/image/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

## System Dependencies

Required on the host for full feature set:

| Tool | Used For | Fallback |
|---|---|---|
| `ffmpeg` / `ffprobe` | Video/audio metadata + thumbnails | Metadata skipped, no thumbnail |
| `pdfinfo` (poppler-utils) | PDF page count + dimensions | Returns zeros |
| `mutool` (mupdf-tools) | PDF-to-image conversion | Falls back to ImageMagick `convert` |

**Node dependencies:** `sharp` (image processing, bundled with libvips).

## Usage in Other Contexts

The service is decoupled from Core API routes. Any backend context can use it directly:

```ts
import { ResourceUploadService } from '@whizard/shared-resource-upload';
import { S3StorageAdapter } from '@whizard/shared-infrastructure';

const storage = new S3StorageAdapter();
const uploadService = new ResourceUploadService(storage);

// In a command handler
const result = await uploadService.processAndUpload(
  { buffer: fileBuffer, fileName: 'report.pdf', mimeType: 'application/pdf' },
  { tenantId: '5', folder: 'reports' },
);
// result.url, result.pages, result.thumbnailUrl, etc.
```

## Differences from lil-upload

| Aspect | lil-upload | @whizard/shared-resource-upload |
|---|---|---|
| Language | JavaScript (CommonJS) | TypeScript (ESM) |
| Framework | Micro (standalone service) | Shared lib + Fastify routes |
| Storage | MongoDB for metadata | Prisma/PostgreSQL `media_assets` |
| S3 Client | aws-sdk v2 | @aws-sdk/client-s3 v3 |
| Image processing | Sharp + ImageMagick | Sharp only |
| Remote URL upload | Yes (download + process) | Not included (add if needed) |
| Vimeo/Azure storage | Yes | No (S3/Wasabi only via existing adapter) |
| Cloudinary fallback | Yes | No |
| SVG-to-PNG | svg2img | Not included (add if needed) |
| Doc-to-PNG | LibreOffice headless | Not included (add if needed) |
