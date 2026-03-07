export interface FederatedAccountRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  save(account: Record<string, unknown>): Promise<void>;
}
