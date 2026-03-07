export interface InvitationRecord {
  id: string;
  provisionedAccessId: string;
  invitedBy: string;
  inviteeEmail: string;
  tokenHash: string;
  status: string;
  expiresAt: Date;
  acceptedAt: Date | null;
}
