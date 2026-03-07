import {
  IamOutboxDispatcher,
  IamTopicPublisher,
  PrismaOutboxEventRepository,
  type KafkaProducerPort
} from '@whizard/identity-access';

class NoopKafkaProducer implements KafkaProducerPort {
  async send(): Promise<void> {
    throw new Error('Kafka producer is not wired. Provide infrastructure KafkaProducerPort implementation.');
  }
}

export interface OutboxPublisherDependencies {
  readonly dispatcher: IamOutboxDispatcher;
}

export const createOutboxPublisherDependencies = (): OutboxPublisherDependencies => {
  const repository = new PrismaOutboxEventRepository();
  const publisher = new IamTopicPublisher(new NoopKafkaProducer());

  return {
    dispatcher: new IamOutboxDispatcher(repository, publisher)
  };
};
