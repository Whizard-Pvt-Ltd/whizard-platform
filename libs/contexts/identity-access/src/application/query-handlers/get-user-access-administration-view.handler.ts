import type { GetUserAccessAdministrationViewResponseDto } from '../dto/responses/get-user-access-administration-view.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';
import type { GetUserAccessAdministrationViewQuery } from '../queries/get-user-access-administration-view.query';

export class GetUserAccessAdministrationViewHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetUserAccessAdministrationViewQuery): Promise<GetUserAccessAdministrationViewResponseDto> {
    const { actorUserAccountId, tenantType, tenantId } = query.request;

    await this.authorizationGateway.assertCan({
      actorUserAccountId,
      tenantType,
      tenantId,
      permissionCode: 'IAM.READ'
    });

    void this.readModelRepository;

    return {
      success: true,
      message: 'GetUserAccessAdministrationView fetched.',
      data: {}
    };
  }
}
