export interface PermissionGrantRecord {
  id: string;
  accessPrincipalId: string;
  permissionCode: string;
  grantSource: string;
  scopeType: string | null;
  scopeValue: string | null;
  grantedAt: Date;
  revokedAt: Date | null;
}
