import { registerIamProvisioningRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

export interface IamProvisioningModuleDependencies {
  readonly inviteUserToTenant: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly provisionAccessFromSso: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly suspendProvisionedAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly reactivateProvisionedAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly deprovisionAccess: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamProvisioningModule = async (
  app: FastifyInstanceLike,
  deps: IamProvisioningModuleDependencies
): Promise<void> => {
  await app.register((scope) => {
    registerIamProvisioningRoutes(scope, deps);
  }, { prefix: '/iam/provisioning' });
};
