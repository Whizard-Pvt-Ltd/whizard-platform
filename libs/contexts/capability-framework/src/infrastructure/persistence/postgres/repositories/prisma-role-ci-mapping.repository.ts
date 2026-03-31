import { getPrisma } from '@whizard/shared-infrastructure';
import type { IRoleCIMappingRepository } from '../../../../domain/repositories/role-ci-mapping.repository';

export class PrismaRoleCIMappingRepository implements IRoleCIMappingRepository {
  private readonly prisma = getPrisma();

  async findByRoleId(roleId: string): Promise<{ id: string; roleId: string; capabilityInstanceId: string; isMandatory: boolean }[]> {
    const rows = await this.prisma.roleCapabilityInstance.findMany({ where: { roleId, isActive: true } });
    return rows.map(r => ({ id: r.id, roleId: r.roleId, capabilityInstanceId: r.capabilityInstanceId, isMandatory: r.isMandatory }));
  }

  async save(roleId: string, capabilityInstanceId: string, isMandatory = true): Promise<void> {
    await this.prisma.roleCapabilityInstance.create({ data: { roleId, capabilityInstanceId, isMandatory } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.update({ where: { id }, data: { isActive: false } });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.updateMany({ where: { roleId }, data: { isActive: false } });
  }
}
