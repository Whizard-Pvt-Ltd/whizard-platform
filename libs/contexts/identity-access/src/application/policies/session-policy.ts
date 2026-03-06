export interface SessionPolicy {
  sessionTtlMinutes: number;
  refreshTtlMinutes: number;
  maxConcurrentSessions: number;
}

export const defaultSessionPolicy: SessionPolicy = {
  sessionTtlMinutes: 30,
  refreshTtlMinutes: 60 * 24 * 7,
  maxConcurrentSessions: 5
};
