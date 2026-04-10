import type { FastifyInstanceLike } from '../iam/shared/request-context';
import type { ResourceUploadModuleDependencies } from './runtime';
import { registerResourceUploadRoutes } from './routes';

export const registerResourceUploadModule = async (
  app: FastifyInstanceLike,
  deps: ResourceUploadModuleDependencies,
): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerResourceUploadRoutes(scopedApp, deps);
  }, { prefix: '/api/resource-upload' });
};
