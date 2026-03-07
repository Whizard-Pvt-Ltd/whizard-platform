import type { FastifyInstanceLike } from './shared/request-context';
import { registerIamAuthModule, type IamAuthModuleDependencies } from './auth/auth.module';
import { registerIamAccessModule, type IamAccessModuleDependencies } from './access/access.module';

export interface IamBffRuntimeDependencies {
  readonly auth: IamAuthModuleDependencies;
  readonly access: IamAccessModuleDependencies;
}

export const registerIamBffRuntime = async (
  app: FastifyInstanceLike,
  deps: IamBffRuntimeDependencies
): Promise<void> => {
  await registerIamAuthModule(app, deps.auth);
  await registerIamAccessModule(app, deps.access);
};
