import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWrcfReference(): Promise<void> {
  // ─── Industry sectors ──────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO industry_sectors (name, description, type, is_active)
    VALUES
      ('Energy & Utilities', 'Power generation and utility industries',          'ASSET_INTENSIVE',        true),
      ('Manufacturing',      'Discrete and process manufacturing industries',    'DISCRETE_MANUFACTURING', true)
    ON CONFLICT (name) DO NOTHING
  `);

  const sectors = await prisma.$queryRawUnsafe<Array<{ public_uuid: string; name: string }>>(
    `SELECT public_uuid, name FROM industry_sectors WHERE name IN ('Manufacturing', 'Energy & Utilities')`
  );

  const energyId       = sectors.find(s => s.name === 'Energy & Utilities')!.public_uuid;
  const manufacturingId = sectors.find(s => s.name === 'Manufacturing')!.public_uuid;

  // ─── Industries ────────────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO industries (sector_id, name, is_active)
    VALUES
      ('${energyId}',        'Thermal Power Plant', true),
      ('${energyId}',        'Wind Energy',         true),
      ('${manufacturingId}', 'Steel Manufacturing', true)
    ON CONFLICT (sector_id, name) DO NOTHING
  `);

  // ─── Proficiencies ─────────────────────────────────────────────────────────
  // level must be L1–L5 (VARCHAR); label values are enforced by DB CHECK constraint.
  // L3 and L4 labels contain the literal string \u2013 (not an en dash character) — must match exactly.
  await prisma.$executeRawUnsafe(`
    INSERT INTO proficiencies (level, label, description, is_active)
    VALUES
      ('L1', 'Plant Awareness',                       'Basic awareness of plant systems',          true),
      ('L2', 'Assisted Execution',                    'Can execute tasks with assistance',         true),
      ('L3', 'Conditional Independence \\u2013 Supervised', 'Can work independently under supervision',  true),
      ('L4', 'Conditional Independence \\u2013 Scoped',     'Independent within defined scope',          true),
      ('L5', 'Full Independence',                     'Fully independent operation',               true)
    ON CONFLICT (level) DO NOTHING
  `);

  // ─── Capabilities ──────────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO capabilities (code, name, type, is_active)
    VALUES
      ('CAP-01', 'Fundamental Principles',    'Cognitive',   true),
      ('CAP-02', 'System Understanding',      'Cognitive',   true),
      ('CAP-03', 'Operational Execution',     'Execution',   true),
      ('CAP-04', 'Routine Maintenance',       'Execution',   true),
      ('CAP-05', 'Fault Diagnosis',           'Diagnostic',  true),
      ('CAP-06', 'Root Cause Analysis',       'Diagnostic',  true),
      ('CAP-07', 'First Response Resolution', 'Execution',   true)
    ON CONFLICT (code) DO NOTHING
  `);

  console.log('WRCF reference data seeded successfully.');
}

seedWrcfReference()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
