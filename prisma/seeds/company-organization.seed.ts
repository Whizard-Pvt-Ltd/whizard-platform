import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fixed UUIDs for tenants
const TENANT_TCS_UUID      = 'b1000000-0000-0000-0000-000000000001';
const TENANT_TECHNOVA_UUID = 'b1000000-0000-0000-0000-000000000002';
const TENANT_HDFC_UUID     = 'b1000000-0000-0000-0000-000000000003';
const TENANT_AIRTEL_UUID   = 'b1000000-0000-0000-0000-000000000004';
const TENANT_AMAZON_UUID   = 'b1000000-0000-0000-0000-000000000005';

// Fixed UUIDs for companies
const CO_TCS_UUID      = 'c1000000-0000-0000-0000-000000000001';
const CO_TECHNOVA_UUID = 'c1000000-0000-0000-0000-000000000002';
const CO_HDFC_UUID     = 'c1000000-0000-0000-0000-000000000003';
const CO_AIRTEL_UUID   = 'c1000000-0000-0000-0000-000000000004';
const CO_AMAZON_UUID   = 'c1000000-0000-0000-0000-000000000005';

// Fixed UUIDs for contact users
const USER_ANANYA_UUID = 'd1000000-0000-0000-0000-000000000001';
const USER_ROHIT_UUID  = 'd1000000-0000-0000-0000-000000000002';
const USER_NEHA_UUID   = 'd1000000-0000-0000-0000-000000000003';
const USER_VIKRAM_UUID = 'd1000000-0000-0000-0000-000000000004';
const USER_SHRUTI_UUID = 'd1000000-0000-0000-0000-000000000005';
const USER_ADITYA_UUID = 'd1000000-0000-0000-0000-000000000006';
const USER_PRIYA_UUID  = 'd1000000-0000-0000-0000-000000000007';
const USER_RAHUL_UUID  = 'd1000000-0000-0000-0000-000000000008';
const USER_DIVYA_UUID  = 'd1000000-0000-0000-0000-000000000009';
const USER_KARAN_UUID  = 'd1000000-0000-0000-0000-000000000010';

async function seedCompanyOrganization(): Promise<void> {

  // ── Contact Users (seed first to get BigInt IDs for createdBy) ────────────
  const contactUserDefs = [
    { uuid: USER_ANANYA_UUID, primaryLoginId: 'ananya.singh@company.in',   primaryEmail: 'ananya.singh@company.in'   },
    { uuid: USER_ROHIT_UUID,  primaryLoginId: 'rohit.malhotra@company.in', primaryEmail: 'rohit.malhotra@company.in' },
    { uuid: USER_NEHA_UUID,   primaryLoginId: 'neha.reddy@company.in',     primaryEmail: 'neha.reddy@company.in'     },
    { uuid: USER_VIKRAM_UUID, primaryLoginId: 'vikram.patel@company.in',   primaryEmail: 'vikram.patel@company.in'   },
    { uuid: USER_SHRUTI_UUID, primaryLoginId: 'shruti.deshmukh@company.in',primaryEmail: 'shruti.deshmukh@company.in'},
    { uuid: USER_ADITYA_UUID, primaryLoginId: 'aditya.bansal@company.in',  primaryEmail: 'aditya.bansal@company.in'  },
    { uuid: USER_PRIYA_UUID,  primaryLoginId: 'priya.nair@company.in',     primaryEmail: 'priya.nair@company.in'     },
    { uuid: USER_RAHUL_UUID,  primaryLoginId: 'rahul.gupta@company.in',    primaryEmail: 'rahul.gupta@company.in'    },
    { uuid: USER_DIVYA_UUID,  primaryLoginId: 'divya.mehta@company.in',    primaryEmail: 'divya.mehta@company.in'    },
    { uuid: USER_KARAN_UUID,  primaryLoginId: 'karan.verma@company.in',    primaryEmail: 'karan.verma@company.in'    },
  ];

  for (const user of contactUserDefs) {
    await prisma.userAccount.upsert({
      where: { publicUuid: user.uuid },
      update: {},
      create: {
        publicUuid: user.uuid,
        primaryLoginId: user.primaryLoginId,
        primaryEmail: user.primaryEmail,
        authMode: 'Password',
        mfaRequired: false,
      }
    });
  }
  console.log('Company contact users seeded.');

  // Resolve BigInt IDs for all users
  const userRecords = await prisma.userAccount.findMany({
    where: { publicUuid: { in: contactUserDefs.map(u => u.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const userIdMap = new Map(userRecords.map(r => [r.publicUuid, r.id]));
  const createdBy = userIdMap.get(USER_ANANYA_UUID)!;

  // ── Industries (lookup from existing WRCF seed) ───────────────────────────
  const industries = await prisma.industry.findMany({ select: { id: true, publicUuid: true, name: true } });
  const itIndustry = industries.find(i => i.name.toLowerCase().includes('it') || i.name.toLowerCase().includes('service'));
  const industryBigIntId = itIndustry?.id ?? null;

  // ── Cities (from college-operations seed) ────────────────────────────────
  const cityRecords = await prisma.city.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const bangalore = cityRecords.find(c => c.name === 'Bengaluru');
  const mumbai    = cityRecords.find(c => c.name === 'Mumbai');
  const hyderabad = cityRecords.find(c => c.name === 'Hyderabad');
  const delhi     = cityRecords.find(c => c.name === 'Delhi');

  // ── Tenants ───────────────────────────────────────────────────────────────
  const tenantDefs = [
    { uuid: TENANT_TCS_UUID,      name: 'Tata Consultancy Services',   type: 'COMPANY' },
    { uuid: TENANT_TECHNOVA_UUID, name: 'TechNova Solutions Pvt. Ltd', type: 'COMPANY' },
    { uuid: TENANT_HDFC_UUID,     name: 'HDFC Bank',                   type: 'COMPANY' },
    { uuid: TENANT_AIRTEL_UUID,   name: 'Bharti Airtel',               type: 'COMPANY' },
    { uuid: TENANT_AMAZON_UUID,   name: 'Amazon',                      type: 'COMPANY' },
  ];

  for (const t of tenantDefs) {
    await prisma.tenant.upsert({
      where: { publicUuid: t.uuid },
      update: {},
      create: { publicUuid: t.uuid, name: t.name, type: t.type, isActive: true },
    });
  }
  console.log('Company tenants seeded.');

  // Resolve BigInt IDs for tenants
  const tenantRecords = await prisma.tenant.findMany({
    where: { publicUuid: { in: tenantDefs.map(t => t.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const tenantIdMap = new Map(tenantRecords.map(r => [r.publicUuid, r.id]));

  // ── Companies ─────────────────────────────────────────────────────────────
  const companyDefs = [
    {
      uuid: CO_TCS_UUID,
      tenantUuid: TENANT_TCS_UUID,
      companyCode: 'CMP-2025-BLR-001',
      name: 'Tata Consultancy Services (TCS)',
      cityId: bangalore?.id ?? null,
      companyType: 'Public',
      establishedYear: 1968,
      description: 'TCS is a global leader in IT services, consulting and business solutions. With a presence in 50+ countries, TCS offers a consulting-led, cognitive powered, integrated portfolio of business, technology and engineering services.',
      whatWeOffer: '<p><strong>Cloud Solutions:</strong> Seamless migration, DevOps, and automation with AWS, Azure, and Google Cloud.</p><p><strong>Enterprise Software:</strong> Custom ERP, CRM, and SaaS solutions for scalable growth.</p>',
      awardsRecognition: '<p>• #1 IT Services Company in India – NASSCOM Rankings (2024)</p><p>• Top 50 Fastest-Growing IT Companies – Forbes India (2023)</p>',
      keyProductsServices: '<p>TCS iON: Digital assessment platform for enterprises.</p><p>TCS BaNCS: Financial services platform.</p>',
      recruitmentHighlights: '<p>Over 150 new hires in 2024, across multiple locations. Internship-to-full-time conversion rate: 70%.</p>',
      placementStats: JSON.stringify({ highestPackage: 22, averagePackage: 8.5, year: 2024, domains: ['Software Engineering', 'Cloud', 'Data Analytics'], international: 10 }),
      inquiryEmail: 'hr@tcs.com',
      status: 1,
      industryId: industryBigIntId,
    },
    {
      uuid: CO_TECHNOVA_UUID,
      tenantUuid: TENANT_TECHNOVA_UUID,
      companyCode: 'CMP-2025-BLR-002',
      name: 'TechNova Solutions Pvt. Ltd.',
      cityId: bangalore?.id ?? null,
      companyType: 'Private',
      establishedYear: 2015,
      description: 'TechNova Solutions is a leading technology services and consulting firm that specialises in cloud computing, cybersecurity, AI-driven solutions, and enterprise software development.',
      whatWeOffer: '<p><strong>Cloud Services:</strong> Infrastructure, Serverless Computing, and Cloud Security.</p><p><strong>AI & Data Science:</strong> Predictive Analytics, AI-driven Chatbots, and Machine Learning Models.</p>',
      awardsRecognition: '<p>• Best Cloud Security Provider – India Tech Awards (2022)</p><p>• Top 50 Fastest-Growing IT Companies – Forbes India (2023)</p>',
      keyProductsServices: '<p>TechNova specialises in enterprise IT services that focus on scalability, security, and automation.</p>',
      recruitmentHighlights: '<p>TechNova actively recruits top talent in software development, AI/ML, cloud computing, and cybersecurity.</p>',
      placementStats: JSON.stringify({ highestPackage: 22, averagePackage: 8.5, year: 2024, domains: ['Cloud Computing', 'AI/ML', 'Cybersecurity', 'DevOps'], international: 20 }),
      inquiryEmail: 'hr@technova.in',
      status: 1,
      industryId: industryBigIntId,
    },
    {
      uuid: CO_HDFC_UUID,
      tenantUuid: TENANT_HDFC_UUID,
      companyCode: 'CLG-2025-BLR-002',
      name: 'HDFC Bank',
      cityId: mumbai?.id ?? null,
      companyType: 'Public',
      establishedYear: 1994,
      description: 'HDFC Bank is one of India\'s leading private sector banks, offering a wide range of banking products and financial services to corporate and retail customers.',
      whatWeOffer: '<p><strong>Retail Banking:</strong> Savings accounts, home loans, personal loans, credit cards.</p><p><strong>Corporate Banking:</strong> Working capital, trade finance, treasury services.</p>',
      awardsRecognition: '<p>• Best Bank in India – Euromoney Awards (2023)</p><p>• Most Trusted Brand in Banking – Brand Trust Report (2024)</p>',
      keyProductsServices: '<p>HDFC PayZapp: Digital payments platform.</p><p>SmartHub: Merchant payment solutions.</p>',
      recruitmentHighlights: '<p>Over 200 hires in 2024 across retail banking, risk management, and technology roles.</p>',
      placementStats: JSON.stringify({ highestPackage: 18, averagePackage: 7.5, year: 2024, domains: ['Banking Technology', 'Risk Management', 'Data Analytics'], international: 5 }),
      inquiryEmail: 'campus.recruitment@hdfcbank.com',
      status: 1,
      industryId: null,
    },
    {
      uuid: CO_AIRTEL_UUID,
      tenantUuid: TENANT_AIRTEL_UUID,
      companyCode: 'CLG-2025-BLR-003',
      name: 'Bharti Airtel',
      cityId: delhi?.id ?? null,
      companyType: 'Public',
      establishedYear: 1995,
      description: 'Bharti Airtel is a leading global telecommunications company with operations in 18 countries across South Asia and Africa.',
      whatWeOffer: '<p><strong>5G Network:</strong> Ultra-fast connectivity for enterprises and consumers.</p><p><strong>Cloud & IoT:</strong> Airtel IQ – API-based communication platform.</p>',
      awardsRecognition: '<p>• Best Telecom Company – Economic Times Awards (2023)</p><p>• Digital Transformation Leader – NASSCOM (2024)</p>',
      keyProductsServices: '<p>Airtel Business: Enterprise connectivity solutions.</p><p>Airtel Payments Bank: Digital financial services.</p>',
      recruitmentHighlights: '<p>Over 100 new hires in 2024 across 5G, cloud, and network engineering roles.</p>',
      placementStats: JSON.stringify({ highestPackage: 20, averagePackage: 9, year: 2024, domains: ['5G', 'Cloud', 'Network Engineering', 'Product Management'], international: 8 }),
      inquiryEmail: 'campus@airtel.com',
      status: 0,
      industryId: null,
    },
    {
      uuid: CO_AMAZON_UUID,
      tenantUuid: TENANT_AMAZON_UUID,
      companyCode: 'CLG-2025-BLR-004',
      name: 'Amazon',
      cityId: hyderabad?.id ?? null,
      companyType: 'MNC',
      establishedYear: 1994,
      description: 'Amazon is a global technology and e-commerce company operating in cloud computing (AWS), digital streaming, artificial intelligence, and consumer electronics.',
      whatWeOffer: '<p><strong>AWS Cloud:</strong> 200+ services spanning compute, storage, database, and AI/ML.</p><p><strong>Alexa AI:</strong> Voice intelligence platform for enterprise and consumer products.</p>',
      awardsRecognition: '<p>• Best Place to Work – LinkedIn Top Companies (2024)</p><p>• Most Innovative Company – Fast Company (2023)</p>',
      keyProductsServices: '<p>AWS: World\'s leading cloud platform.</p><p>Alexa: Voice AI platform.</p><p>Amazon Prime: Subscription entertainment and commerce service.</p>',
      recruitmentHighlights: '<p>Over 300 new hires in 2024, including SDE, data engineer, and product manager roles.</p>',
      placementStats: JSON.stringify({ highestPackage: 45, averagePackage: 18, year: 2024, domains: ['Software Development', 'Cloud', 'Machine Learning', 'Product Management'], international: 30 }),
      inquiryEmail: 'university@amazon.com',
      status: 1,
      industryId: industryBigIntId,
    },
  ];

  for (const co of companyDefs) {
    const tenantId = tenantIdMap.get(co.tenantUuid)!;
    await prisma.company.upsert({
      where: { publicUuid: co.uuid },
      update: {},
      create: {
        publicUuid: co.uuid,
        tenantId,
        industryId: co.industryId,
        companyCode: co.companyCode,
        name: co.name,
        cityId: co.cityId,
        companyType: co.companyType,
        establishedYear: co.establishedYear,
        description: co.description,
        whatWeOffer: co.whatWeOffer,
        awardsRecognition: co.awardsRecognition,
        keyProductsServices: co.keyProductsServices,
        recruitmentHighlights: co.recruitmentHighlights,
        placementStats: co.placementStats,
        inquiryEmail: co.inquiryEmail,
        status: co.status,
        isActive: true,
        createdBy,
      },
    });
  }
  console.log('Companies seeded.');

  // Resolve BigInt IDs for companies
  const companyRecords = await prisma.company.findMany({
    where: { publicUuid: { in: companyDefs.map(c => c.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const companyIdMap = new Map(companyRecords.map(r => [r.publicUuid, r.id]));

  // ── Company Contacts ──────────────────────────────────────────────────────
  const contactDefs = [
    // TechNova
    { uuid: 'e1000000-0000-0000-0000-000000000001', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_ANANYA_UUID, contactRole: 'HR_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000002', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_ROHIT_UUID,  contactRole: 'HR_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000003', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_NEHA_UUID,   contactRole: 'COMMUNICATION_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000004', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_VIKRAM_UUID, contactRole: 'RECRUITMENT_HEAD' },
    { uuid: 'e1000000-0000-0000-0000-000000000005', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_SHRUTI_UUID, contactRole: 'TRAINING_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000006', companyUuid: CO_TECHNOVA_UUID, userUuid: USER_ADITYA_UUID, contactRole: 'INTERNSHIP_MENTOR' },
    // TCS
    { uuid: 'e1000000-0000-0000-0000-000000000007', companyUuid: CO_TCS_UUID, userUuid: USER_PRIYA_UUID,  contactRole: 'HR_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000008', companyUuid: CO_TCS_UUID, userUuid: USER_RAHUL_UUID,  contactRole: 'RECRUITMENT_HEAD' },
    { uuid: 'e1000000-0000-0000-0000-000000000009', companyUuid: CO_TCS_UUID, userUuid: USER_DIVYA_UUID,  contactRole: 'TRAINING_COORDINATOR' },
    { uuid: 'e1000000-0000-0000-0000-000000000010', companyUuid: CO_TCS_UUID, userUuid: USER_KARAN_UUID,  contactRole: 'INTERNSHIP_MENTOR' },
  ];

  for (const contact of contactDefs) {
    const companyId = companyIdMap.get(contact.companyUuid)!;
    const userId = userIdMap.get(contact.userUuid)!;
    await prisma.companyContact.upsert({
      where: { publicUuid: contact.uuid },
      update: {},
      create: { publicUuid: contact.uuid, companyId, userId, contactRole: contact.contactRole, isActive: true, createdBy },
    });
  }
  console.log('Company contacts seeded.');

  // ── Hiring Stats ──────────────────────────────────────────────────────────
  const hiringStats = [
    { uuid: 'f1000000-0000-0000-0000-000000000001', companyUuid: CO_TECHNOVA_UUID, year: 2024, hires: 150, internshipConversionRate: 0.7 },
    { uuid: 'f1000000-0000-0000-0000-000000000002', companyUuid: CO_TECHNOVA_UUID, year: 2023, hires: 120, internshipConversionRate: 0.65 },
    { uuid: 'f1000000-0000-0000-0000-000000000003', companyUuid: CO_TCS_UUID,      year: 2024, hires: 500, internshipConversionRate: 0.8 },
  ];

  for (const stat of hiringStats) {
    await prisma.companyHiringStat.upsert({
      where: { publicUuid: stat.uuid },
      update: {},
      create: { publicUuid: stat.uuid, companyId: companyIdMap.get(stat.companyUuid)!, year: stat.year, hires: stat.hires, internshipConversionRate: stat.internshipConversionRate, createdBy },
    });
  }

  // ── Hiring Roles ──────────────────────────────────────────────────────────
  const hiringRoles = [
    { uuid: 'f2000000-0000-0000-0000-000000000001', companyUuid: CO_TECHNOVA_UUID, roleName: 'Software Developer' },
    { uuid: 'f2000000-0000-0000-0000-000000000002', companyUuid: CO_TECHNOVA_UUID, roleName: 'Cloud Engineer' },
    { uuid: 'f2000000-0000-0000-0000-000000000003', companyUuid: CO_TECHNOVA_UUID, roleName: 'AI Specialist' },
    { uuid: 'f2000000-0000-0000-0000-000000000004', companyUuid: CO_TECHNOVA_UUID, roleName: 'Cybersecurity Analyst' },
    { uuid: 'f2000000-0000-0000-0000-000000000005', companyUuid: CO_TCS_UUID,      roleName: 'Software Engineer' },
    { uuid: 'f2000000-0000-0000-0000-000000000006', companyUuid: CO_TCS_UUID,      roleName: 'Data Engineer' },
  ];

  for (const role of hiringRoles) {
    await prisma.companyHiringRole.upsert({
      where: { publicUuid: role.uuid },
      update: {},
      create: { publicUuid: role.uuid, companyId: companyIdMap.get(role.companyUuid)!, roleName: role.roleName, isActive: true, createdBy },
    });
  }

  // ── Hiring Domains ────────────────────────────────────────────────────────
  const hiringDomains = [
    { uuid: 'f3000000-0000-0000-0000-000000000001', companyUuid: CO_TECHNOVA_UUID, domain: 'Cloud Computing' },
    { uuid: 'f3000000-0000-0000-0000-000000000002', companyUuid: CO_TECHNOVA_UUID, domain: 'AI/ML' },
    { uuid: 'f3000000-0000-0000-0000-000000000003', companyUuid: CO_TECHNOVA_UUID, domain: 'Cybersecurity' },
    { uuid: 'f3000000-0000-0000-0000-000000000004', companyUuid: CO_TECHNOVA_UUID, domain: 'DevOps' },
    { uuid: 'f3000000-0000-0000-0000-000000000005', companyUuid: CO_TCS_UUID,      domain: 'Software Engineering' },
    { uuid: 'f3000000-0000-0000-0000-000000000006', companyUuid: CO_TCS_UUID,      domain: 'Data Analytics' },
  ];

  for (const domain of hiringDomains) {
    await prisma.companyHiringDomain.upsert({
      where: { publicUuid: domain.uuid },
      update: {},
      create: { publicUuid: domain.uuid, companyId: companyIdMap.get(domain.companyUuid)!, domain: domain.domain, isActive: true, createdBy },
    });
  }

  // ── Compensation Stats ────────────────────────────────────────────────────
  const compensationStats = [
    { uuid: 'f4000000-0000-0000-0000-000000000001', companyUuid: CO_TECHNOVA_UUID, year: 2024, highestPackage: 22, averagePackage: 8.5 },
    { uuid: 'f4000000-0000-0000-0000-000000000002', companyUuid: CO_TCS_UUID,      year: 2024, highestPackage: 22, averagePackage: 8.5 },
    { uuid: 'f4000000-0000-0000-0000-000000000003', companyUuid: CO_AMAZON_UUID,   year: 2024, highestPackage: 45, averagePackage: 18  },
  ];

  for (const stat of compensationStats) {
    await prisma.companyCompensationStat.upsert({
      where: { publicUuid: stat.uuid },
      update: {},
      create: { publicUuid: stat.uuid, companyId: companyIdMap.get(stat.companyUuid)!, year: stat.year, highestPackage: stat.highestPackage, averagePackage: stat.averagePackage, createdBy },
    });
  }

  console.log('Hiring stats, roles, domains, compensation stats seeded.');
  console.log('Company organization seed completed successfully.');
}

seedCompanyOrganization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
