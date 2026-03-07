import type { IdempotencyStorePort } from './idempotency-store.port';

export class InMemoryIdempotencyStore implements IdempotencyStorePort {
  private readonly entries = new Map<string, number>();

  async has(key: string): Promise<boolean> {
    const expiresAt = this.entries.get(key);
    if (!expiresAt) {
      return false;
    }

    if (Date.now() > expiresAt) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  async put(key: string, ttlSeconds: number = 60 * 60): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.entries.set(key, expiresAt);
  }
}
