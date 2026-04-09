import sharp from 'sharp';
import type { ImageDimensions } from '../types.js';

export async function getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

export async function resizeImage(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number,
): Promise<Buffer> {
  const { width, height } = await getImageDimensions(buffer);

  if (width <= maxWidth && height <= maxHeight) {
    return buffer;
  }

  return sharp(buffer)
    .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
    .toBuffer();
}

export async function generateImageThumbnail(
  buffer: Buffer,
  width: number,
  height: number,
  quality = 50,
): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width, height, fit: 'cover' })
    .jpeg({ quality })
    .toBuffer();
}
