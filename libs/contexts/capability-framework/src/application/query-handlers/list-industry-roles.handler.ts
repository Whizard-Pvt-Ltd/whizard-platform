import type { IIndustryRoleRepository } from '../../domain/repositories/industry-role.repository';

export class ListIndustryRolesQueryHandler {
  constructor(private readonly repo: IIndustryRoleRepository) {}

  async execute(departmentId: string, tenantIds: string[], ownedTenantIds: string[]): Promise<{
    id: string;
    name: string;
    tenantId: string;
    departmentId: string;
    description?: string;
    canEdit: boolean;
  }[]> {
    return this.repo.findByDepartmentWithTenants(departmentId, tenantIds, ownedTenantIds);
  }
}
