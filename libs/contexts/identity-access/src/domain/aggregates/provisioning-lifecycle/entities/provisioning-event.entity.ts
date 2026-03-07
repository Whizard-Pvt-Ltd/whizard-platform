export interface ProvisioningEvent {
  eventId: string;
  eventType: string;
  eventSource: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  outcome: 'SUCCESS' | 'FAILED';
}
