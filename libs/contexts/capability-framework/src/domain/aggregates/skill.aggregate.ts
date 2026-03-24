import { randomUUID } from 'crypto';
import type { DomainEvent } from '../events/domain-event.base';

export interface SkillProps {
  id: string;
  tenantId: string;
  ciId: string;
  name: string;
  description?: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycle: number;
  aiImpact: string;
}

class SkillCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class SkillUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

class SkillDeletedEvent implements DomainEvent {
  readonly occurredAt = new Date();
  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly payload: Record<string, unknown>
  ) {}
}

export class Skill {
  private _domainEvents: DomainEvent[] = [];

  readonly id: string;
  readonly tenantId: string;
  readonly ciId: string;
  name: string;
  description?: string;
  cognitiveType: string;
  skillCriticality: string;
  recertificationCycle: number;
  aiImpact: string;

  private constructor(props: SkillProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.ciId = props.ciId;
    this.name = props.name;
    this.description = props.description;
    this.cognitiveType = props.cognitiveType;
    this.skillCriticality = props.skillCriticality;
    this.recertificationCycle = props.recertificationCycle;
    this.aiImpact = props.aiImpact;
  }

  static create(props: Omit<SkillProps, 'id'>): Skill {
    const skill = new Skill({ ...props, id: randomUUID() });
    skill._domainEvents.push(new SkillCreatedEvent(skill.id, skill.tenantId, { ciId: skill.ciId, name: skill.name }));
    return skill;
  }

  static reconstitute(props: SkillProps): Skill {
    return new Skill(props);
  }

  update(partial: Partial<Omit<SkillProps, 'id' | 'tenantId' | 'ciId'>>): void {
    if (partial.name !== undefined) this.name = partial.name;
    if (partial.description !== undefined) this.description = partial.description;
    if (partial.cognitiveType !== undefined) this.cognitiveType = partial.cognitiveType;
    if (partial.skillCriticality !== undefined) this.skillCriticality = partial.skillCriticality;
    if (partial.recertificationCycle !== undefined) this.recertificationCycle = partial.recertificationCycle;
    if (partial.aiImpact !== undefined) this.aiImpact = partial.aiImpact;
    this._domainEvents.push(new SkillUpdatedEvent(this.id, this.tenantId, { name: this.name }));
  }

  delete(): void {
    this._domainEvents.push(new SkillDeletedEvent(this.id, this.tenantId, {}));
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
