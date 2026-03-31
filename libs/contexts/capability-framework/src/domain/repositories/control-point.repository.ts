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
}

export interface IControlPointRepository {
  findByTaskId(tenantId: string, taskId: string): Promise<ControlPoint[]>;
  findAllDtos(tenantId: string, taskId: string): Promise<ControlPointDto[]>;
  findById(id: string): Promise<ControlPoint | null>;
  save(cp: ControlPoint): Promise<void>;
  update(cp: ControlPoint): Promise<void>;
  delete(id: string): Promise<void>;
}
