import { GrantSource } from '../value-objects/grant-source';
import { PermissionCode } from '../value-objects/permission-code';
import { ResourceScope } from '../value-objects/resource-scope';

export class PermissionGrantEntity {
  constructor(
    public readonly permission: PermissionCode,
    public readonly source: GrantSource,
    public readonly scope: ResourceScope | null
  ) {}
}
