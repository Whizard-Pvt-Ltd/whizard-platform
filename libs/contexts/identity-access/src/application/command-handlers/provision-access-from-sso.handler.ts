import type { ProvisionAccessFromSSOCommand } from '../commands/provision-access-from-sso.command';
import type { ProvisionAccessFromSSOResponseDto } from '../dto/responses/provision-access-from-sso.response.dto';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamUnitOfWorkPort } from '../ports/transactions/iam-unit-of-work.port';
import type { IamCommandRepositories } from '../ports/repositories/iam-command-repositories.port';

export class ProvisionAccessFromSSOHandler {
  constructor(
    private readonly unitOfWork: IamUnitOfWorkPort,
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly outbox: OutboxPort,
    private readonly repositories: IamCommandRepositories
  ) {}

  async execute(command: ProvisionAccessFromSSOCommand): Promise<ProvisionAccessFromSSOResponseDto> {
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
        message: 'ProvisionAccessFromSSO executed.',
        data: {}
      };
    });
  }
}
