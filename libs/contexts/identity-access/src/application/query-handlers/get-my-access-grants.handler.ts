import type { GetMyAccessGrantsResponseDto } from '../dto/responses/get-my-access-grants.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';
import type { GetMyAccessGrantsQuery } from '../queries/get-my-access-grants.query';

export class GetMyAccessGrantsHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetMyAccessGrantsQuery): Promise<GetMyAccessGrantsResponseDto> {
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
      message: 'GetMyAccessGrants fetched.',
      data: {}
    };
  }
}
