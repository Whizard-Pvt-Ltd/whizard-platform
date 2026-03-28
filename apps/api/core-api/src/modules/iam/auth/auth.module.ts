import type { FastifyInstanceLike } from '../shared/request-context';
import { registerIamAuthRoutes } from './routes';

export interface IamAuthModuleDependencies {
  readonly authenticateWithPassword: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly startMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly verifyMfaChallenge: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly refreshSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
  readonly logoutSession: {
    execute(input: { request: Record<string, unknown> }): Promise<{ data?: Record<string, unknown> }>;
  };
}

export const registerIamAuthModule = async (
  app: FastifyInstanceLike,
  deps: IamAuthModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerIamAuthRoutes(scopedApp, deps);
  }, { prefix: '/api/iam/auth' });
};
