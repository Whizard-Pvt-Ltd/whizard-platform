import type { IControlPointRepository } from '../../domain/repositories/control-point.repository';
import type { CreateControlPointCommand, UpdateControlPointCommand, DeleteControlPointCommand } from '../commands/control-point.commands';
import { ControlPoint } from '../../domain/aggregates/control-point.aggregate';
import { DomainException } from '../domain-exception';

export class CreateControlPointCommandHandler {
  constructor(private readonly repo: IControlPointRepository) {}

  async execute(cmd: CreateControlPointCommand): Promise<void> {
    const cp = ControlPoint.create({
      tenantId: cmd.tenantId,
      taskId: cmd.taskId,
      name: cmd.name,
      description: cmd.description,
      riskLevel: cmd.riskLevel,
      failureImpactType: cmd.failureImpactType,
      kpiThreshold: cmd.kpiThreshold,
      escalationRequired: cmd.escalationRequired,
      evidenceType: cmd.evidenceType
    });
    await this.repo.save(cp);
  }
}

export class UpdateControlPointCommandHandler {
  constructor(private readonly repo: IControlPointRepository) {}

  async execute(cmd: UpdateControlPointCommand): Promise<void> {
    const cp = await this.repo.findById(cmd.id);
    if (!cp) throw new DomainException(`ControlPoint ${cmd.id} not found`);
    cp.update({
      name: cmd.name,
      description: cmd.description,
      riskLevel: cmd.riskLevel,
      failureImpactType: cmd.failureImpactType,
      kpiThreshold: cmd.kpiThreshold,
      escalationRequired: cmd.escalationRequired,
      evidenceType: cmd.evidenceType
    });
    await this.repo.update(cp);
  }
}

export class DeleteControlPointCommandHandler {
  constructor(private readonly repo: IControlPointRepository) {}

  async execute(cmd: DeleteControlPointCommand): Promise<void> {
    const cp = await this.repo.findById(cmd.id);
    if (!cp) throw new DomainException(`ControlPoint ${cmd.id} not found`);
    cp.delete();
    await this.repo.delete(cmd.id);
  }
}
