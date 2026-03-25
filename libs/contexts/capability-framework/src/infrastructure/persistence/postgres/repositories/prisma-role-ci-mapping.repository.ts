import { getPrisma } from '@whizard/shared-infrastructure';
import type { IRoleCIMappingRepository } from '../../../../domain/repositories/role-ci-mapping.repository';

export class PrismaRoleCIMappingRepository implements IRoleCIMappingRepository {
  private readonly prisma = getPrisma();

  async findByRoleId(roleId: string): Promise<{ id: string; roleId: string; ciId: string }[]> {
    const rows = await this.prisma.roleCIMapping.findMany({ where: { roleId } });
    return rows.map(r => ({ id: r.id, roleId: r.roleId, ciId: r.ciId }));
  }

  async save(roleId: string, ciId: string, createdBy: string): Promise<void> {
    await this.prisma.roleCIMapping.create({ data: { roleId, ciId, createdBy } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roleCIMapping.delete({ where: { id } });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.roleCIMapping.deleteMany({ where: { roleId } });
  }
}
