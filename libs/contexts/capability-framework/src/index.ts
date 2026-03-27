// Domain — Value Objects
export * from './domain/value-objects/domain-type.vo';
export * from './domain/value-objects/impact-level.vo';
export * from './domain/value-objects/strategic-importance.vo';
export * from './domain/value-objects/capability-type.vo';

// Domain — Events
export * from './domain/events/domain-event.base';
export * from './domain/events/functional-group.events';
export * from './domain/events/pwo.events';
export * from './domain/events/swo.events';
export * from './domain/events/capability-instance.events';

// Domain — Aggregates & Entities
export * from './domain/aggregates/functional-group.aggregate';
export * from './domain/aggregates/primary-work-object.aggregate';
export * from './domain/aggregates/secondary-work-object.aggregate';
export * from './domain/aggregates/capability-instance.aggregate';
export * from './domain/aggregates/skill.aggregate';
export * from './domain/aggregates/task.aggregate';
export * from './domain/aggregates/control-point.aggregate';
export * from './domain/aggregates/department.aggregate';
export * from './domain/aggregates/industry-role.aggregate';
export * from './domain/entities/capability.entity';
export * from './domain/entities/proficiency.entity';

// Domain — Repository Interfaces
export * from './domain/repositories/wrcf-dashboard.repository';
export * from './domain/repositories/functional-group.repository';
export * from './domain/repositories/pwo.repository';
export * from './domain/repositories/swo.repository';
export * from './domain/repositories/capability.repository';
export * from './domain/repositories/proficiency.repository';
export * from './domain/repositories/capability-instance.repository';
export * from './domain/repositories/skill.repository';
export * from './domain/repositories/task.repository';
export * from './domain/repositories/control-point.repository';
export * from './domain/repositories/industry-sector.repository';
export * from './domain/repositories/industry.repository';
export * from './domain/repositories/department.repository';
export * from './domain/repositories/industry-role.repository';
export * from './domain/repositories/role-ci-mapping.repository';

// Application — Domain Exception
export { DomainException } from './application/domain-exception';

// Application — Commands
export * from './application/commands/functional-group.commands';
export * from './application/commands/pwo.commands';
export * from './application/commands/swo.commands';
export * from './application/commands/capability-instance.commands';
export * from './application/commands/skill.commands';
export * from './application/commands/task.commands';
export * from './application/commands/control-point.commands';
export * from './application/commands/department.commands';
export * from './application/commands/industry-role.commands';
export * from './application/commands/role-ci-mapping.commands';

// Application — Command Handlers
export * from './application/command-handlers/functional-group.handlers';
export * from './application/command-handlers/pwo.handlers';
export * from './application/command-handlers/swo.handlers';
export * from './application/command-handlers/capability-instance.handlers';
export * from './application/command-handlers/skill.handlers';
export * from './application/command-handlers/task.handlers';
export * from './application/command-handlers/control-point.handlers';
export * from './application/command-handlers/department.handlers';
export * from './application/command-handlers/industry-role.handlers';
export * from './application/command-handlers/role-ci-mapping.handlers';

// Application — Ports
export * from './application/ports/repositories/capability-instance-query.port';

// Application — Query Handlers
export * from './application/query-handlers/get-dashboard-stats.handler';
export * from './application/query-handlers/list-sectors.handler';
export * from './application/query-handlers/list-industries.handler';
export * from './application/query-handlers/list-fgs.handler';
export * from './application/query-handlers/list-pwos.handler';
export * from './application/query-handlers/list-swos.handler';
export * from './application/query-handlers/list-capabilities.handler';
export * from './application/query-handlers/list-proficiencies.handler';
export * from './application/query-handlers/list-capability-instances.handler';
export * from './application/query-handlers/list-skills.handler';
export * from './application/query-handlers/list-tasks.handler';
export * from './application/query-handlers/list-control-points.handler';
export * from './application/query-handlers/list-departments.handler';
export * from './application/query-handlers/list-industry-roles.handler';
export * from './application/query-handlers/list-role-ci-mappings.handler';

// Application — DTOs
export * from './application/dto/industry-sector.dto';
export * from './application/dto/industry.dto';
export * from './application/dto/functional-group.dto';
export * from './application/dto/pwo.dto';
export * from './application/dto/swo.dto';
export * from './application/dto/capability.dto';
export * from './application/dto/proficiency.dto';
export * from './application/dto/capability-instance.dto';
export * from './application/dto/skill.dto';
export * from './application/dto/task.dto';
export * from './application/dto/control-point.dto';

// Infrastructure — Repositories (for DI wiring)
export * from './infrastructure/persistence/postgres/repositories/prisma-wrcf-dashboard.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-functional-group.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-pwo.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-swo.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-capability.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-proficiency.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-capability-instance.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-skill.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-task.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-control-point.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-industry-sector.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-industry.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-department.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-industry-role.repository';
export * from './infrastructure/persistence/postgres/repositories/prisma-role-ci-mapping.repository';
