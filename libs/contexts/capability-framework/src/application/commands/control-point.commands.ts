export interface CreateControlPointCommand {
  tenantId: string;
  taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  evidenceType?: string;
  kpiThreshold?: number;
  escalationRequired: boolean;
}

export interface UpdateControlPointCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  riskLevel?: string;
  failureImpactType?: string;
  evidenceType?: string;
  kpiThreshold?: number;
  escalationRequired?: boolean;
}

export interface DeleteControlPointCommand {
  id: string;
  tenantId: string;
}
