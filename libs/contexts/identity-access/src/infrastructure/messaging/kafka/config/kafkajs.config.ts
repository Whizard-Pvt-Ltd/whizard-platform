export interface KafkaJsSslConfig {
  readonly enabled: boolean;
}

export interface KafkaJsSaslConfig {
  readonly mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
  readonly username: string;
  readonly password: string;
}

export interface KafkaJsClientConfigPlaceholder {
  readonly clientId: string;
  readonly brokers: readonly string[];
  readonly ssl?: KafkaJsSslConfig;
  readonly sasl?: KafkaJsSaslConfig;
  readonly connectionTimeoutMs: number;
  readonly requestTimeoutMs: number;
}

export interface KafkaJsProducerConfigPlaceholder {
  readonly idempotent: boolean;
  readonly maxInFlightRequests: number;
  readonly transactionTimeoutMs: number;
}

export interface KafkaJsConsumerConfigPlaceholder {
  readonly groupId: string;
  readonly sessionTimeoutMs: number;
  readonly rebalanceTimeoutMs: number;
}

export interface IamKafkaRuntimeConfig {
  readonly client: KafkaJsClientConfigPlaceholder;
  readonly producer: KafkaJsProducerConfigPlaceholder;
  readonly outboxConsumer: KafkaJsConsumerConfigPlaceholder;
}

export const createIamKafkaRuntimeConfig = (): IamKafkaRuntimeConfig => ({
  client: {
    clientId: process.env.IAM_KAFKA_CLIENT_ID ?? 'iam-outbox-dispatcher',
    brokers: (process.env.IAM_KAFKA_BROKERS ?? 'localhost:9092').split(','),
    ssl: process.env.IAM_KAFKA_SSL_ENABLED === 'true' ? { enabled: true } : undefined,
    sasl:
      process.env.IAM_KAFKA_SASL_USERNAME && process.env.IAM_KAFKA_SASL_PASSWORD
        ? {
            mechanism: (process.env.IAM_KAFKA_SASL_MECHANISM ?? 'plain') as
              | 'plain'
              | 'scram-sha-256'
              | 'scram-sha-512',
            username: process.env.IAM_KAFKA_SASL_USERNAME,
            password: process.env.IAM_KAFKA_SASL_PASSWORD
          }
        : undefined,
    connectionTimeoutMs: Number(process.env.IAM_KAFKA_CONNECTION_TIMEOUT_MS ?? 3000),
    requestTimeoutMs: Number(process.env.IAM_KAFKA_REQUEST_TIMEOUT_MS ?? 30000)
  },
  producer: {
    idempotent: true,
    maxInFlightRequests: 1,
    transactionTimeoutMs: Number(process.env.IAM_KAFKA_TRANSACTION_TIMEOUT_MS ?? 60000)
  },
  outboxConsumer: {
    groupId: process.env.IAM_KAFKA_OUTBOX_GROUP_ID ?? 'iam-outbox-dispatcher-v1',
    sessionTimeoutMs: Number(process.env.IAM_KAFKA_SESSION_TIMEOUT_MS ?? 30000),
    rebalanceTimeoutMs: Number(process.env.IAM_KAFKA_REBALANCE_TIMEOUT_MS ?? 60000)
  }
});
