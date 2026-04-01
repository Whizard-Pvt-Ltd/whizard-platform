import type { FastifyInstanceLike } from '../shared/request-context';
import { registerIamUserAccessRoutes } from './routes';

export interface IamUserAccessModuleDependencies {
  readonly getCurrentUserProfile: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getMyAccessGrants: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getTenantMemberships: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly getMySessions: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
  readonly revokeAllSessions: { execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }> };
}

export const registerIamUserAccessModule = async (
  app: FastifyInstanceLike,
  deps: IamUserAccessModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerIamUserAccessRoutes(scopedApp, deps);
  }, { prefix: '/api/iam/access' });
};
