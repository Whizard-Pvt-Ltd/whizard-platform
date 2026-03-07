import { SessionTimeWindow } from '../value-objects/session-time-window';

export class SessionPolicyService {
  buildWindow(input: {
    issuedAt: Date;
    accessTtlMinutes: number;
    refreshTtlMinutes: number;
  }): SessionTimeWindow {
    const expiresAt = new Date(input.issuedAt.getTime() + input.accessTtlMinutes * 60_000);
    const refreshExpiresAt = new Date(input.issuedAt.getTime() + input.refreshTtlMinutes * 60_000);

    return SessionTimeWindow.from({
      issuedAt: input.issuedAt,
      expiresAt,
      refreshExpiresAt
    });
  }
}
