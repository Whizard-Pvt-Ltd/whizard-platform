import { Department } from '../../domain/aggregates/department.aggregate';
import type { IDepartmentRepository } from '../../domain/repositories/department.repository';
import type { CreateDepartmentCommand, UpdateDepartmentCommand, DeleteDepartmentCommand } from '../commands/department.commands';
import { DomainException } from '../domain-exception';

export class CreateDepartmentCommandHandler {
  constructor(private readonly repo: IDepartmentRepository) {}

  async execute(cmd: CreateDepartmentCommand): Promise<{ id: string; name: string }> {
    const dept = Department.create({
      tenantId: cmd.tenantId,
      industryId: cmd.industryId,
      name: cmd.name,
      fgIds: cmd.fgIds,
      operationalCriticalityScore: cmd.operationalCriticalityScore,
      revenueContributionWeight: cmd.revenueContributionWeight,
      regulatoryExposureLevel: cmd.regulatoryExposureLevel,
      createdBy: cmd.createdBy
    });
    await this.repo.save(dept, cmd.fgIds);
    return { id: dept.id, name: dept.name };
  }
}

export class UpdateDepartmentCommandHandler {
  constructor(private readonly repo: IDepartmentRepository) {}

  async execute(cmd: UpdateDepartmentCommand): Promise<{ id: string; name: string }> {
    const dept = await this.repo.findById(cmd.id);
    if (!dept) throw new DomainException(`Department ${cmd.id} not found`);
    dept.update({
      name: cmd.name,
      fgIds: cmd.fgIds,
      operationalCriticalityScore: cmd.operationalCriticalityScore,
      revenueContributionWeight: cmd.revenueContributionWeight,
      regulatoryExposureLevel: cmd.regulatoryExposureLevel
    });
    await this.repo.update(dept, cmd.fgIds ?? dept.fgIds);
    return { id: dept.id, name: dept.name };
  }
}

export class DeleteDepartmentCommandHandler {
  constructor(private readonly repo: IDepartmentRepository) {}

  async execute(cmd: DeleteDepartmentCommand): Promise<void> {
    const dept = await this.repo.findById(cmd.id);
    if (!dept) throw new DomainException(`Department ${cmd.id} not found`);
    dept.delete();
    await this.repo.delete(cmd.id);
  }
}
