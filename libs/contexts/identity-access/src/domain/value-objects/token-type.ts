import { assertOneOf } from './validation.util';

const TOKEN_TYPES = ['ACCESS', 'REFRESH', 'ONE_TIME'] as const;
export type TokenTypeValue = (typeof TOKEN_TYPES)[number];

export class TokenType {
  private constructor(public readonly value: TokenTypeValue) {}

  static from(value: string): TokenType {
    return new TokenType(assertOneOf(value, TOKEN_TYPES, 'TokenType'));
  }
}
