import type { GetIdentityProviderConfigQuery } from '../queries/get-identity-provider-config.query';
import type { GetIdentityProviderConfigResponseDto } from '../dto/responses/get-identity-provider-config.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';

export class GetIdentityProviderConfigHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetIdentityProviderConfigQuery): Promise<GetIdentityProviderConfigResponseDto> {
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
      message: 'GetIdentityProviderConfig fetched.',
      data: {}
    };
  }
}
