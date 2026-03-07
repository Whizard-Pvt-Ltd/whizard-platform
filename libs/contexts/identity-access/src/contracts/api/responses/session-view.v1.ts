import type { SessionStatus } from '../shared/transport-enums';

export interface SessionViewV1 {
  sessionId: string;
  status: SessionStatus;
  issuedAt: string;
  lastActivityAt: string;
  expiresAt: string;
  clientContext: string;
}
