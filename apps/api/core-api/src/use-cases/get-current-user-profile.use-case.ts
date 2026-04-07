import {
  GetCurrentUserProfileHandler,
  PrismaIamReadModelRepository
} from '@whizard/identity-access';

// Allows all IAM.READ checks — authorization is enforced at the BFF/session layer
const allowAllAuthorizationGateway = {
  async assertCan(): Promise<void> {}
};

export class GetCurrentUserProfileUseCase {
  private readonly handler: GetCurrentUserProfileHandler;

  constructor() {
    this.handler = new GetCurrentUserProfileHandler(
      allowAllAuthorizationGateway,
      new PrismaIamReadModelRepository()
    );
  }

  async execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> {
    const { request } = input;
    const result = await this.handler.execute({ request: request as never });
    return { data: result.data };
  }
}
