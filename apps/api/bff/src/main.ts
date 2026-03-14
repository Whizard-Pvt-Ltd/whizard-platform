import { CoreApiClient } from '@whizard/core-api-client';
import { registerIamBffRuntime, type IamBffRuntimeDependencies } from './modules/iam/runtime';
import type { FastifyInstanceLike } from './modules/iam/shared/request-context';

// Get Core-API base URL from environment variable
const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:3001';

// Create singleton Core-API client
const coreApiClient = new CoreApiClient({
  baseUrl: CORE_API_URL,
  timeout: 30000 // 30 seconds
});

/**
 * Create HTTP proxy use cases that forward requests to Core-API
 */
const createCoreApiProxyUseCase = (path: string, method: 'GET' | 'POST' = 'POST') => ({
  async execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> {
    const { request } = input;

    const apiRequest = {
      actorUserAccountId: String(request.actorUserAccountId ?? ''),
      tenantType: (request.tenantType as 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY') ?? 'SYSTEM',
      tenantId: String(request.tenantId ?? ''),
      payload: (request.payload as Record<string, unknown>) ?? {}
    };

    const response = method === 'POST'
      ? await coreApiClient.post(path, apiRequest)
      : await coreApiClient.get(path, apiRequest);

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Core-API request failed');
    }

    return { data: response.data };
  }
});

export const createIamBffRuntimeDependencies = (): IamBffRuntimeDependencies => {
  return {
    auth: {
      authenticateWithPassword: createCoreApiProxyUseCase('/api/iam/auth/login', 'POST'),
      startMfaChallenge: createCoreApiProxyUseCase('/api/iam/auth/mfa/challenges', 'POST'),
      verifyMfaChallenge: createCoreApiProxyUseCase('/api/iam/auth/mfa/challenges/verify', 'POST'),
      refreshSession: createCoreApiProxyUseCase('/api/iam/auth/refresh', 'POST'),
      logoutSession: createCoreApiProxyUseCase('/api/iam/auth/logout', 'POST')
    },
    access: {
      getCurrentUserProfile: createCoreApiProxyUseCase('/api/iam/access/me', 'GET'),
      getMyAccessGrants: createCoreApiProxyUseCase('/api/iam/access/me/access-grants', 'GET'),
      getTenantMemberships: createCoreApiProxyUseCase('/api/iam/access/me/memberships', 'GET'),
      getMySessions: createCoreApiProxyUseCase('/api/iam/access/me/sessions', 'GET'),
      revokeAllSessions: createCoreApiProxyUseCase('/api/iam/access/me/sessions/revoke-all', 'POST')
    }
  };
};

export const startBff = async (app: FastifyInstanceLike): Promise<void> => {
  const deps = createIamBffRuntimeDependencies();
  await registerIamBffRuntime(app, deps);
};
