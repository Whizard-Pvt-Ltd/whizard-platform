import type { ReactivateProvisionedAccessCommand } from '../commands/reactivate-provisioned-access.command';
import type { ReactivateProvisionedAccessResponseDto } from '../dto/responses/reactivate-provisioned-access.response.dto';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamCommandRepositories } from '../ports/repositories/iam-command-repositories.port';
import type { IamUnitOfWorkPort } from '../ports/transactions/iam-unit-of-work.port';

export class ReactivateProvisionedAccessHandler {
  constructor(
    private readonly unitOfWork: IamUnitOfWorkPort,
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly outbox: OutboxPort,
    private readonly repositories: IamCommandRepositories
  ) {}

  async execute(command: ReactivateProvisionedAccessCommand): Promise<ReactivateProvisionedAccessResponseDto> {
    const { actorUserAccountId, tenantType, tenantId } = command.request;

    await this.authorizationGateway.assertCan({
      actorUserAccountId,
      tenantType,
      tenantId,
      permissionCode: 'IAM.OPERATE'
    });

    return this.unitOfWork.execute(async () => {
      void this.repositories;
      await this.outbox.append([]);

      return {
        success: true,
        message: 'ReactivateProvisionedAccess executed.',
        data: {}
      };
    });
  }
}
