import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWrcfReference(): Promise<void> {
  // Skip if reference data already exists to prevent wiping tenant/user data
  // on every deployment. Use FORCE_SEED=true env var to re-seed intentionally.
  const existing = await prisma.industrySector.count();
  if (existing > 0 && process.env['FORCE_SEED'] !== 'true') {
    console.log(`WRCF reference data already present (${existing} sectors). Skipping seed.`);
    return;
  }

  // Truncate only pure WRCF reference tables — do NOT include industries
  // at the top level with CASCADE as that would cascade to tenants and
  // wipe all user-tenant accounts. Instead, truncate leaf-to-root explicitly.
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
