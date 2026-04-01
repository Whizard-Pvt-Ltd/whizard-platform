// Domain
export * from './domain/aggregates/college.aggregate';
export * from './domain/value-objects/college-status.vo';
export * from './domain/value-objects/media-role.vo';
export *from './domain/value-objects/contact-role.vo';

// Application — command handlers
export * from './application/command-handlers/create-college.handler';
export * from './application/command-handlers/update-college.handler';
export * from './application/command-handlers/publish-college.handler';
export * from './application/command-handlers/upload-media-asset.handler';

// Application — query handlers
export * from './application/query-handlers/list-colleges.handler';
export * from './application/query-handlers/get-college-by-id.handler';
export * from './application/query-handlers/list-clubs.handler';
export * from './application/query-handlers/list-degree-programs.handler';
export * from './application/query-handlers/list-media-assets.handler';
export * from './application/query-handlers/list-cities.handler';
export * from './application/query-handlers/list-users-for-contacts.handler';

// Infrastructure — repositories
export * from './infrastructure/persistence/postgres/repositories/prisma-college.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-club.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-media-asset.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-degree-program.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-city.repository';

// DTOs
export type * from './application/dto/college.dto';
