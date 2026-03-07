import { registerIamAccessAdminRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

export interface IamAccessAdminModuleDependencies {
  readonly assignRole: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly revokeRole: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly grantPermission: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly revokePermission: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamAccessAdminModule = async (
  app: FastifyInstanceLike,
  deps: IamAccessAdminModuleDependencies
): Promise<void> => {
  await app.register((scope) => {
    registerIamAccessAdminRoutes(scope, deps);
  }, { prefix: '/iam/access' });
};
