/**
 * Shared Infrastructure Module
 *
 * Provides database infrastructure for Whizard Platform applications.
 * For logging, use @whizard/shared-logging instead.
 */

// Export database utilities
export { getPrisma } from './database.js';

// Export S3 storage
export { S3StorageAdapter } from './s3storage/s3-storage.adapter.js';
export type { IStoragePort, UploadResult } from './s3storage/storage.port.js';
