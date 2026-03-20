import { FunctionalGroup } from '../../domain/aggregates/functional-group.aggregate';
import type { IFunctionalGroupRepository } from '../../domain/repositories/functional-group.repository';
import type { CreateFGCommand, UpdateFGCommand, DeactivateFGCommand } from '../commands/functional-group.commands';
import type { FunctionalGroupDto } from '../dto/functional-group.dto';
import { DomainException } from '../domain-exception';

const toDto = (fg: FunctionalGroup): FunctionalGroupDto => ({
  id: fg.id,
  tenantId: fg.tenantId,
  industryId: fg.industryId,
  name: fg.name,
  description: fg.description,
  domainType: fg.domainType,
  isActive: fg.isActive
});

export class CreateFGCommandHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(cmd: CreateFGCommand): Promise<FunctionalGroupDto> {
    const fg = FunctionalGroup.create({
      tenantId: cmd.tenantId,
      industryId: cmd.industryId,
      name: cmd.name,
      description: cmd.description,
      domainType: cmd.domainType
    });
    await this.fgRepo.save(fg);
    return toDto(fg);
  }
}

export class UpdateFGCommandHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(cmd: UpdateFGCommand): Promise<FunctionalGroupDto> {
    const fg = await this.fgRepo.findById(cmd.id);
    if (!fg) throw new DomainException(`FunctionalGroup ${cmd.id} not found`);
    fg.update({ name: cmd.name, description: cmd.description, domainType: cmd.domainType });
    await this.fgRepo.save(fg);
    return toDto(fg);
  }
}

export class DeactivateFGCommandHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(cmd: DeactivateFGCommand): Promise<void> {
    const fg = await this.fgRepo.findById(cmd.id);
    if (!fg) throw new DomainException(`FunctionalGroup ${cmd.id} not found`);
    const hasPWOs = await this.fgRepo.hasPWOs(cmd.id);
    if (hasPWOs) throw new DomainException('Cannot delete Functional Group with existing Primary Work Objects');
    fg.deactivate();
    await this.fgRepo.delete(cmd.id);
  }
}
