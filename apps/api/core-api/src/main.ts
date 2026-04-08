import {
  StackAuthTokenVerifierGateway,
  StackAuthUserSyncService,
  PrismaUserAccountRepository,
  loadStackAuthConfig,
  loadStackAuthUserSyncConfig,
  type StackAuthVerifierConfig
} from '@whizard/identity-access';
import type { FastifyInstanceLike } from './modules/iam/shared/request-context';
import { registerIamCoreApiRuntime, type IamCoreApiRuntimeDependencies } from './modules/iam/runtime';
import { GetCurrentUserProfileUseCase } from './use-cases/get-current-user-profile.use-case';
import { StackAuthLoginUseCase } from './use-cases/stack-auth-login.use-case';

const createNotImplementedUseCase = () => ({
  async execute(): Promise<{ data: Record<string, unknown> }> {
    throw new Error('IAM use case dependency is not wired yet.');
  }
});

const createDeprecatedUseCase = (message: string) => ({
  async execute(): Promise<{ data: Record<string, unknown> }> {
    throw new Error(message);
  }
});

export const createIamCoreApiRuntimeDependencies = (): IamCoreApiRuntimeDependencies => {
  // Initialize Stack Auth dependencies
  const stackAuthConfig = loadStackAuthConfig();
  const verifierConfig: StackAuthVerifierConfig = {
    projectId: stackAuthConfig.projectId,
    secretServerKey: stackAuthConfig.secretServerKey
  };
  const tokenVerifier = new StackAuthTokenVerifierGateway(verifierConfig);
  const syncConfig = loadStackAuthUserSyncConfig();
  const userAccountRepository = new PrismaUserAccountRepository();
  const userSyncService = new StackAuthUserSyncService(userAccountRepository, syncConfig);

  // Create Stack Auth login use case
  const stackAuthLoginUseCase = new StackAuthLoginUseCase({
    tokenVerifier,
    userSyncService
  });

  return {
    // Authentication endpoints (login, MFA, refresh, logout)
    // Note: Login now uses Stack Auth
    auth: {
      authenticateWithPassword: stackAuthLoginUseCase,
      startMfaChallenge: createNotImplementedUseCase(),
      verifyMfaChallenge: createNotImplementedUseCase(),
      refreshSession: createNotImplementedUseCase(),
      logoutSession: createNotImplementedUseCase()
    },
    // User access endpoints (profile, grants, memberships, sessions)
    userAccess: {
      getCurrentUserProfile: new GetCurrentUserProfileUseCase(),
      getMyAccessGrants: createNotImplementedUseCase(),
      getTenantMemberships: createNotImplementedUseCase(),
      getMySessions: createNotImplementedUseCase(),
      revokeAllSessions: createNotImplementedUseCase()
    },
    // Admin access control endpoints
    adminAccess: {
      assignRole: createNotImplementedUseCase(),
      revokeRole: createNotImplementedUseCase(),
      grantPermission: createNotImplementedUseCase(),
      revokePermission: createNotImplementedUseCase()
    },
    // Federation endpoints
    federation: {
      createIdentityProvider: createNotImplementedUseCase(),
      updateIdentityProvider: createNotImplementedUseCase(),
      updateSsoRoleMapping: createNotImplementedUseCase()
    },
    // Provisioning endpoints
    provisioning: {
      inviteUserToTenant: createNotImplementedUseCase(),
      provisionAccessFromSso: createNotImplementedUseCase(),
      suspendProvisionedAccess: createNotImplementedUseCase(),
      reactivateProvisionedAccess: createNotImplementedUseCase(),
      deprovisionAccess: createNotImplementedUseCase()
    }
  };
};

export const startCoreApi = async (app: FastifyInstanceLike): Promise<void> => {
  const deps = createIamCoreApiRuntimeDependencies();
  await registerIamCoreApiRuntime(app, deps);
};
