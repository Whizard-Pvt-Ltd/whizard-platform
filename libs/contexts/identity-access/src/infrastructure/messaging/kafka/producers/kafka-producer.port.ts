export interface KafkaProducerMessage {
  readonly key: string;
  readonly value: string;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface KafkaProducerPort {
  send(input: {
    topic: string;
    messages: readonly KafkaProducerMessage[];
  }): Promise<void>;
}
