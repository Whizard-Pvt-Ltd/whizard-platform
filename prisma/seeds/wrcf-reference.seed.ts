import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWrcfReference(): Promise<void> {
  // Truncate all WRCF tables in reverse-dependency order and reset sequences
  // NOTE: TRUNCATE ... CASCADE on `industries` also cascades to `tenants` (via tenants.industry_id).
  // The system tenant (id=0) is therefore re-created in wrcf-roles.seed.ts, which runs after this.
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      tasks,
      skills,
      role_capability_instances,
      control_points,
      learner_evidences,
      capability_instances,
      roles,
      department_functional_groups,
      departments,
      swos,
      pwos,
      capabilities,
      proficiencies,
      functional_groups,
      industries,
      industry_sectors
    RESTART IDENTITY CASCADE
  `);

  // Execute INSERT statements from the SQL file.
  // Disable FK checks so insert order doesn't matter.
  const sqlFile = path.join(__dirname, 'wrcf-reference.sql');
  const statements = fs.readFileSync(sqlFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('INSERT'));

  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica'`);
  try {
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
  } finally {
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin'`);
  }

  // Reset sequences to max(id) + 1 to avoid conflicts on future inserts
  const sequences: [string, string][] = [
    ['capabilities_id_seq',              'capabilities'],
    ['capability_instances_id_seq',      'capability_instances'],
    ['control_points_id_seq',            'control_points'],
    ['department_functional_groups_id_seq', 'department_functional_groups'],
    ['departments_id_seq',               'departments'],
    ['functional_groups_id_seq',         'functional_groups'],
    ['industries_id_seq',                'industries'],
    ['industry_sectors_id_seq',          'industry_sectors'],
    ['proficiencies_id_seq',             'proficiencies'],
    ['pwos_id_seq',                      'pwos'],
    ['roles_id_seq',                     'roles'],
    ['role_capability_instances_id_seq', 'role_capability_instances'],
    ['skills_id_seq',                    'skills'],
    ['swos_id_seq',                      'swos'],
    ['tasks_id_seq',                     'tasks'],
  ];

  for (const [seq, table] of sequences) {
    await prisma.$executeRawUnsafe(
      `SELECT setval('${seq}', COALESCE((SELECT MAX(id) FROM ${table}), 1))`
    );
  }

  console.log(`WRCF reference data seeded (${statements.length} statements).`);
}

seedWrcfReference()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
