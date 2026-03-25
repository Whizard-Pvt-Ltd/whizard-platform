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

    const profile = await this.readModelRepository.getCurrentUserProfile(actorUserAccountId);

    return {
      success: true,
      message: 'GetCurrentUserProfile fetched.',
      data: {
        userAccountId: profile?.id ?? actorUserAccountId,
        email: profile?.primary_email ?? '',
        status: profile?.status ?? 'ACTIVE',
        tenantType: profile?.tenant_type ?? tenantType,
        tenantId: profile?.tenant_id ?? tenantId
      }
    };
  }
}
