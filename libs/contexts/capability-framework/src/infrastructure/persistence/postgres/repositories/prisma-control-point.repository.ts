import { getPrisma } from '@whizard/shared-infrastructure';
import { ControlPoint } from '../../../../domain/aggregates/control-point.aggregate';
import type { IControlPointRepository } from '../../../../domain/repositories/control-point.repository';
import type { ControlPointDto } from '../../../../application/dto/control-point.dto';

export class PrismaControlPointRepository implements IControlPointRepository {
  private readonly prisma = getPrisma();

  async findByTaskId(tenantId: string, taskId: string): Promise<ControlPoint[]> {
    const rows = await this.prisma.controlPoint.findMany({ where: { tenantId, taskId, isActive: true } });
    return rows.map(r => ControlPoint.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      taskId: r.taskId,
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired,
      evidenceType: r.evidenceType
    }));
  }

  async findAllDtos(tenantId: string, taskId: string): Promise<ControlPointDto[]> {
    const rows = await this.prisma.controlPoint.findMany({
      where: { tenantId, taskId, isActive: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      taskId: r.taskId,
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired,
      evidenceType: r.evidenceType
    }));
  }

  async findById(id: string): Promise<ControlPoint | null> {
    const r = await this.prisma.controlPoint.findUnique({ where: { id } });
    if (!r) return null;
    return ControlPoint.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      taskId: r.taskId,
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired,
      evidenceType: r.evidenceType
    });
  }

  async save(cp: ControlPoint): Promise<void> {
    await this.prisma.controlPoint.create({
      data: {
        id: cp.id,
        tenantId: cp.tenantId,
        taskId: cp.taskId,
        name: cp.name,
        description: cp.description,
        riskLevel: cp.riskLevel,
        failureImpactType: cp.failureImpactType,
        kpiThreshold: cp.kpiThreshold,
        escalationRequired: cp.escalationRequired,
        evidenceType: cp.evidenceType
      }
    });
  }

  async update(cp: ControlPoint): Promise<void> {
    await this.prisma.controlPoint.update({
      where: { id: cp.id },
      data: {
        name: cp.name,
        description: cp.description,
        riskLevel: cp.riskLevel,
        failureImpactType: cp.failureImpactType,
        kpiThreshold: cp.kpiThreshold,
        escalationRequired: cp.escalationRequired,
        evidenceType: cp.evidenceType
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.controlPoint.update({ where: { id }, data: { isActive: false } });
  }
}
