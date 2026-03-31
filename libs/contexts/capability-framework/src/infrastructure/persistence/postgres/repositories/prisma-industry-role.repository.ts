import { getPrisma } from '@whizard/shared-infrastructure';
import type { IIndustryRoleRepository } from '../../../../domain/repositories/industry-role.repository';
import { IndustryRole } from '../../../../domain/aggregates/industry-role.aggregate';

export class PrismaIndustryRoleRepository implements IIndustryRoleRepository {
  private readonly prisma = getPrisma();

  async findByDepartmentId(tenantId: string, departmentId: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    seniorityLevel: string;
    reportingTo?: string;
    roleCriticalityScore?: number;
  }[]> {
    const rows = await this.prisma.role.findMany({
      where: { tenantId, departmentId, isActive: true },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      departmentId: r.departmentId,
      seniorityLevel: r.seniorityLevel ?? '',
      reportingTo: r.reportingTo ?? undefined,
      roleCriticalityScore: r.roleCriticalityScore ?? undefined
    }));
  }

  async findById(id: string): Promise<IndustryRole | null> {
    const r = await this.prisma.role.findUnique({ where: { id } });
    if (!r) return null;
    return IndustryRole.reconstitute({
      id: r.id,
      tenantId: r.tenantId,
      departmentId: r.departmentId,
      industryId: r.industryId ?? undefined,
      name: r.name,
      description: r.description ?? undefined,
      seniorityLevel: r.seniorityLevel ?? undefined,
      reportingTo: r.reportingTo ?? undefined,
      roleCriticalityScore: r.roleCriticalityScore ?? undefined,
      createdBy: r.createdBy ?? undefined
    });
  }

  async save(role: IndustryRole): Promise<void> {
    await this.prisma.role.create({
      data: {
        id: role.id,
        tenantId: role.tenantId,
        departmentId: role.departmentId,
        industryId: role.industryId,
        name: role.name,
        description: role.description,
        seniorityLevel: role.seniorityLevel,
        reportingTo: role.reportingTo,
        roleCriticalityScore: role.roleCriticalityScore,
        createdBy: role.createdBy
      }
    });
  }

  async update(role: IndustryRole): Promise<void> {
    await this.prisma.role.update({
      where: { id: role.id },
      data: {
        name: role.name,
        description: role.description,
        seniorityLevel: role.seniorityLevel,
        reportingTo: role.reportingTo,
        roleCriticalityScore: role.roleCriticalityScore
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.update({ where: { id }, data: { isActive: false } });
  }
}
