import type { GetTenantMembershipsResponseDto } from '../dto/responses/get-tenant-memberships.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';
import type { GetTenantMembershipsQuery } from '../queries/get-tenant-memberships.query';

export class GetTenantMembershipsHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetTenantMembershipsQuery): Promise<GetTenantMembershipsResponseDto> {
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
      message: 'GetTenantMemberships fetched.',
      data: {}
    };
  }
}
