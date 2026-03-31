import { randomUUID } from 'crypto';
import type { DomainEvent } from '../events/domain-event.base';

export interface TaskProps {
  id: string;
  tenantId: string;
  skillId: string;
  name: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration?: number;
  requiredProficiencyLevel?: string;
}

class TaskCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class TaskUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class TaskDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class Task {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly skillId: string;
  name: string;
  description?: string;
  frequency: string;
  complexity: string;
  standardDuration?: number;
  requiredProficiencyLevel?: string;

  private constructor(props: TaskProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.skillId = props.skillId;
    this.name = props.name;
    this.description = props.description;
    this.frequency = props.frequency;
    this.complexity = props.complexity;
    this.standardDuration = props.standardDuration;
    this.requiredProficiencyLevel = props.requiredProficiencyLevel;
  }

  static create(props: Omit<TaskProps, 'id'>): Task {
    const task = new Task({ ...props, id: randomUUID() });
    task._domainEvents.push(new TaskCreatedEvent(task.id, task.tenantId, { skillId: task.skillId, name: task.name }));
    return task;
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  update(partial: Partial<Omit<TaskProps, 'id' | 'tenantId' | 'skillId'>>): void {
    if (partial.name !== undefined) this.name = partial.name;
    if (partial.description !== undefined) this.description = partial.description;
    if (partial.frequency !== undefined) this.frequency = partial.frequency;
    if (partial.complexity !== undefined) this.complexity = partial.complexity;
    if (partial.standardDuration !== undefined) this.standardDuration = partial.standardDuration;
    if (partial.requiredProficiencyLevel !== undefined) this.requiredProficiencyLevel = partial.requiredProficiencyLevel;
    this._domainEvents.push(new TaskUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  delete(): void {
    this._domainEvents.push(new TaskDeletedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
