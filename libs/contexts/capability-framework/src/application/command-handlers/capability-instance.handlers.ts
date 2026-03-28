import type { ICapabilityInstanceRepository } from '../../domain/repositories/capability-instance.repository';
import type { CreateCapabilityInstanceCommand, DeleteCapabilityInstanceCommand } from '../commands/capability-instance.commands';
import { CapabilityInstance } from '../../domain/aggregates/capability-instance.aggregate';
import { DomainException } from '../domain-exception';

export class CreateCapabilityInstanceCommandHandler {
  constructor(private readonly ciRepo: ICapabilityInstanceRepository) {}

  async execute(cmd: CreateCapabilityInstanceCommand): Promise<void> {
    const ci = CapabilityInstance.create({
      tenantId: cmd.tenantId,
      versionId: cmd.versionId,
      functionalGroupId: cmd.functionalGroupId,
      pwoId: cmd.pwoId,
      swoId: cmd.swoId,
      capabilityId: cmd.capabilityId,
      proficiencyId: cmd.proficiencyId
    });
    await this.ciRepo.save(ci);
  }
}

export class DeleteCapabilityInstanceCommandHandler {
  constructor(private readonly ciRepo: ICapabilityInstanceRepository) {}

  async execute(cmd: DeleteCapabilityInstanceCommand): Promise<void> {
    const ci = await this.ciRepo.findById(cmd.id);
    if (!ci) throw new DomainException(`CapabilityInstance ${cmd.id} not found`);
    ci.delete();
    await this.ciRepo.delete(cmd.id);
  }
}
