import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerWrcfBffRoutes } from './routes';

export const registerWrcfBffModule = async (app: FastifyInstanceLike): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerWrcfBffRoutes(scopedApp);
  }, { prefix: '/wrcf' });
};
