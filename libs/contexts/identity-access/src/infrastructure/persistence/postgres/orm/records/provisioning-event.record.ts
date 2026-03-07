export interface ProvisioningEventRecord {
  id: string;
  provisionedAccessId: string;
  eventType: string;
  eventSource: string;
  payloadJson: Record<string, unknown>;
  occurredAt: Date;
  processedAt: Date | null;
  outcome: string;
}
