import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerCompanyOrganizationBffRoutes } from './routes';

export const registerCompanyOrganizationBffModule = async (app: FastifyInstanceLike): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerCompanyOrganizationBffRoutes(scopedApp);
  }, { prefix: '/companies' });
};
