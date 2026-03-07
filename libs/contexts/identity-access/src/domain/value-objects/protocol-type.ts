import { assertOneOf } from './validation.util';

const PROTOCOLS = ['OIDC', 'SAML2', 'OAUTH2'] as const;
export type ProtocolTypeValue = (typeof PROTOCOLS)[number];

export class ProtocolType {
  private constructor(public readonly value: ProtocolTypeValue) {}

  static from(value: string): ProtocolType {
    return new ProtocolType(assertOneOf(value, PROTOCOLS, 'ProtocolType'));
  }
}
