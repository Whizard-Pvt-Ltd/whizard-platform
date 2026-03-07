import { randomBytes, scryptSync } from 'node:crypto';
import { secureCompare } from './secure-compare.util';

const SCRYPT_KEYLEN = 64;
const DEFAULT_SCRYPT_N = 16384;
const DEFAULT_SCRYPT_R = 8;
const DEFAULT_SCRYPT_P = 1;

export interface PasswordHasherConfig {
  readonly keyLength: number;
  readonly n: number;
  readonly r: number;
  readonly p: number;
}

export const defaultPasswordHasherConfig: PasswordHasherConfig = {
  keyLength: SCRYPT_KEYLEN,
  n: DEFAULT_SCRYPT_N,
  r: DEFAULT_SCRYPT_R,
  p: DEFAULT_SCRYPT_P
};

export class PasswordHasherService {
  constructor(private readonly config: PasswordHasherConfig = defaultPasswordHasherConfig) {}

  hash(plainTextPassword: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(plainTextPassword, salt, this.config.keyLength, {
      N: this.config.n,
      r: this.config.r,
      p: this.config.p
    }).toString('hex');

    return [
      'scrypt',
      String(this.config.n),
      String(this.config.r),
      String(this.config.p),
      salt,
      derived
    ].join('$');
  }

  verify(plainTextPassword: string, storedHash: string): boolean {
    const [algorithm, n, r, p, salt, expected] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !n || !r || !p || !salt || !expected) {
      return false;
    }

    const actual = scryptSync(plainTextPassword, salt, expected.length / 2, {
      N: Number(n),
      r: Number(r),
      p: Number(p)
    }).toString('hex');

    return secureCompare(actual, expected);
  }
}
