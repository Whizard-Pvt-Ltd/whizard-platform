import type { IRoleCIMappingRepository } from '../../domain/repositories/role-ci-mapping.repository';
import type { SaveRoleCIMappingsCommand, DeleteRoleCIMappingCommand } from '../commands/role-ci-mapping.commands';

export class SaveRoleCIMappingsCommandHandler {
  constructor(private readonly repo: IRoleCIMappingRepository) {}

  async execute(cmd: SaveRoleCIMappingsCommand): Promise<void> {
    await this.repo.deleteByRoleId(cmd.roleId);
    for (const ciId of cmd.ciIds) {
      await this.repo.save(cmd.roleId, ciId, cmd.createdBy);
    }
  }
}

export class DeleteRoleCIMappingCommandHandler {
  constructor(private readonly repo: IRoleCIMappingRepository) {}

  async execute(cmd: DeleteRoleCIMappingCommand): Promise<void> {
    await this.repo.delete(cmd.id);
  }
}
