import { ClientContext } from '../value-objects/client-context';

export class SessionDeviceEntity {
  constructor(
    public readonly deviceFingerprint: string,
    public readonly context: ClientContext
  ) {}
}
