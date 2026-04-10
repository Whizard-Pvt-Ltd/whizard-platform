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
      where: {
        tenantId: BigInt(tenantId),
        departmentId: BigInt(departmentId),
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      name: r.name,
      departmentId: r.departmentId.toString(),
      seniorityLevel: r.seniorityLevel ?? '',
      reportingTo: r.reportingTo != null ? r.reportingTo.toString() : undefined,
      roleCriticalityScore: r.roleCriticalityScore ?? undefined
    }));
  }

  async findById(id: string): Promise<IndustryRole | null> {
    const r = await this.prisma.role.findUnique({
      where: { id: BigInt(id) }
    });
    if (!r) return null;
    return IndustryRole.reconstitute({
      id: r.id.toString(),
      tenantId: r.tenantId.toString(),
      departmentId: r.departmentId.toString(),
      industryId: r.industryId?.toString() ?? undefined,
      name: r.name,
      description: r.description ?? undefined,
      seniorityLevel: r.seniorityLevel ?? undefined,
      reportingTo: r.reportingTo != null ? r.reportingTo.toString() : undefined,
      roleCriticalityScore: r.roleCriticalityScore ?? undefined,
      createdBy: undefined
    });
  }

  async save(role: IndustryRole): Promise<string> {
    const reportingToId = role.reportingTo ? BigInt(role.reportingTo) : null;
    const created = await this.prisma.role.create({
      data: {
        tenantId: BigInt(role.tenantId),
        departmentId: BigInt(role.departmentId),
        industryId: role.industryId ? BigInt(role.industryId) : null,
        name: role.name,
        description: role.description,
        seniorityLevel: role.seniorityLevel,
        reportingTo: reportingToId,
        roleCriticalityScore: role.roleCriticalityScore
      },
      select: { id: true }
    });
    return created.id.toString();
  }

  async update(role: IndustryRole): Promise<void> {
    const reportingToId = role.reportingTo ? BigInt(role.reportingTo) : null;
    await this.prisma.role.update({
      where: { id: BigInt(role.id) },
      data: {
        name: role.name,
        description: role.description,
        seniorityLevel: role.seniorityLevel,
        reportingTo: reportingToId,
        roleCriticalityScore: role.roleCriticalityScore
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }
}
