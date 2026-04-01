import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { WrcfModuleDependencies } from './runtime';
import { registerWrcfRoutes } from './routes';

export const registerWrcfModule = async (
  app: FastifyInstanceLike,
  deps: WrcfModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerWrcfRoutes(scopedApp, deps);
  }, { prefix: '/api/wrcf' });
};
