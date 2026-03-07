import type { GetCurrentUserProfileQuery } from '../queries/get-current-user-profile.query';
import type { GetCurrentUserProfileResponseDto } from '../dto/responses/get-current-user-profile.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';

export class GetCurrentUserProfileHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetCurrentUserProfileQuery): Promise<GetCurrentUserProfileResponseDto> {
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
      message: 'GetCurrentUserProfile fetched.',
      data: {}
    };
  }
}
