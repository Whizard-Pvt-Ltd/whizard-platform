export const DOMAIN_TYPES = ['Operations', 'Maintenance', 'Quality'] as const;
export type DomainType = typeof DOMAIN_TYPES[number];
