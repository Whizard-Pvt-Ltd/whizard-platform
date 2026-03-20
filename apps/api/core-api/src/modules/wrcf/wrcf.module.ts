import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerWrcfRoutes } from './routes';
import type { WrcfModuleDependencies } from './runtime';

export const registerWrcfModule = async (
  app: FastifyInstanceLike,
  deps: WrcfModuleDependencies
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerWrcfRoutes(scopedApp, deps);
  }, { prefix: '/api/wrcf' });
};
