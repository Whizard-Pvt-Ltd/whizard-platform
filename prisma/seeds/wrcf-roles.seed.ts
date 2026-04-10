import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDUSTRY_UUID = 'c1d00bcb-fdc8-4a6c-9924-f73a4f4b373a'; // Thermal Power Plant

const SYSTEM_TENANT_ID = BigInt(0);

// Department UUIDs
const DEPT_OPERATIONS_UUID    = 'f0000000-0000-0000-0000-000000000001';
const DEPT_MAINTENANCE_UUID   = 'f0000000-0000-0000-0000-000000000002';
const DEPT_ELECTRICAL_UUID    = 'f0000000-0000-0000-0000-000000000003';
const DEPT_IC_UUID            = 'f0000000-0000-0000-0000-000000000004'; // Instrumentation & Control
const DEPT_COAL_HANDLING_UUID = 'f0000000-0000-0000-0000-000000000005';
const DEPT_SHE_UUID           = 'f0000000-0000-0000-0000-000000000006'; // Safety, Health & Environment

async function seedWrcfRoles(): Promise<void> {
  // The TRUNCATE CASCADE in wrcf-reference.seed.ts wipes the tenants table via the
  // industries → tenants FK cascade. Re-create the system tenant here, after that seed.
  await prisma.$executeRawUnsafe(`
    INSERT INTO tenants (id, public_uuid, name, type, is_active, created_on)
    OVERRIDING SYSTEM VALUE
    VALUES (0, gen_random_uuid(), 'System', 'SYSTEM', true, now())
    ON CONFLICT (id) DO NOTHING
  `);
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('tenants', 'id'),
      GREATEST(1, (SELECT MAX(id) FROM tenants WHERE id > 0))
    )
  `);
  console.log('System tenant (id=0) ensured.');

  const industry = await prisma.industry.findUnique({
    where: { publicUuid: INDUSTRY_UUID },
    select: { id: true },
  });
  if (!industry) {
    throw new Error(`Industry ${INDUSTRY_UUID} not found — run wrcf-reference.seed.ts first`);
  }
  const industryId = industry.id;

  // ── Departments ───────────────────────────────────────────────────────────
  const deptDefs = [
    { uuid: DEPT_OPERATIONS_UUID,    name: 'Operations',                     operationalCriticality: 5.0, revenueContribution: 5.0, regulatoryExposure: 3.0 },
    { uuid: DEPT_MAINTENANCE_UUID,   name: 'Maintenance',                    operationalCriticality: 4.5, revenueContribution: 4.0, regulatoryExposure: 3.5 },
    { uuid: DEPT_ELECTRICAL_UUID,    name: 'Electrical',                     operationalCriticality: 4.5, revenueContribution: 4.0, regulatoryExposure: 4.0 },
    { uuid: DEPT_IC_UUID,            name: 'Instrumentation & Control',      operationalCriticality: 4.0, revenueContribution: 3.5, regulatoryExposure: 4.0 },
    { uuid: DEPT_COAL_HANDLING_UUID, name: 'Coal Handling',                  operationalCriticality: 4.5, revenueContribution: 4.5, regulatoryExposure: 3.5 },
    { uuid: DEPT_SHE_UUID,           name: 'Safety, Health & Environment',   operationalCriticality: 3.0, revenueContribution: 2.0, regulatoryExposure: 5.0 },
  ];

  for (const d of deptDefs) {
    await prisma.department.upsert({
      where: { publicUuid: d.uuid },
      update: { industryId, name: d.name },
      create: {
        publicUuid:                 d.uuid,
        tenantId:                   SYSTEM_TENANT_ID,
        industryId,
        name:                       d.name,
        operationalCriticalityScore: d.operationalCriticality,
        revenueContributionWeight:   d.revenueContribution,
        regulatoryExposureLevel:     d.regulatoryExposure,
        isActive:                   true,
        version:                    1,
      },
    });
  }
  console.log(`Departments seeded (${deptDefs.length}).`);

  // Resolve department BigInt IDs
  const deptRecords = await prisma.department.findMany({
    where: { publicUuid: { in: deptDefs.map(d => d.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const deptMap = new Map(deptRecords.map(r => [r.publicUuid, r.id]));

  // ── Department → Functional Group mappings ────────────────────────────────
  // Map FGs (by their seeded IDs) to departments. FG IDs from wrcf-reference.sql:
  //   1=Coal Handling System, 2=Boiler System, 3=Turbine System,
  //   4=Generator System, 5=Condenser & Cooling, 6-18=others
  const fgs = await prisma.functionalGroup.findMany({ select: { id: true, name: true } });
  const fgByName = new Map(fgs.map(f => [f.name, f.id]));

  const deptFgMappings: { deptUuid: string; fgName: string }[] = [
    { deptUuid: DEPT_COAL_HANDLING_UUID, fgName: 'Coal Handling System' },
    { deptUuid: DEPT_OPERATIONS_UUID,    fgName: 'Boiler System' },
    { deptUuid: DEPT_OPERATIONS_UUID,    fgName: 'Turbine System' },
    { deptUuid: DEPT_ELECTRICAL_UUID,    fgName: 'Generator System' },
    { deptUuid: DEPT_OPERATIONS_UUID,    fgName: 'Condenser & Cooling' },
  ];

  for (const m of deptFgMappings) {
    const deptId = deptMap.get(m.deptUuid);
    const fgId   = fgByName.get(m.fgName);
    if (!deptId || !fgId) continue;

    const existing = await prisma.departmentFunctionalGroup.findFirst({
      where: { departmentId: deptId, functionalGroupId: fgId },
    });
    if (!existing) {
      await prisma.departmentFunctionalGroup.create({
        data: {
          tenantId:          SYSTEM_TENANT_ID,
          departmentId:      deptId,
          functionalGroupId: fgId,
          isActive:          true,
          version:           1,
        },
      });
    }
  }
  console.log('Department–FG mappings seeded.');

  // ── Industry Roles ────────────────────────────────────────────────────────
  const roleDefs: { uuid: string; deptUuid: string; name: string; seniority: string; criticality: number }[] = [
    // Operations
    { uuid: 'f1000000-0000-0000-0000-000000000001', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Control Room Operator',          seniority: 'Operator',      criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000002', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Unit Operator',                  seniority: 'Operator',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000003', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Plant Operator',                 seniority: 'Operator',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000004', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Shift Charge Engineer',          seniority: 'Senior',        criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000005', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Assistant Shift Engineer',       seniority: 'Engineer',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000006', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Boiler Operator',                seniority: 'Operator',      criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000007', deptUuid: DEPT_OPERATIONS_UUID,    name: 'Turbine Operator',               seniority: 'Operator',      criticality: 5 },
    // Maintenance
    { uuid: 'f1000000-0000-0000-0000-000000000010', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Mechanical Fitter',              seniority: 'Technician',    criticality: 3 },
    { uuid: 'f1000000-0000-0000-0000-000000000011', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Mechanical Technician',          seniority: 'Technician',    criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000012', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Maintenance Engineer',           seniority: 'Engineer',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000013', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Turbine Mechanic',               seniority: 'Technician',    criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000014', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Boiler Maintenance Technician',  seniority: 'Technician',    criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000015', deptUuid: DEPT_MAINTENANCE_UUID,   name: 'Welding & Fabrication Fitter',   seniority: 'Technician',    criticality: 3 },
    // Electrical
    { uuid: 'f1000000-0000-0000-0000-000000000020', deptUuid: DEPT_ELECTRICAL_UUID,    name: 'Electrician',                    seniority: 'Technician',    criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000021', deptUuid: DEPT_ELECTRICAL_UUID,    name: 'HV Switchgear Technician',       seniority: 'Technician',    criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000022', deptUuid: DEPT_ELECTRICAL_UUID,    name: 'Electrical Engineer',            seniority: 'Engineer',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000023', deptUuid: DEPT_ELECTRICAL_UUID,    name: 'Generator Operator',             seniority: 'Operator',      criticality: 5 },
    // Instrumentation & Control
    { uuid: 'f1000000-0000-0000-0000-000000000030', deptUuid: DEPT_IC_UUID,            name: 'Instrument Technician',          seniority: 'Technician',    criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000031', deptUuid: DEPT_IC_UUID,            name: 'DCS Engineer',                   seniority: 'Engineer',      criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000032', deptUuid: DEPT_IC_UUID,            name: 'Control Systems Engineer',       seniority: 'Engineer',      criticality: 5 },
    { uuid: 'f1000000-0000-0000-0000-000000000033', deptUuid: DEPT_IC_UUID,            name: 'PLC Technician',                 seniority: 'Technician',    criticality: 4 },
    // Coal Handling
    { uuid: 'f1000000-0000-0000-0000-000000000040', deptUuid: DEPT_COAL_HANDLING_UUID, name: 'Coal Handling Operator',         seniority: 'Operator',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000041', deptUuid: DEPT_COAL_HANDLING_UUID, name: 'Stacker/Reclaimer Operator',     seniority: 'Operator',      criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000042', deptUuid: DEPT_COAL_HANDLING_UUID, name: 'Conveyor Supervisor',            seniority: 'Senior',        criticality: 3 },
    { uuid: 'f1000000-0000-0000-0000-000000000043', deptUuid: DEPT_COAL_HANDLING_UUID, name: 'Coal Quality Analyst',           seniority: 'Analyst',       criticality: 3 },
    // Safety, Health & Environment
    { uuid: 'f1000000-0000-0000-0000-000000000050', deptUuid: DEPT_SHE_UUID,           name: 'Safety Officer',                 seniority: 'Officer',       criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000051', deptUuid: DEPT_SHE_UUID,           name: 'Environmental Specialist',       seniority: 'Specialist',    criticality: 3 },
    { uuid: 'f1000000-0000-0000-0000-000000000052', deptUuid: DEPT_SHE_UUID,           name: 'SHE Manager',                    seniority: 'Manager',       criticality: 4 },
    { uuid: 'f1000000-0000-0000-0000-000000000053', deptUuid: DEPT_SHE_UUID,           name: 'Permit-to-Work Coordinator',     seniority: 'Coordinator',   criticality: 4 },
  ];

  for (const role of roleDefs) {
    const deptId = deptMap.get(role.deptUuid)!;
    await prisma.role.upsert({
      where: { publicUuid: role.uuid },
      update: { industryId, name: role.name },
      create: {
        publicUuid:           role.uuid,
        tenantId:             SYSTEM_TENANT_ID,
        departmentId:         deptId,
        industryId,
        name:                 role.name,
        seniorityLevel:       role.seniority,
        roleCriticalityScore: role.criticality,
        isActive:             true,
        version:              1,
      },
    });
  }
  console.log(`Industry roles seeded (${roleDefs.length} roles across ${deptDefs.length} departments).`);
}

seedWrcfRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
