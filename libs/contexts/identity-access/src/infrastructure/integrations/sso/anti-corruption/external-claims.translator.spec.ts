import { describe, expect, it } from 'vitest';
import { toDomainSafeFederationInput } from './external-claims.translator';

describe('toDomainSafeFederationInput', () => {
  it('normalizes external claims to domain-safe shape', () => {
    const output = toDomainSafeFederationInput({
      sub: 'ext-123',
      email: 'user@example.com',
      groups: ['admin', 'mentor']
    });

    expect(output.externalSubjectId).toBe('ext-123');
    expect(output.claims.email).toBe('user@example.com');
    expect(output.claims.groups).toBe('admin,mentor');
  });
});
