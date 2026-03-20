import { PrimaryWorkObject } from '../../domain/aggregates/primary-work-object.aggregate';
import type { IPwoRepository } from '../../domain/repositories/pwo.repository';
import type { CreatePWOCommand, UpdatePWOCommand, DeactivatePWOCommand } from '../commands/pwo.commands';
import type { PwoDto } from '../dto/pwo.dto';
import { DomainException } from '../domain-exception';

const toDto = (pwo: PrimaryWorkObject): PwoDto => ({
  id: pwo.id,
  tenantId: pwo.tenantId,
  functionalGroupId: pwo.functionalGroupId,
  name: pwo.name,
  description: pwo.description,
  strategicImportance: pwo.strategicImportance,
  revenueImpact: pwo.revenueImpact,
  downtimeSensitivity: pwo.downtimeSensitivity,
  isActive: pwo.isActive
});

export class CreatePWOCommandHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(cmd: CreatePWOCommand): Promise<PwoDto> {
    const pwo = PrimaryWorkObject.create({
      tenantId: cmd.tenantId,
      functionalGroupId: cmd.functionalGroupId,
      name: cmd.name,
      description: cmd.description,
      strategicImportance: cmd.strategicImportance,
      revenueImpact: cmd.revenueImpact,
      downtimeSensitivity: cmd.downtimeSensitivity
    });
    await this.pwoRepo.save(pwo);
    return toDto(pwo);
  }
}

export class UpdatePWOCommandHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(cmd: UpdatePWOCommand): Promise<PwoDto> {
    const pwo = await this.pwoRepo.findById(cmd.id);
    if (!pwo) throw new DomainException(`PrimaryWorkObject ${cmd.id} not found`);
    pwo.update({
      name: cmd.name,
      description: cmd.description,
      strategicImportance: cmd.strategicImportance,
      revenueImpact: cmd.revenueImpact,
      downtimeSensitivity: cmd.downtimeSensitivity
    });
    await this.pwoRepo.save(pwo);
    return toDto(pwo);
  }
}

export class DeactivatePWOCommandHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(cmd: DeactivatePWOCommand): Promise<void> {
    const pwo = await this.pwoRepo.findById(cmd.id);
    if (!pwo) throw new DomainException(`PrimaryWorkObject ${cmd.id} not found`);
    const hasSWOs = await this.pwoRepo.hasSWOs(cmd.id);
    if (hasSWOs) throw new DomainException('Cannot delete Primary Work Object with existing Secondary Work Objects');
    pwo.deactivate();
    await this.pwoRepo.delete(cmd.id);
  }
}
