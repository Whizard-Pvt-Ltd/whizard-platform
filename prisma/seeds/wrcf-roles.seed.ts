import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenant UUIDs (from company-organization.seed.ts)
const TENANT_TCS_UUID      = 'b1000000-0000-0000-0000-000000000001';
const TENANT_TECHNOVA_UUID = 'b1000000-0000-0000-0000-000000000002';
const TENANT_HDFC_UUID     = 'b1000000-0000-0000-0000-000000000003';
const TENANT_AMAZON_UUID   = 'b1000000-0000-0000-0000-000000000005';

// Department UUIDs (new)
const DEPT_TCS_TECH_UUID     = 'e2000000-0000-0000-0000-000000000001';
const DEPT_TCS_DESIGN_UUID   = 'e2000000-0000-0000-0000-000000000002';
const DEPT_TCS_DATA_UUID     = 'e2000000-0000-0000-0000-000000000003';
const DEPT_TCS_PRODUCT_UUID  = 'e2000000-0000-0000-0000-000000000004';
const DEPT_NOVA_TECH_UUID    = 'e2000000-0000-0000-0000-000000000005';
const DEPT_NOVA_CYBER_UUID   = 'e2000000-0000-0000-0000-000000000006';
const DEPT_HDFC_TECH_UUID    = 'e2000000-0000-0000-0000-000000000007';
const DEPT_AMZN_TECH_UUID    = 'e2000000-0000-0000-0000-000000000008';

async function seedWrcfRoles(): Promise<void> {

  // ── Resolve tenant BigInt IDs ─────────────────────────────────────────────
  const tenantUuids = [TENANT_TCS_UUID, TENANT_TECHNOVA_UUID, TENANT_HDFC_UUID, TENANT_AMAZON_UUID];
  const tenantRecords = await prisma.tenant.findMany({
    where: { publicUuid: { in: tenantUuids } },
    select: { id: true, publicUuid: true },
  });
  if (tenantRecords.length === 0) {
    throw new Error('Tenants not found — run company-organization.seed.ts first');
  }
  const tenantMap = new Map(tenantRecords.map(r => [r.publicUuid, r.id]));
  const tcsTenantId      = tenantMap.get(TENANT_TCS_UUID)!;
  const technovaTenantId = tenantMap.get(TENANT_TECHNOVA_UUID)!;
  const hdfcTenantId     = tenantMap.get(TENANT_HDFC_UUID)!;
  const amazonTenantId   = tenantMap.get(TENANT_AMAZON_UUID)!;

  // ── Departments ───────────────────────────────────────────────────────────
  const deptDefs = [
    // TCS
    { uuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'Technology & Engineering' },
    { uuid: DEPT_TCS_DESIGN_UUID,  tenantId: tcsTenantId,      name: 'Design & UX' },
    { uuid: DEPT_TCS_DATA_UUID,    tenantId: tcsTenantId,      name: 'Data & Analytics' },
    { uuid: DEPT_TCS_PRODUCT_UUID, tenantId: tcsTenantId,      name: 'Product Management' },
    // TechNova
    { uuid: DEPT_NOVA_TECH_UUID,   tenantId: technovaTenantId, name: 'Technology & Engineering' },
    { uuid: DEPT_NOVA_CYBER_UUID,  tenantId: technovaTenantId, name: 'Cybersecurity' },
    // HDFC
    { uuid: DEPT_HDFC_TECH_UUID,   tenantId: hdfcTenantId,     name: 'Technology & Engineering' },
    // Amazon
    { uuid: DEPT_AMZN_TECH_UUID,   tenantId: amazonTenantId,   name: 'Technology & Engineering' },
  ];

  for (const d of deptDefs) {
    await prisma.department.upsert({
      where: { publicUuid: d.uuid },
      update: {},
      create: {
        publicUuid: d.uuid,
        tenantId: d.tenantId,
        name: d.name,
        isActive: true,
        version: 1,
      },
    });
  }
  console.log('Departments seeded.');

  // Resolve department BigInt IDs
  const deptRecords = await prisma.department.findMany({
    where: { publicUuid: { in: deptDefs.map(d => d.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const deptMap = new Map(deptRecords.map(r => [r.publicUuid, r.id]));

  // ── Industry Roles ────────────────────────────────────────────────────────
  const roleDefs = [
    // TCS — Technology & Engineering
    { uuid: 'e3000000-0000-0000-0000-000000000001', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'Software Development Intern',       seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000002', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'Full Stack Development Intern',      seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000003', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'Backend Development Intern',         seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000004', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'Cloud Engineering Intern',           seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000005', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'DevOps Engineering Intern',          seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000006', deptUuid: DEPT_TCS_TECH_UUID,    tenantId: tcsTenantId,      name: 'QA & Test Automation Intern',        seniority: 'Intern' },
    // TCS — Design & UX
    { uuid: 'e3000000-0000-0000-0000-000000000007', deptUuid: DEPT_TCS_DESIGN_UUID,  tenantId: tcsTenantId,      name: 'UI/UX Design Intern',                seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000008', deptUuid: DEPT_TCS_DESIGN_UUID,  tenantId: tcsTenantId,      name: 'Product Design Intern',              seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000009', deptUuid: DEPT_TCS_DESIGN_UUID,  tenantId: tcsTenantId,      name: 'Graphic Design Intern',              seniority: 'Intern' },
    // TCS — Data & Analytics
    { uuid: 'e3000000-0000-0000-0000-000000000010', deptUuid: DEPT_TCS_DATA_UUID,    tenantId: tcsTenantId,      name: 'Data Science Intern',                seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000011', deptUuid: DEPT_TCS_DATA_UUID,    tenantId: tcsTenantId,      name: 'Data Engineering Intern',            seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000012', deptUuid: DEPT_TCS_DATA_UUID,    tenantId: tcsTenantId,      name: 'Business Intelligence Intern',       seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000013', deptUuid: DEPT_TCS_DATA_UUID,    tenantId: tcsTenantId,      name: 'Machine Learning Engineering Intern', seniority: 'Intern' },
    // TCS — Product Management
    { uuid: 'e3000000-0000-0000-0000-000000000014', deptUuid: DEPT_TCS_PRODUCT_UUID, tenantId: tcsTenantId,      name: 'Product Management Intern',          seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000015', deptUuid: DEPT_TCS_PRODUCT_UUID, tenantId: tcsTenantId,      name: 'Business Analyst Intern',            seniority: 'Intern' },
    // TechNova — Technology & Engineering
    { uuid: 'e3000000-0000-0000-0000-000000000016', deptUuid: DEPT_NOVA_TECH_UUID,   tenantId: technovaTenantId, name: 'Software Development Intern',        seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000017', deptUuid: DEPT_NOVA_TECH_UUID,   tenantId: technovaTenantId, name: 'AI/ML Engineering Intern',           seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000018', deptUuid: DEPT_NOVA_TECH_UUID,   tenantId: technovaTenantId, name: 'Cloud Engineering Intern',           seniority: 'Intern' },
    // TechNova — Cybersecurity
    { uuid: 'e3000000-0000-0000-0000-000000000019', deptUuid: DEPT_NOVA_CYBER_UUID,  tenantId: technovaTenantId, name: 'Cybersecurity Intern',               seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000020', deptUuid: DEPT_NOVA_CYBER_UUID,  tenantId: technovaTenantId, name: 'Security Analyst Intern',            seniority: 'Intern' },
    // HDFC — Technology
    { uuid: 'e3000000-0000-0000-0000-000000000021', deptUuid: DEPT_HDFC_TECH_UUID,   tenantId: hdfcTenantId,     name: 'Software Development Intern',        seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000022', deptUuid: DEPT_HDFC_TECH_UUID,   tenantId: hdfcTenantId,     name: 'FinTech Engineering Intern',         seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000023', deptUuid: DEPT_HDFC_TECH_UUID,   tenantId: hdfcTenantId,     name: 'Data Analytics Intern',              seniority: 'Intern' },
    // Amazon — Technology
    { uuid: 'e3000000-0000-0000-0000-000000000024', deptUuid: DEPT_AMZN_TECH_UUID,   tenantId: amazonTenantId,   name: 'Software Development Engineer Intern', seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000025', deptUuid: DEPT_AMZN_TECH_UUID,   tenantId: amazonTenantId,   name: 'Cloud Solutions Architect Intern',   seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000026', deptUuid: DEPT_AMZN_TECH_UUID,   tenantId: amazonTenantId,   name: 'Machine Learning Intern',            seniority: 'Intern' },
    { uuid: 'e3000000-0000-0000-0000-000000000027', deptUuid: DEPT_AMZN_TECH_UUID,   tenantId: amazonTenantId,   name: 'Product Management Intern',          seniority: 'Intern' },
  ];

  for (const role of roleDefs) {
    const deptId = deptMap.get(role.deptUuid)!;
    await prisma.role.upsert({
      where: { publicUuid: role.uuid },
      update: {},
      create: {
        publicUuid:     role.uuid,
        tenantId:       role.tenantId,
        departmentId:   deptId,
        name:           role.name,
        seniorityLevel: role.seniority,
        isActive:       true,
        version:        1,
      },
    });
  }
  console.log(`Industry roles seeded (${roleDefs.length} roles across ${deptDefs.length} departments).`);
}

seedWrcfRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
