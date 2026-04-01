import type { IamEventEnvelope } from '../../../../contracts/events/iam-event-envelope';
import type { KafkaProducerPort } from './kafka-producer.port';
import {
  serializeIntegrationEventV1,
  toIntegrationEventV1,
  type SerializedKafkaMessage
} from '../serializers';
import { getIamTopicForEventType, type IamTopic } from '../topic-bindings';

export class IamTopicPublisher {
  constructor(private readonly producer: KafkaProducerPort) {}

  async publish(topic: IamTopic, envelope: IamEventEnvelope): Promise<void> {
    const serialized = this.serialize(envelope);
    await this.producer.send({ topic, messages: [serialized] });
  }

  async publishRouted(envelope: IamEventEnvelope): Promise<IamTopic> {
    const topic = getIamTopicForEventType(envelope.eventType);

    if (!topic) {
      throw new Error(`No IAM topic route for event type: ${envelope.eventType}`);
    }

    await this.publish(topic, envelope);
    return topic;
  }

  private serialize(envelope: IamEventEnvelope): SerializedKafkaMessage {
    const integrationEvent = toIntegrationEventV1(envelope);
    return serializeIntegrationEventV1(integrationEvent);
  }
}
