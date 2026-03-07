import { describe, expect, it } from 'vitest';
import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  it('hashes and verifies passwords', () => {
    const service = new PasswordHasherService();
    const hash = service.hash('Str0ng!Pass');

    expect(service.verify('Str0ng!Pass', hash)).toBe(true);
    expect(service.verify('wrong', hash)).toBe(false);
  });
});
