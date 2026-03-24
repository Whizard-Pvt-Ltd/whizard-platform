export interface ControlPointDto {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  kpiThreshold?: string;
  escalationRequired: string;
  evidenceType: string;
}
