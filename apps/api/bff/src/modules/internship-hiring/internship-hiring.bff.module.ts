import type { FastifyInstanceLike } from '../iam/shared/request-context';
import { registerInternshipHiringBffRoutes } from './routes';

export const registerInternshipHiringBffModule = async (app: FastifyInstanceLike): Promise<void> => {
  await app.register(async (scopedApp) => {
    registerInternshipHiringBffRoutes(scopedApp);
  }, { prefix: '/internships' });
};
