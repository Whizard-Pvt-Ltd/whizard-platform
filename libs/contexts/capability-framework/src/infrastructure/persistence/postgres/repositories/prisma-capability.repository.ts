import { getPrisma } from '@whizard/shared-infrastructure';
import { Capability } from '../../../../domain/entities/capability.entity';
import type { ICapabilityRepository } from '../../../../domain/repositories/capability.repository';
import type { CapabilityType } from '../../../../domain/value-objects/capability-type.vo';

export class PrismaCapabilityRepository implements ICapabilityRepository {
  private readonly prisma = getPrisma();

  async findAll(): Promise<Capability[]> {
    const rows = await this.prisma.capability.findMany();
    return rows.map(row => new Capability({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as CapabilityType,
      isActive: row.isActive
    }));
  }

  async findById(id: string): Promise<Capability | null> {
    const row = await this.prisma.capability.findUnique({ where: { id } });
    if (!row) return null;
    return new Capability({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as CapabilityType,
      isActive: row.isActive
    });
  }
}
