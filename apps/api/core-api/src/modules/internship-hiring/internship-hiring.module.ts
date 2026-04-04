import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { InternshipHiringModuleDependencies } from './runtime';
import { registerInternshipHiringRoutes } from './routes';

export const registerInternshipHiringModule = async (
  app: FastifyInstanceLike,
  deps: InternshipHiringModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerInternshipHiringRoutes(scopedApp, deps);
  }, { prefix: '/api/internships' });
};
