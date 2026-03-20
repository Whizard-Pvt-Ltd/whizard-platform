import { SecondaryWorkObject } from '../../domain/aggregates/secondary-work-object.aggregate';
import type { ISwoRepository } from '../../domain/repositories/swo.repository';
import type { CreateSWOCommand, UpdateSWOCommand, DeactivateSWOCommand } from '../commands/swo.commands';
import type { SwoDto } from '../dto/swo.dto';
import { DomainException } from '../domain-exception';

const toDto = (swo: SecondaryWorkObject): SwoDto => ({
  id: swo.id,
  tenantId: swo.tenantId,
  pwoId: swo.pwoId,
  name: swo.name,
  description: swo.description,
  operationalComplexity: swo.operationalComplexity,
  assetCriticality: swo.assetCriticality,
  failureFrequency: swo.failureFrequency,
  isActive: swo.isActive
});

export class CreateSWOCommandHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(cmd: CreateSWOCommand): Promise<SwoDto> {
    const swo = SecondaryWorkObject.create({
      tenantId: cmd.tenantId,
      pwoId: cmd.pwoId,
      name: cmd.name,
      description: cmd.description,
      operationalComplexity: cmd.operationalComplexity,
      assetCriticality: cmd.assetCriticality,
      failureFrequency: cmd.failureFrequency
    });
    await this.swoRepo.save(swo);
    return toDto(swo);
  }
}

export class UpdateSWOCommandHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(cmd: UpdateSWOCommand): Promise<SwoDto> {
    const swo = await this.swoRepo.findById(cmd.id);
    if (!swo) throw new DomainException(`SecondaryWorkObject ${cmd.id} not found`);
    swo.update({
      name: cmd.name,
      description: cmd.description,
      operationalComplexity: cmd.operationalComplexity,
      assetCriticality: cmd.assetCriticality,
      failureFrequency: cmd.failureFrequency
    });
    await this.swoRepo.save(swo);
    return toDto(swo);
  }
}

export class DeactivateSWOCommandHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(cmd: DeactivateSWOCommand): Promise<void> {
    const swo = await this.swoRepo.findById(cmd.id);
    if (!swo) throw new DomainException(`SecondaryWorkObject ${cmd.id} not found`);
    swo.deactivate();
    await this.swoRepo.delete(cmd.id);
  }
}
