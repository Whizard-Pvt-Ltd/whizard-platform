import { assertNonEmpty, assertOneOf, assertUuidLike } from './validation.util';

const ACTOR_TYPES = ['STUDENT', 'COLLEGE_USER', 'COMPANY_USER', 'SYSTEM_USER'] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export class ActorRef {
  private constructor(
    public readonly actorType: ActorType,
    public readonly actorEntityId: string
  ) {}

  static from(input: { actorType: string; actorEntityId: string }): ActorRef {
    const actorType = assertOneOf(input.actorType, ACTOR_TYPES, 'ActorType');
    const actorEntityId = assertNonEmpty(input.actorEntityId, 'ActorEntityId');
    if (actorEntityId.includes('-')) {
      assertUuidLike(actorEntityId, 'ActorEntityId');
    }
    return new ActorRef(actorType, actorEntityId);
  }
}
