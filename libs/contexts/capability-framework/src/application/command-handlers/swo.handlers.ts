import { getOrCreateAppLogger } from '@whizard/shared-logging';
import type { ISwoRepository } from '../../domain/repositories/swo.repository';
import type { CreateSWOCommand, UpdateSWOCommand, DeactivateSWOCommand } from '../commands/swo.commands';
import type { SwoDto } from '../dto/swo.dto';
import { SecondaryWorkObject } from '../../domain/aggregates/secondary-work-object.aggregate';
import { DomainException } from '../domain-exception';

const logger = getOrCreateAppLogger({ service: 'capability-framework' }).child({ component: 'secondary-work-object' });

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
    logger.debug('Creating SWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, pwoId: cmd.pwoId, name: cmd.name });
    if (cmd.name.length > 50) {
      throw new DomainException('Secondary Work Object name must not exceed 50 characters');
    }
    const swo = SecondaryWorkObject.create({
      tenantId: cmd.tenantId,
      pwoId: cmd.pwoId,
      name: cmd.name,
      description: cmd.description,
      operationalComplexity: cmd.operationalComplexity,
      assetCriticality: cmd.assetCriticality,
      failureFrequency: cmd.failureFrequency,
      createdBy: cmd.actorUserId
    });
    await this.swoRepo.save(swo);
    logger.info('SWO created', { userId: cmd.actorUserId, tenantId: swo.tenantId, swoId: swo.id, name: swo.name });
    return toDto(swo);
  }
}

export class UpdateSWOCommandHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(cmd: UpdateSWOCommand): Promise<SwoDto> {
    logger.debug('Updating SWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
    const swo = await this.swoRepo.findById(cmd.id);
    if (!swo) {
      logger.warn('SWO not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
      throw new DomainException(`SecondaryWorkObject ${cmd.id} not found`);
    }
    if (cmd.name !== undefined && cmd.name.length > 50) {
      throw new DomainException('Secondary Work Object name must not exceed 50 characters');
    }
    swo.update({
      name: cmd.name,
      description: cmd.description,
      operationalComplexity: cmd.operationalComplexity,
      assetCriticality: cmd.assetCriticality,
      failureFrequency: cmd.failureFrequency,
      updatedBy: cmd.actorUserId
    });
    await this.swoRepo.save(swo);
    logger.info('SWO updated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: swo.id });
    return toDto(swo);
  }
}

export class CheckSWODeletableQueryHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const hasCIs = await this.swoRepo.hasCIs(id);
    if (hasCIs) {
      return { canDelete: false, reason: 'Cannot delete Secondary Work Object with existing Capability Instance mappings' };
    }
    return { canDelete: true };
  }
}

export class DeactivateSWOCommandHandler {
  constructor(private readonly swoRepo: ISwoRepository) {}

  async execute(cmd: DeactivateSWOCommand): Promise<void> {
    logger.debug('Deactivating SWO', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
    const swo = await this.swoRepo.findById(cmd.id);
    if (!swo) {
      logger.warn('SWO not found', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
      throw new DomainException(`SecondaryWorkObject ${cmd.id} not found`);
    }
    const hasCIs = await this.swoRepo.hasCIs(cmd.id);
    if (hasCIs) {
      logger.warn('SWO deactivation blocked: has capability instances', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
      throw new DomainException('Cannot delete Secondary Work Object with existing Capability Instance mappings');
    }
    swo.deactivate();
    await this.swoRepo.delete(cmd.id);
    logger.info('SWO deactivated', { userId: cmd.actorUserId, tenantId: cmd.tenantId, swoId: cmd.id });
  }
}
