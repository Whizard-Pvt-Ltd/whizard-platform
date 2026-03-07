import { registerIamAccessRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

export interface IamAccessModuleDependencies {
  readonly getCurrentUserProfile: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly getMyAccessGrants: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly getTenantMemberships: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly getMySessions: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly revokeAllSessions: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamAccessModule = async (
  app: FastifyInstanceLike,
  deps: IamAccessModuleDependencies
): Promise<void> => {
  await app.register((scope) => {
    registerIamAccessRoutes(scope, deps);
  }, { prefix: '/iam' });
};
