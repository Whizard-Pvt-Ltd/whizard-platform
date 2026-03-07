import { ValueObjectError } from './value-object.error';

const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const assertNonEmpty = (value: string, field: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new ValueObjectError(`${field} cannot be empty.`);
  }
  return normalized;
};

export const assertUuidLike = (value: string, field: string): string => {
  const normalized = assertNonEmpty(value, field);
  if (!UUID_LIKE.test(normalized)) {
    throw new ValueObjectError(`${field} must be a UUID string.`);
  }
  return normalized;
};

export const assertOneOf = <T extends string>(value: string, allowed: readonly T[], field: string): T => {
  const normalized = assertNonEmpty(value, field).toUpperCase();
  if (!allowed.includes(normalized as T)) {
    throw new ValueObjectError(`${field} must be one of: ${allowed.join(', ')}.`);
  }
  return normalized as T;
};
