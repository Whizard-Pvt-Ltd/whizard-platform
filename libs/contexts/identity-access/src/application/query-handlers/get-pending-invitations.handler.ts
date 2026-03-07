import type { GetPendingInvitationsQuery } from '../queries/get-pending-invitations.query';
import type { GetPendingInvitationsResponseDto } from '../dto/responses/get-pending-invitations.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';

export class GetPendingInvitationsHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetPendingInvitationsQuery): Promise<GetPendingInvitationsResponseDto> {
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
      message: 'GetPendingInvitations fetched.',
      data: {}
    };
  }
}
