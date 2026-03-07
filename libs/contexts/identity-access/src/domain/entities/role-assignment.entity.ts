import { AssignmentWindow } from '../value-objects/assignment-window';
import { RoleCode } from '../value-objects/role-code';

export class RoleAssignmentEntity {
  constructor(
    public readonly role: RoleCode,
    public readonly window: AssignmentWindow,
    public readonly assignedBy: string
  ) {}
}
