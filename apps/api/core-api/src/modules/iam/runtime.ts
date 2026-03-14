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
import {
  registerIamAuthModule,
  type IamAuthModuleDependencies
} from './auth/auth.module';
import {
  registerIamUserAccessModule,
  type IamUserAccessModuleDependencies
} from './user-access/user-access.module';

export interface IamCoreApiRuntimeDependencies {
  readonly auth: IamAuthModuleDependencies;
  readonly userAccess: IamUserAccessModuleDependencies;
  readonly adminAccess: IamAccessAdminModuleDependencies;
  readonly federation: IamFederationModuleDependencies;
  readonly provisioning: IamProvisioningModuleDependencies;
}

export const registerIamCoreApiRuntime = async (
  app: FastifyInstanceLike,
  deps: IamCoreApiRuntimeDependencies
): Promise<void> => {
  // User-facing endpoints (authentication and access)
  await registerIamAuthModule(app, deps.auth);
  await registerIamUserAccessModule(app, deps.userAccess);

  // Admin endpoints
  await registerIamAccessAdminModule(app, deps.adminAccess);
  await registerIamFederationModule(app, deps.federation);
  await registerIamProvisioningModule(app, deps.provisioning);
};

// Backwards compatibility alias
export type IamAdminRuntimeDependencies = IamCoreApiRuntimeDependencies;
export const registerIamAdminRuntime = registerIamCoreApiRuntime;
