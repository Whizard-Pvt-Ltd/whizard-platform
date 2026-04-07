import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PEOPLE = [
  { firstName: 'Sandeep',  lastName: 'P', slug: 'sandeepp'  },
  { firstName: 'Yogesh',   lastName: 'K', slug: 'yogeshk'   },
  { firstName: 'Sandeep',  lastName: 'S', slug: 'sandeeps'  },
  { firstName: 'Shelendra',lastName: 'S', slug: 'shelendras' },
  { firstName: 'Saurabh',  lastName: 'S', slug: 'saurabhs'  },
  { firstName: 'Yagyesh',  lastName: 'S', slug: 'yagyeshs'  },
  { firstName: 'E2E',      lastName: 'Test', slug: 'test2e2' },
];

async function seedUsers(): Promise<void> {
  // ── System (whizard.com) admins ──────────────────────────────────────────
  // The system tenant is seeded by college-operations.seed.ts with this fixed UUID
  const SYSTEM_TENANT_UUID = 'a0000000-0000-0000-0000-000000000001';
  const systemTenant = await prisma.tenant.findUnique({ where: { publicUuid: SYSTEM_TENANT_UUID } });
  if (!systemTenant) throw new Error('System tenant not found — run college-operations.seed.ts first');

  for (const person of PEOPLE) {
    const email = `${person.slug}@whizard.com`;
    await prisma.userAccount.upsert({
      where:  { primaryEmail: email },
      update: {},
      create: {
        publicUuid:      `a0000000-0000-0000-0000-${person.slug.padStart(12, '0')}`,
        primaryLoginId:  email,
        primaryEmail:    email,
        authMode:        'Password',
        mfaRequired:     false,
      }
    });
    const ua = await prisma.userAccount.findUniqueOrThrow({ where: { primaryEmail: email } });
    await prisma.userAccountTenant.upsert({
      where:  { userAccountId_tenantId: { userAccountId: ua.id, tenantId: systemTenant.id } },
      update: { isActive: true },
      create: { userAccountId: ua.id, tenantId: systemTenant.id, tenantType: systemTenant.type }
    });
  }
  console.log('System admin users seeded.');

  // ── Company users (company.com) ──────────────────────────────────────────
  const companyTenants = await prisma.tenant.findMany({ where: { type: 'COMPANY' } });
  if (companyTenants.length === 0) throw new Error('No COMPANY tenants found — run company-organization.seed.ts first');

  for (let i = 0; i < PEOPLE.length; i++) {
    const person = PEOPLE[i];
    const email  = `${person.slug}@company.com`;
    const tenant = companyTenants[i % companyTenants.length];

    await prisma.userAccount.upsert({
      where:  { primaryEmail: email },
      update: {},
      create: {
        publicUuid:     `b0000000-0000-0000-0000-${person.slug.padStart(12, '0')}`,
        primaryLoginId: email,
        primaryEmail:   email,
        authMode:       'Password',
        mfaRequired:    false,
      }
    });
    const ua = await prisma.userAccount.findUniqueOrThrow({ where: { primaryEmail: email } });
    await prisma.userAccountTenant.upsert({
      where:  { userAccountId_tenantId: { userAccountId: ua.id, tenantId: tenant.id } },
      update: { isActive: true },
      create: { userAccountId: ua.id, tenantId: tenant.id, tenantType: 'COMPANY' }
    });
  }
  console.log('Company users seeded.');

  // ── College users (college.com) ──────────────────────────────────────────
  const collegeTenants = await prisma.tenant.findMany({ where: { type: 'COLLEGE' } });
  if (collegeTenants.length === 0) throw new Error('No COLLEGE tenants found — run college-operations.seed.ts first');

  for (let i = 0; i < PEOPLE.length; i++) {
    const person = PEOPLE[i];
    const email  = `${person.slug}@college.com`;
    const tenant = collegeTenants[i % collegeTenants.length];

    await prisma.userAccount.upsert({
      where:  { primaryEmail: email },
      update: {},
      create: {
        publicUuid:     `c0000000-0000-0000-0000-${person.slug.padStart(12, '0')}`,
        primaryLoginId: email,
        primaryEmail:   email,
        authMode:       'Password',
        mfaRequired:    false,
      }
    });
    const ua = await prisma.userAccount.findUniqueOrThrow({ where: { primaryEmail: email } });
    await prisma.userAccountTenant.upsert({
      where:  { userAccountId_tenantId: { userAccountId: ua.id, tenantId: tenant.id } },
      update: { isActive: true },
      create: { userAccountId: ua.id, tenantId: tenant.id, tenantType: 'COLLEGE' }
    });
  }
  console.log('College users seeded.');

  console.log('Users seed completed successfully.');
}

seedUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
