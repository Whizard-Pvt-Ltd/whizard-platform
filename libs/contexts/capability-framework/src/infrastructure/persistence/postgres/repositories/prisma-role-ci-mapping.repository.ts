import { getPrisma } from '@whizard/shared-infrastructure';
import type { IRoleCIMappingRepository } from '../../../../domain/repositories/role-ci-mapping.repository';

export class PrismaRoleCIMappingRepository implements IRoleCIMappingRepository {
  private readonly prisma = getPrisma();

  async findByRoleId(roleId: string): Promise<{ id: string; roleId: string; capabilityInstanceId: string; isMandatory: boolean }[]> {
    const rows = await this.prisma.roleCapabilityInstance.findMany({
      where: { roleId: BigInt(roleId), isActive: true }
    });
    return rows.map(r => ({
      id: r.id.toString(),
      roleId: r.roleId.toString(),
      capabilityInstanceId: r.capabilityInstanceId.toString(),
      isMandatory: r.isMandatory
    }));
  }

  async save(roleId: string, capabilityInstanceId: string, isMandatory = true): Promise<void> {
    await this.prisma.roleCapabilityInstance.create({
      data: { roleId: BigInt(roleId), capabilityInstanceId: BigInt(capabilityInstanceId), isMandatory }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.updateMany({ where: { roleId: BigInt(roleId) }, data: { isActive: false } });
  }
}
