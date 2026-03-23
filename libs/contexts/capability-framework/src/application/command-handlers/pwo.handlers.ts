import { PrimaryWorkObject } from '../../domain/aggregates/primary-work-object.aggregate';
import type { IPwoRepository } from '../../domain/repositories/pwo.repository';
import type { CreatePWOCommand, UpdatePWOCommand, DeactivatePWOCommand } from '../commands/pwo.commands';
import type { PwoDto } from '../dto/pwo.dto';
import { DomainException } from '../domain-exception';
import { getOrCreateAppLogger } from '@whizard/shared-logging';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'primary-work-object' });

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
    logger.debug('Creating PWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, functionalGroupId: cmd.functionalGroupId, name: cmd.name });
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
    logger.info('PWO created', { userId: cmd.actorUserId, tenantId: pwo.tenantId, pwoId: pwo.id, name: pwo.name });
    return toDto(pwo);
  }
}

export class UpdatePWOCommandHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(cmd: UpdatePWOCommand): Promise<PwoDto> {
    logger.debug('Updating PWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
    const pwo = await this.pwoRepo.findById(cmd.id);
    if (!pwo) {
      logger.warn('PWO not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
      throw new DomainException(`PrimaryWorkObject ${cmd.id} not found`);
    }
    pwo.update({
      name: cmd.name,
      description: cmd.description,
      strategicImportance: cmd.strategicImportance,
      revenueImpact: cmd.revenueImpact,
      downtimeSensitivity: cmd.downtimeSensitivity
    });
    await this.pwoRepo.save(pwo);
    logger.info('PWO updated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: pwo.id });
    return toDto(pwo);
  }
}

export class DeactivatePWOCommandHandler {
  constructor(private readonly pwoRepo: IPwoRepository) {}

  async execute(cmd: DeactivatePWOCommand): Promise<void> {
    logger.debug('Deactivating PWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
    const pwo = await this.pwoRepo.findById(cmd.id);
    if (!pwo) {
      logger.warn('PWO not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
      throw new DomainException(`PrimaryWorkObject ${cmd.id} not found`);
    }
    const hasSWOs = await this.pwoRepo.hasSWOs(cmd.id);
    if (hasSWOs) {
      logger.warn('PWO deactivation blocked: has SWOs', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
      throw new DomainException('Cannot delete Primary Work Object with existing Secondary Work Objects');
    }
    pwo.deactivate();
    await this.pwoRepo.delete(cmd.id);
    logger.info('PWO deactivated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.id });
  }
}
