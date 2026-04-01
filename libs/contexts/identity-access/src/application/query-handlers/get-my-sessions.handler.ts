import type { GetMySessionsResponseDto } from '../dto/responses/get-my-sessions.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';
import type { GetMySessionsQuery } from '../queries/get-my-sessions.query';

export class GetMySessionsHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetMySessionsQuery): Promise<GetMySessionsResponseDto> {
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
      message: 'GetMySessions fetched.',
      data: {}
    };
  }
}
