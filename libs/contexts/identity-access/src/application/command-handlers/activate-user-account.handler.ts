import type { ActivateUserAccountCommand } from '../commands/activate-user-account.command';
import type { ActivateUserAccountResponseDto } from '../dto/responses/activate-user-account.response.dto';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamCommandRepositories } from '../ports/repositories/iam-command-repositories.port';
import type { IamUnitOfWorkPort } from '../ports/transactions/iam-unit-of-work.port';

export class ActivateUserAccountHandler {
  constructor(
    private readonly unitOfWork: IamUnitOfWorkPort,
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly outbox: OutboxPort,
    private readonly repositories: IamCommandRepositories
  ) {}

  async execute(command: ActivateUserAccountCommand): Promise<ActivateUserAccountResponseDto> {
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
        message: 'ActivateUserAccount executed.',
        data: {}
      };
    });
  }
}
