export interface SessionDeviceRecord {
  id: string;
  sessionId: string;
  deviceFingerprint: string;
  userAgent: string;
  ipHash: string;
  lastSeenAt: Date;
}
