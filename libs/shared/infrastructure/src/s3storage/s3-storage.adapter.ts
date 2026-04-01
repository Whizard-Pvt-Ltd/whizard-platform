import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStoragePort, UploadResult } from './storage.port.js';

export class S3StorageAdapter implements IStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl: string;
  private readonly wasabi_folder: string;
  private readonly wasabi_endpoint: string


  constructor() {
    this.region = process.env['AWS_REGION'] ?? 'ap-northeast-2';
    this.bucket = process.env['AWS_BUCKET'] ?? '';
    this.wasabi_endpoint = process.env['AWS_S3_ENDPOINT'] ?? '';
    this.cdnUrl = process.env['S3_CDN_URL'] ?? '';
    this.wasabi_folder = 'media-assets'

    this.client = new S3Client({
      region: this.region,
      endpoint: this.wasabi_endpoint, 

      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
      },

      forcePathStyle: true,
    });
  }

  async upload(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    const url = `${this.cdnUrl}/${this.bucket}/${this.wasabi_folder}/${new Date}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
