import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';

export class ListIndustryRolesQueryHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(tenantId: string, departmentId: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    description?: string;
  }[]> {
    return this.repo.findByDepartmentId(tenantId, departmentId);
  }
}
