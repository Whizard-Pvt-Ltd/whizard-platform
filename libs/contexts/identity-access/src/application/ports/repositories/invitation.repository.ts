export interface InvitationRepository {
  findById(id: string): Promise<Record<string, unknown> | null>;
  save(invitation: Record<string, unknown>): Promise<void>;
}
