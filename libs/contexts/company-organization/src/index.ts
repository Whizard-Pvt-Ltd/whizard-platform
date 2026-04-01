// Domain
export * from './domain/aggregates/company.aggregate';
export * from './domain/value-objects/company-status.vo';
export * from './domain/value-objects/media-role.vo';
export * from './domain/value-objects/contact-role.vo';

// Application — command handlers
export * from './application/command-handlers/create-company.handler';
export * from './application/command-handlers/update-company.handler';
export * from './application/command-handlers/publish-company.handler';
export * from './application/command-handlers/upload-media-asset.handler';

// Application — query handlers
export * from './application/query-handlers/list-companies.handler';
export * from './application/query-handlers/get-company-by-id.handler';
export * from './application/query-handlers/list-clubs.handler';
export * from './application/query-handlers/list-industries.handler';
export * from './application/query-handlers/list-cities.handler';
export * from './application/query-handlers/list-users-for-contacts.handler';

// Infrastructure — repositories
export * from './infrastructure/persistence/postgres/repositories/prisma-company.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-media-asset.repository';

// DTOs
export type * from './application/dto/company.dto';
