import type { IamEventEnvelope } from '../../../contracts/events/iam-event-envelope';

export interface OutboxPort {
  append(events: IamEventEnvelope[]): Promise<void>;
}
