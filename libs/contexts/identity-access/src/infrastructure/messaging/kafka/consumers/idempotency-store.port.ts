export interface IdempotencyStorePort {
  has(key: string): Promise<boolean>;
  put(key: string, ttlSeconds?: number): Promise<void>;
}
