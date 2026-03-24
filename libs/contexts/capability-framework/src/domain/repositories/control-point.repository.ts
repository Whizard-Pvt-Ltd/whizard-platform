import type { ControlPoint } from '../aggregates/control-point.aggregate';

export interface IControlPointRepository {
  findByTaskId(tenantId: string, taskId: string): Promise<ControlPoint[]>;
  findAllDtos(tenantId: string, taskId: string): Promise<{
    id: string;
    taskId: string;
    name: string;
    description?: string;
    riskLevel: string;
    failureImpactType: string;
    kpiThreshold?: string;
    escalationRequired: string;
    evidenceType: string;
  }[]>;
  findById(id: string): Promise<ControlPoint | null>;
  save(cp: ControlPoint): Promise<void>;
  update(cp: ControlPoint): Promise<void>;
  delete(id: string): Promise<void>;
}
