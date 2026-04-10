import type { ControlPoint } from '../aggregates/control-point.aggregate';

export interface ControlPointDto {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  kpiThreshold?: number;
  escalationRequired: boolean;
  evidenceType?: string;
  canEdit: boolean;
}

export interface IControlPointRepository {
  findByTaskId(tenantId: string, taskId: string): Promise<ControlPoint[]>;
  findAllDtos(taskId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<ControlPointDto[]>;
  findById(id: string): Promise<ControlPoint | null>;
  existsByName(name: string, taskId: string, tenantId: string): Promise<boolean>;
  save(cp: ControlPoint): Promise<void>;
  update(cp: ControlPoint): Promise<void>;
  delete(id: string): Promise<void>;
}
