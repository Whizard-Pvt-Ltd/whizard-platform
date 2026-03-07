export interface ActorLink {
  actorLinkId: string;
  actorType: 'STUDENT' | 'COLLEGE_USER' | 'COMPANY_USER' | 'SYSTEM_USER';
  actorEntityId: string;
  isPrimary: boolean;
  linkedAt: Date;
}
