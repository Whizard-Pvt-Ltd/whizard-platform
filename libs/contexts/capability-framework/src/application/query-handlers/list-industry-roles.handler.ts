import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';

export class ListIndustryRolesQueryHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(departmentId: string, tenantId?: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    description?: string;
  }[]> {
    return this.repo.findByDepartmentId(departmentId, tenantId);
  }
}
