export interface RoleAssignmentRecord {
  id: string;
  accessPrincipalId: string;
  roleCode: string;
  assignedBy: string;
  assignedAt: Date;
  validFrom: Date | null;
  validTo: Date | null;
  status: string;
}
