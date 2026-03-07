export interface OutboxEventRecord {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payloadJson: Record<string, unknown>;
  status: string;
  createdAt: Date;
  publishedAt: Date | null;
}
