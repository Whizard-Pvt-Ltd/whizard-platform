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
    const rId = BigInt(roleId);
    const ciId = BigInt(capabilityInstanceId);
    await this.prisma.roleCapabilityInstance.upsert({
      where: { roleId_capabilityInstanceId: { roleId: rId, capabilityInstanceId: ciId } },
      update: { isMandatory, isActive: true },
      create: { roleId: rId, capabilityInstanceId: ciId, isMandatory },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.update({ where: { id: BigInt(id) }, data: { isActive: false } });
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.roleCapabilityInstance.updateMany({ where: { roleId: BigInt(roleId) }, data: { isActive: false } });
  }
}
