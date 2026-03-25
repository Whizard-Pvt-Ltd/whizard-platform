import { randomUUID } from 'crypto';
import type { DomainEvent } from '../events/domain-event.base';

export interface DepartmentProps {
  id: string;
  tenantId: string;
  industryId: string;
  name: string;
  fgIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
  createdBy: string;
}

class DepartmentCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class DepartmentUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class DepartmentDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class Department {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly industryId: string;
  name: string;
  fgIds: string[];
  operationalCriticalityScore?: number;
  revenueContributionWeight?: number;
  regulatoryExposureLevel?: number;
  readonly createdBy: string;

  private constructor(props: DepartmentProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.industryId = props.industryId;
    this.name = props.name;
    this.fgIds = props.fgIds;
    this.operationalCriticalityScore = props.operationalCriticalityScore;
    this.revenueContributionWeight = props.revenueContributionWeight;
    this.regulatoryExposureLevel = props.regulatoryExposureLevel;
    this.createdBy = props.createdBy;
  }

  static create(props: Omit<DepartmentProps, 'id'>): Department {
    const dept = new Department({ ...props, id: randomUUID() });
    dept._domainEvents.push(new DepartmentCreatedEvent(dept.id, dept.tenantId, { name: dept.name, industryId: dept.industryId }));
    return dept;
  }

  static reconstitute(props: DepartmentProps): Department {
    return new Department(props);
  }

  update(partial: Partial<Pick<DepartmentProps, 'name' | 'fgIds' | 'operationalCriticalityScore' | 'revenueContributionWeight' | 'regulatoryExposureLevel'>>): void {
    if (partial.name !== undefined) this.name = partial.name;
    if (partial.fgIds !== undefined) this.fgIds = partial.fgIds;
    if (partial.operationalCriticalityScore !== undefined) this.operationalCriticalityScore = partial.operationalCriticalityScore;
    if (partial.revenueContributionWeight !== undefined) this.revenueContributionWeight = partial.revenueContributionWeight;
    if (partial.regulatoryExposureLevel !== undefined) this.regulatoryExposureLevel = partial.regulatoryExposureLevel;
    this._domainEvents.push(new DepartmentUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  delete(): void {
    this._domainEvents.push(new DepartmentDeletedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
