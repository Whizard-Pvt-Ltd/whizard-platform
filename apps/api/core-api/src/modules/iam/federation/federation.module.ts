import { registerIamFederationRoutes } from './routes';
import type { FastifyInstanceLike } from '../shared/request-context';

export interface IamFederationModuleDependencies {
  readonly createIdentityProvider: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly updateIdentityProvider: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly updateSsoRoleMapping: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamFederationModule = async (
  app: FastifyInstanceLike,
  deps: IamFederationModuleDependencies
): Promise<void> => {
  await app.register((scope) => {
    registerIamFederationRoutes(scope, deps);
  }, { prefix: '/iam/federation' });
};
