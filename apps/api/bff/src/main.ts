import { bootstrapIdentityAccess } from '@whizard/identity-access';
import { registerIamBffRuntime, type IamBffRuntimeDependencies } from './modules/iam/runtime';
import type { FastifyInstanceLike } from './modules/iam/shared/request-context';

const createNotImplementedUseCase = () => ({
  async execute(): Promise<{ data: Record<string, unknown> }> {
    throw new Error('IAM use case dependency is not wired yet.');
  }
});

export const createIamBffRuntimeDependencies = (): IamBffRuntimeDependencies => {
  const { authenticateWithPasswordHandler } = bootstrapIdentityAccess();

  return {
    auth: {
      authenticateWithPassword: {
        async execute(input: { request: Record<string, unknown> }) {
          const result = await authenticateWithPasswordHandler.execute({ request: input.request as any });
          return { data: result.data };
        }
      },
      startMfaChallenge: createNotImplementedUseCase(),
      verifyMfaChallenge: createNotImplementedUseCase(),
      refreshSession: createNotImplementedUseCase(),
      logoutSession: createNotImplementedUseCase()
    },
    access: {
      getCurrentUserProfile: createNotImplementedUseCase(),
      getMyAccessGrants: createNotImplementedUseCase(),
      getTenantMemberships: createNotImplementedUseCase(),
      getMySessions: createNotImplementedUseCase(),
      revokeAllSessions: createNotImplementedUseCase()
    }
  };
};

export const startBff = async (app: FastifyInstanceLike): Promise<void> => {
  const deps = createIamBffRuntimeDependencies();
  await registerIamBffRuntime(app, deps);
};
