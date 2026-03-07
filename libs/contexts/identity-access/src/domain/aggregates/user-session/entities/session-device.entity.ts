export interface SessionDevice {
  deviceId: string;
  deviceFingerprint: string;
  userAgent: string;
  ipHash: string;
  lastSeenAt: Date;
}
