import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { IFunctionalGroupRepository } from '../../domain/repositories/functional-group.repository';
import type { CreateFGCommand, UpdateFGCommand, DeactivateFGCommand } from '../commands/functional-group.commands';
import type { FunctionalGroupDto } from '../dto/functional-group.dto';
import { FunctionalGroup } from '../../domain/aggregates/functional-group.aggregate';
import { DomainException } from '../domain-exception';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'functional-group' });

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
    logger.debug('Creating functional group', { userId: cmd.actorUserId, tenantId: cmd.tenantId, industryId: cmd.industryId, name: cmd.name });
    const fg = FunctionalGroup.create({
      tenantId: cmd.tenantId,
      industryId: cmd.industryId,
      name: cmd.name,
      description: cmd.description,
      domainType: cmd.domainType
    });
    await this.fgRepo.save(fg);
    logger.info('Functional group created', { userId: cmd.actorUserId, tenantId: fg.tenantId, fgId: fg.id, name: fg.name });
    return toDto(fg);
  }
}

export class UpdateFGCommandHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(cmd: UpdateFGCommand): Promise<FunctionalGroupDto> {
    logger.debug('Updating functional group', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
    const fg = await this.fgRepo.findById(cmd.id);
    if (!fg) {
      logger.warn('Functional group not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
      throw new DomainException(`FunctionalGroup ${cmd.id} not found`);
    }
    fg.update({ name: cmd.name, description: cmd.description, domainType: cmd.domainType });
    await this.fgRepo.save(fg);
    logger.info('Functional group updated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: fg.id });
    return toDto(fg);
  }
}

export class DeactivateFGCommandHandler {
  constructor(private readonly fgRepo: IFunctionalGroupRepository) {}

  async execute(cmd: DeactivateFGCommand): Promise<void> {
    logger.debug('Deactivating functional group', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
    const fg = await this.fgRepo.findById(cmd.id);
    if (!fg) {
      logger.warn('Functional group not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
      throw new DomainException(`FunctionalGroup ${cmd.id} not found`);
    }
    const hasPWOs = await this.fgRepo.hasPWOs(cmd.id);
    if (hasPWOs) {
      logger.warn('Functional group deactivation blocked: has PWOs', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
      throw new DomainException('Cannot delete Functional Group with existing Primary Work Objects');
    }
    fg.deactivate();
    await this.fgRepo.delete(cmd.id);
    logger.info('Functional group deactivated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, fgId: cmd.id });
  }
}
