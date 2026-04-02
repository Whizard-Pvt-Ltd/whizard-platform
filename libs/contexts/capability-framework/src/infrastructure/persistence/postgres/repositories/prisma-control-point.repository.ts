import { getPrisma } from '@whizard/shared-infrastructure';
import type { ControlPointDto } from '../../../../application/dto/control-point.dto';
import type { IControlPointRepository } from '../../../../domain/repositories/control-point.repository';
import { ControlPoint } from '../../../../domain/aggregates/control-point.aggregate';

export class PrismaControlPointRepository implements IControlPointRepository {
  private readonly prisma = getPrisma();

  private async createControlPoint(cp: ControlPoint): Promise<void> {
    await this.prisma.controlPoint.create({
      data: {
        tenantId: BigInt(cp.tenantId),
        taskId: BigInt(cp.taskId),
        name: cp.name,
        description: cp.description,
        riskLevel: cp.riskLevel,
        failureImpactType: cp.failureImpactType,
        kpiThreshold: cp.kpiThreshold,
        escalationRequired: cp.escalationRequired
      }
    });
  }

  private isDuplicateControlPointIdError(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) return false;
    if (error.code !== 'P2002') return false;

    const target = 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta
      ? error.meta.target
      : undefined;

    if (Array.isArray(target)) {
      return target.includes('id');
    }

    return typeof target === 'string' && target.includes('id');
  }

  private async resyncControlPointIdSequence(): Promise<void> {
    await this.prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('control_points', 'id'),
        COALESCE((SELECT MAX(id) FROM control_points), 0) + 1,
        false
      )
    `;
  }

  async findByTaskId(tenantId: string, taskId: string): Promise<ControlPoint[]> {
    const rows = await this.prisma.controlPoint.findMany({
      where: {
        tenantId: BigInt(tenantId),
        taskId: BigInt(taskId),
        isActive: true
      }
    });
    return rows.map(r => ControlPoint.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      taskId: r.taskId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      evidenceType: r.evidenceType ?? '',
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired
    }));
  }

  async findAllDtos(tenantId: string, taskId: string): Promise<ControlPointDto[]> {
    const rows = await this.prisma.controlPoint.findMany({
      where: {
        tenantId: BigInt(tenantId),
        taskId: BigInt(taskId),
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      taskId: r.taskId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired
    }));
  }

  async findById(id: string): Promise<ControlPoint | null> {
    const r = await this.prisma.controlPoint.findUnique({
      where: { id: BigInt(id) }
    });
    if (!r) return null;
    return ControlPoint.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      taskId: r.taskId.toString(),
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: r.riskLevel,
      failureImpactType: r.failureImpactType,
      evidenceType: r.evidenceType ?? '',
      kpiThreshold: r.kpiThreshold ?? undefined,
      escalationRequired: r.escalationRequired
    });
  }

  async save(cp: ControlPoint): Promise<void> {
    try {
      await this.createControlPoint(cp);
    } catch (error) {
      if (!this.isDuplicateControlPointIdError(error)) {
        throw error;
      }

      await this.resyncControlPointIdSequence();
      await this.createControlPoint(cp);
    }
  }

  async update(cp: ControlPoint): Promise<void> {
    await this.prisma.controlPoint.update({
      where: { id: BigInt(cp.id) },
      data: {
        name: cp.name,
        description: cp.description,
        riskLevel: cp.riskLevel,
        failureImpactType: cp.failureImpactType,
        kpiThreshold: cp.kpiThreshold,
        escalationRequired: cp.escalationRequired
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.controlPoint.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
