import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerResourceUploadBffRoutes } from './routes';

export const registerResourceUploadBffModule = async (app: FastifyInstanceLike): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerResourceUploadBffRoutes(scopedApp);
  }, { prefix: '/resource-upload' });
};
