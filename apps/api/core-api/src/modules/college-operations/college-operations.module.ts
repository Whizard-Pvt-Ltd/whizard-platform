import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { CollegeOperationsModuleDependencies } from './runtime';
import { registerCollegeOperationsRoutes } from './routes';

export const registerCollegeOperationsModule = async (
  app: FastifyInstanceLike,
  deps: CollegeOperationsModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerCollegeOperationsRoutes(scopedApp, deps);
  }, { prefix: '/api/colleges' });
};
