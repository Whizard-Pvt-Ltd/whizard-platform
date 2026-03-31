import { IndustryRole } from '../../domain/aggregates/industry-role.aggregate';
import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';
import type { CreateIndustryRoleCommand, UpdateIndustryRoleCommand, DeleteIndustryRoleCommand } from '../commands/industry-role.commands';
import { DomainException } from '../domain-exception';

export class CreateIndustryRoleCommandHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(cmd: CreateIndustryRoleCommand): Promise<{ id: string; name: string }> {
    const role = IndustryRole.create({
      tenantId: cmd.tenantId,
      departmentId: cmd.departmentId,
      industryId: cmd.industryId,
      name: cmd.name,
      description: cmd.description,
      seniorityLevel: cmd.seniorityLevel,
      reportingTo: cmd.reportingTo,
      roleCriticalityScore: cmd.roleCriticalityScore,
      createdBy: cmd.createdBy
    });
    await this.repo.save(role);
    return { id: role.id, name: role.name };
  }
}

export class UpdateIndustryRoleCommandHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(cmd: UpdateIndustryRoleCommand): Promise<{ id: string; name: string }> {
    const role = await this.repo.findById(cmd.id);
    if (!role) throw new DomainException(`IndustryRole ${cmd.id} not found`);
    role.update({
      name: cmd.name,
      description: cmd.description,
      seniorityLevel: cmd.seniorityLevel,
      reportingTo: cmd.reportingTo,
      roleCriticalityScore: cmd.roleCriticalityScore
    });
    await this.repo.update(role);
    return { id: role.id, name: role.name };
  }
}

export class DeleteIndustryRoleCommandHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(cmd: DeleteIndustryRoleCommand): Promise<void> {
    const role = await this.repo.findById(cmd.id);
    if (!role) throw new DomainException(`Role ${cmd.id} not found`);
    role.delete();
    await this.repo.delete(cmd.id);
  }
}
