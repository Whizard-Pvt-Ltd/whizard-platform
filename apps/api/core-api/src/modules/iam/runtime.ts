import type { FastifyInstanceLike } from './shared/request-context';
import {
  registerIamAccessAdminModule,
  type IamAccessAdminModuleDependencies
} from './access/access.module';
import {
  registerIamFederationModule,
  type IamFederationModuleDependencies
} from './federation/federation.module';
import {
  registerIamProvisioningModule,
  type IamProvisioningModuleDependencies
} from './provisioning/provisioning.module';

export interface IamAdminRuntimeDependencies {
  readonly access: IamAccessAdminModuleDependencies;
  readonly federation: IamFederationModuleDependencies;
  readonly provisioning: IamProvisioningModuleDependencies;
}

export const registerIamAdminRuntime = async (
  app: FastifyInstanceLike,
  deps: IamAdminRuntimeDependencies
): Promise<void> => {
  await registerIamAccessAdminModule(app, deps.access);
  await registerIamFederationModule(app, deps.federation);
  await registerIamProvisioningModule(app, deps.provisioning);
};
