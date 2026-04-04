// Domain
export * from './domain/aggregates/internship.aggregate';
export * from './domain/value-objects/internship-status.vo';
export * from './domain/value-objects/internship-type.vo';
export * from './domain/exceptions/internship-not-found.exception';

// Application — command handlers
export * from './application/command-handlers/create-internship.handler';
export * from './application/command-handlers/update-internship.handler';
export * from './application/command-handlers/publish-internship.handler';
export * from './application/command-handlers/archive-internship.handler';
export * from './application/command-handlers/upload-internship-file.handler';

// Application — query handlers
export * from './application/query-handlers/list-internships.handler';
export * from './application/query-handlers/get-internship-by-id.handler';

// Infrastructure — repositories
export * from './infrastructure/persistence/postgres/prisma-internship.repository';

// DTOs
export type * from './application/dto/internship.dto';
