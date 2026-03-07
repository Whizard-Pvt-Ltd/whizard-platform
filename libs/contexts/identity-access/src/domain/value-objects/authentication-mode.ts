import { assertOneOf } from './validation.util';

const AUTH_MODES = ['LOCAL_PASSWORD', 'OIDC', 'SAML', 'SERVICE_ACCOUNT'] as const;
export type AuthenticationModeValue = (typeof AUTH_MODES)[number];

export class AuthenticationMode {
  private constructor(public readonly value: AuthenticationModeValue) {}

  static from(value: string): AuthenticationMode {
    return new AuthenticationMode(assertOneOf(value, AUTH_MODES, 'AuthenticationMode'));
  }
}
