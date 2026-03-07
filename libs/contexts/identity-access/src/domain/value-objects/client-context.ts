import { assertNonEmpty } from './validation.util';

export class ClientContext {
  private constructor(
    public readonly clientType: string,
    public readonly userAgent: string
  ) {}

  static from(input: { clientType: string; userAgent: string }): ClientContext {
    return new ClientContext(
      assertNonEmpty(input.clientType, 'ClientType'),
      assertNonEmpty(input.userAgent, 'UserAgent')
    );
  }
}
