import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { CompanyOrganizationModuleDependencies } from './runtime';
import { registerCompanyOrganizationRoutes } from './routes';

export const registerCompanyOrganizationModule = async (
  app: FastifyInstanceLike,
  deps: CompanyOrganizationModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerCompanyOrganizationRoutes(scopedApp, deps);
  }, { prefix: '/api/companies' });
};
