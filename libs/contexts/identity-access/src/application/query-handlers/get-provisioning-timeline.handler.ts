import type { GetProvisioningTimelineQuery } from '../queries/get-provisioning-timeline.query';
import type { GetProvisioningTimelineResponseDto } from '../dto/responses/get-provisioning-timeline.response.dto';
import type { AuthorizationGateway } from '../ports/gateways/authorization.gateway';
import type { IamReadModelRepository } from '../ports/repositories/iam-read-model.repository';

export class GetProvisioningTimelineHandler {
  constructor(
    private readonly authorizationGateway: AuthorizationGateway,
    private readonly readModelRepository: IamReadModelRepository
  ) {}

  async execute(query: GetProvisioningTimelineQuery): Promise<GetProvisioningTimelineResponseDto> {
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
      message: 'GetProvisioningTimeline fetched.',
      data: {}
    };
  }
}
