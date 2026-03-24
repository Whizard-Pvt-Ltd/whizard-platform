export interface CreateControlPointCommand {
  tenantId: string;
  taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  kpiThreshold?: string;
  escalationRequired: string;
  evidenceType: string;
}

export interface UpdateControlPointCommand {
  id: string;
  tenantId: string;
  name?: string;
  description?: string;
  riskLevel?: string;
  failureImpactType?: string;
  kpiThreshold?: string;
  escalationRequired?: string;
  evidenceType?: string;
}

export interface DeleteControlPointCommand {
  id: string;
  tenantId: string;
}
