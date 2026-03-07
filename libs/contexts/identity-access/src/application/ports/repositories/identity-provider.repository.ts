export interface IdentityProviderRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  save(provider: Record<string, unknown>): Promise<void>;
}
