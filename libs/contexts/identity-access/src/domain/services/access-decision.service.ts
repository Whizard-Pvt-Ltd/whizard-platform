import { AccessDecision } from '../value-objects/access-decision';
import { PermissionCode } from '../value-objects/permission-code';

export class AccessDecisionService {
  evaluate(input: {
    requiredPermission: PermissionCode;
    grantedPermissions: ReadonlyArray<PermissionCode>;
  }): AccessDecision {
    const match = input.grantedPermissions.some(
      (permission) => permission.value === input.requiredPermission.value
    );

    return match ? AccessDecision.allow() : AccessDecision.deny();
  }
}
