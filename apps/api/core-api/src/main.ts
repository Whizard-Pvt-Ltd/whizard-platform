import { registerIamAdminRuntime, type IamAdminRuntimeDependencies } from './modules/iam/runtime';
import type { FastifyInstanceLike } from './modules/iam/shared/request-context';

const createNotImplementedUseCase = () => ({
  async execute(): Promise<{ data: Record<string, unknown> }> {
    throw new Error('IAM admin use case dependency is not wired yet.');
  }
});

export const createIamAdminRuntimeDependencies = (): IamAdminRuntimeDependencies => ({
  access: {
    assignRole: createNotImplementedUseCase(),
    revokeRole: createNotImplementedUseCase(),
    grantPermission: createNotImplementedUseCase(),
    revokePermission: createNotImplementedUseCase()
  },
  federation: {
    createIdentityProvider: createNotImplementedUseCase(),
    updateIdentityProvider: createNotImplementedUseCase(),
    updateSsoRoleMapping: createNotImplementedUseCase()
  },
  provisioning: {
    inviteUserToTenant: createNotImplementedUseCase(),
    provisionAccessFromSso: createNotImplementedUseCase(),
    suspendProvisionedAccess: createNotImplementedUseCase(),
    reactivateProvisionedAccess: createNotImplementedUseCase(),
    deprovisionAccess: createNotImplementedUseCase()
  }
});

export const startCoreApi = async (app: FastifyInstanceLike): Promise<void> => {
  const deps = createIamAdminRuntimeDependencies();
  await registerIamAdminRuntime(app, deps);
};
