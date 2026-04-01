import type { DomainEvent } from '../events/domain-event.base';

export interface ControlPointProps {
  id: string;
  tenantId: string;
  taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  evidenceType?: string;
  kpiThreshold?: number;
  escalationRequired: boolean;
}

class ControlPointCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class ControlPointUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class ControlPointDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class ControlPoint {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly taskId: string;
  name: string;
  description?: string;
  riskLevel: string;
  failureImpactType: string;
  evidenceType?: string;
  kpiThreshold?: number;
  escalationRequired: boolean;

  private constructor(props: ControlPointProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.taskId = props.taskId;
    this.name = props.name;
    this.description = props.description;
    this.riskLevel = props.riskLevel;
    this.failureImpactType = props.failureImpactType;
    this.evidenceType = props.evidenceType;
    this.kpiThreshold = props.kpiThreshold;
    this.escalationRequired = props.escalationRequired;
  }

  static create(props: Omit<ControlPointProps, 'id'>): ControlPoint {
    const cp = new ControlPoint({ ...props, id: '0' });
    cp._domainEvents.push(new ControlPointCreatedEvent(cp.id, cp.tenantId, { taskId: cp.taskId, name: cp.name }));
    return cp;
  }

  static reconstitute(props: ControlPointProps): ControlPoint {
    return new ControlPoint(props);
  }

  update(partial: Partial<Omit<ControlPointProps, 'id' | 'tenantId' | 'taskId'>>): void {
    if (partial.name !== undefined) this.name = partial.name;
    if (partial.description !== undefined) this.description = partial.description;
    if (partial.riskLevel !== undefined) this.riskLevel = partial.riskLevel;
    if (partial.failureImpactType !== undefined) this.failureImpactType = partial.failureImpactType;
    if (partial.evidenceType !== undefined) this.evidenceType = partial.evidenceType;
    if (partial.kpiThreshold !== undefined) this.kpiThreshold = partial.kpiThreshold;
    if (partial.escalationRequired !== undefined) this.escalationRequired = partial.escalationRequired;
    this._domainEvents.push(new ControlPointUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  delete(): void {
    this._domainEvents.push(new ControlPointDeletedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
