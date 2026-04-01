import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerCollegeOperationsBffRoutes } from './routes';

export const registerCollegeOperationsBffModule = async (app: FastifyInstanceLike): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerCollegeOperationsBffRoutes(scopedApp);
  }, { prefix: '/colleges' });
};
