export interface ProvisionedAccessRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  save(access: Record<string, unknown>): Promise<void>;
}
