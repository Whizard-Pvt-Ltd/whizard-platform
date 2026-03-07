export interface ActorLinkRecord {
  id: string;
  userAccountId: string;
  actorType: string;
  actorEntityId: string;
  isPrimary: boolean;
  linkedAt: Date;
}
