import { randomUUID } from 'crypto';
import type { DomainEvent } from '../events/domain-event.base';

export interface IndustryRoleProps {
  id: string;
  tenantId: string;
  departmentId: string;
  industryId?: string;
  name: string;
  description?: string;
  seniorityLevel?: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
  createdBy?: string;
}

class IndustryRoleCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class IndustryRoleUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class IndustryRoleDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class IndustryRole {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly departmentId: string;
  readonly industryId?: string;
  name: string;
  description?: string;
  seniorityLevel?: string;
  reportingTo?: string;
  roleCriticalityScore?: number;
  readonly createdBy?: string;

  private constructor(props: IndustryRoleProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.departmentId = props.departmentId;
    this.industryId = props.industryId;
    this.name = props.name;
    this.description = props.description;
    this.seniorityLevel = props.seniorityLevel;
    this.reportingTo = props.reportingTo;
    this.roleCriticalityScore = props.roleCriticalityScore;
    this.createdBy = props.createdBy;
  }

  static create(props: Omit<IndustryRoleProps, 'id'>): IndustryRole {
    const role = new IndustryRole({ ...props, id: randomUUID() });
    role._domainEvents.push(new IndustryRoleCreatedEvent(role.id, role.tenantId, { name: role.name, departmentId: role.departmentId }));
    return role;
  }

  static reconstitute(props: IndustryRoleProps): IndustryRole {
    return new IndustryRole(props);
  }

  update(partial: Partial<Pick<IndustryRoleProps, 'name' | 'description' | 'seniorityLevel' | 'reportingTo' | 'roleCriticalityScore'>>): void {
    if (partial.name !== undefined) this.name = partial.name;
    if (partial.description !== undefined) this.description = partial.description;
    if (partial.seniorityLevel !== undefined) this.seniorityLevel = partial.seniorityLevel;
    if (partial.reportingTo !== undefined) this.reportingTo = partial.reportingTo;
    if (partial.roleCriticalityScore !== undefined) this.roleCriticalityScore = partial.roleCriticalityScore;
    this._domainEvents.push(new IndustryRoleUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  delete(): void {
    this._domainEvents.push(new IndustryRoleDeletedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
