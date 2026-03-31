import type { IRoleCIMappingRepository } from '../../domain/repositories/role-ci-mapping.repository';

export class ListRoleCIMappingsQueryHandler {
  constructor(private readonly repo: IRoleCIMappingRepository) {}

  async execute(roleId: string): Promise<{ id: string; roleId: string; capabilityInstanceId: string; isMandatory: boolean }[]> {
    return this.repo.findByRoleId(roleId);
  }
}
