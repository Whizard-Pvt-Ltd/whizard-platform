import type { ClockGateway } from '../../application/ports/gateways/clock.gateway';

export class SystemClockGateway implements ClockGateway {
  now(): Date {
    return new Date();
  }
}
