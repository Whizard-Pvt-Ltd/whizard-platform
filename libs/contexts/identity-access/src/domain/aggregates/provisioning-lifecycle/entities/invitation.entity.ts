export interface Invitation {
  invitationId: string;
  inviteeEmail: string;
  tokenHash: string;
  invitedBy: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: Date;
  acceptedAt: Date | null;
}
