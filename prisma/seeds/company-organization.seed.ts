import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_USER = 'seed';

// Fixed UUIDs for tenants
const TENANT_TCS        = 'b1000000-0000-0000-0000-000000000001';
const TENANT_TECHNOVA   = 'b1000000-0000-0000-0000-000000000002';
const TENANT_HDFC       = 'b1000000-0000-0000-0000-000000000003';
const TENANT_AIRTEL     = 'b1000000-0000-0000-0000-000000000004';
const TENANT_AMAZON     = 'b1000000-0000-0000-0000-000000000005';

// Fixed UUIDs for companies
const CO_TCS      = 'c1000000-0000-0000-0000-000000000001';
const CO_TECHNOVA = 'c1000000-0000-0000-0000-000000000002';
const CO_HDFC     = 'c1000000-0000-0000-0000-000000000003';
const CO_AIRTEL   = 'c1000000-0000-0000-0000-000000000004';
const CO_AMAZON   = 'c1000000-0000-0000-0000-000000000005';

// Fixed UUIDs for contact users
const USER_ANANYA   = 'd1000000-0000-0000-0000-000000000001';
const USER_ROHIT    = 'd1000000-0000-0000-0000-000000000002';
const USER_NEHA     = 'd1000000-0000-0000-0000-000000000003';
const USER_VIKRAM   = 'd1000000-0000-0000-0000-000000000004';
const USER_SHRUTI   = 'd1000000-0000-0000-0000-000000000005';
const USER_ADITYA   = 'd1000000-0000-0000-0000-000000000006';
const USER_PRIYA    = 'd1000000-0000-0000-0000-000000000007';
const USER_RAHUL    = 'd1000000-0000-0000-0000-000000000008';
const USER_DIVYA    = 'd1000000-0000-0000-0000-000000000009';
const USER_KARAN    = 'd1000000-0000-0000-0000-000000000010';

async function seedCompanyOrganization(): Promise<void> {

  // ── Industries (lookup from existing WRCF seed) ───────────────────────────
  const industries = await prisma.$queryRawUnsafe<Array<{ public_uuid: string; name: string }>>(
    `SELECT public_uuid, name FROM industries`
  );
  const itIndustry = industries.find(i => i.name.toLowerCase().includes('it') || i.name.toLowerCase().includes('service'));
  const industryId = itIndustry?.public_uuid ?? null;

  // ── Cities (from college-operations seed) ────────────────────────────────
  const cities = await prisma.city.findMany({ where: { isActive: true } });
  const bangalore = cities.find(c => c.name === 'Bengaluru');
  const mumbai    = cities.find(c => c.name === 'Mumbai');
  const hyderabad = cities.find(c => c.name === 'Hyderabad');
  const delhi     = cities.find(c => c.name === 'Delhi');

  // ── Contact Users ─────────────────────────────────────────────────────────
  const contactUsers = [
    { id: USER_ANANYA, primaryLoginId: 'ananya.singh@company.in',  primaryEmail: 'ananya.singh@company.in'  },
    { id: USER_ROHIT,  primaryLoginId: 'rohit.malhotra@company.in', primaryEmail: 'rohit.malhotra@company.in' },
    { id: USER_NEHA,   primaryLoginId: 'neha.reddy@company.in',     primaryEmail: 'neha.reddy@company.in'    },
    { id: USER_VIKRAM, primaryLoginId: 'vikram.patel@company.in',   primaryEmail: 'vikram.patel@company.in'  },
    { id: USER_SHRUTI, primaryLoginId: 'shruti.deshmukh@company.in',primaryEmail: 'shruti.deshmukh@company.in'},
    { id: USER_ADITYA, primaryLoginId: 'aditya.bansal@company.in',  primaryEmail: 'aditya.bansal@company.in' },
    { id: USER_PRIYA,  primaryLoginId: 'priya.nair@company.in',     primaryEmail: 'priya.nair@company.in'    },
    { id: USER_RAHUL,  primaryLoginId: 'rahul.gupta@company.in',    primaryEmail: 'rahul.gupta@company.in'   },
    { id: USER_DIVYA,  primaryLoginId: 'divya.mehta@company.in',    primaryEmail: 'divya.mehta@company.in'   },
    { id: USER_KARAN,  primaryLoginId: 'karan.verma@company.in',    primaryEmail: 'karan.verma@company.in'   },
  ];

  for (const user of contactUsers) {
    await prisma.userAccount.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        primaryLoginId: user.primaryLoginId,
        primaryEmail: user.primaryEmail,
        authMode: 'Password',
        mfaRequired: false,
      }
    });
  }
  console.log('Company contact users seeded.');

  // ── Tenants ───────────────────────────────────────────────────────────────
  const tenants = [
    { id: TENANT_TCS,      name: 'Tata Consultancy Services',  type: 'COMPANY' },
    { id: TENANT_TECHNOVA, name: 'TechNova Solutions Pvt. Ltd', type: 'COMPANY' },
    { id: TENANT_HDFC,     name: 'HDFC Bank',                  type: 'COMPANY' },
    { id: TENANT_AIRTEL,   name: 'Bharti Airtel',              type: 'COMPANY' },
    { id: TENANT_AMAZON,   name: 'Amazon',                     type: 'COMPANY' },
  ];

  for (const t of tenants) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, isActive: true },
    });
  }
  console.log('Company tenants seeded.');

  // ── Companies ─────────────────────────────────────────────────────────────
  const companies = [
    {
      id: CO_TCS,
      tenantId: TENANT_TCS,
      companyCode: 'CMP-2025-BLR-001',
      name: 'Tata Consultancy Services (TCS)',
      cityId: bangalore?.id,
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
      industryId: industryId,
    },
    {
      id: CO_TECHNOVA,
      tenantId: TENANT_TECHNOVA,
      companyCode: 'CMP-2025-BLR-002',
      name: 'TechNova Solutions Pvt. Ltd.',
      cityId: bangalore?.id,
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
      industryId: industryId,
    },
    {
      id: CO_HDFC,
      tenantId: TENANT_HDFC,
      companyCode: 'CLG-2025-BLR-002',
      name: 'HDFC Bank',
      cityId: mumbai?.id,
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
      id: CO_AIRTEL,
      tenantId: TENANT_AIRTEL,
      companyCode: 'CLG-2025-BLR-003',
      name: 'Bharti Airtel',
      cityId: delhi?.id,
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
      id: CO_AMAZON,
      tenantId: TENANT_AMAZON,
      companyCode: 'CLG-2025-BLR-004',
      name: 'Amazon',
      cityId: hyderabad?.id,
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
      industryId: industryId,
    },
  ];

  for (const co of companies) {
    await prisma.company.upsert({
      where: { id: co.id },
      update: {},
      create: { ...co, isActive: true, createdBy: SEED_USER },
    });
  }
  console.log('Companies seeded.');

  // ── Company Contacts ──────────────────────────────────────────────────────
  const contacts = [
    // TechNova
    { id: 'e1000000-0000-0000-0000-000000000001', companyId: CO_TECHNOVA, userId: USER_ANANYA, contactRole: 'HR_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000002', companyId: CO_TECHNOVA, userId: USER_ROHIT,  contactRole: 'HR_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000003', companyId: CO_TECHNOVA, userId: USER_NEHA,   contactRole: 'COMMUNICATION_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000004', companyId: CO_TECHNOVA, userId: USER_VIKRAM, contactRole: 'RECRUITMENT_HEAD' },
    { id: 'e1000000-0000-0000-0000-000000000005', companyId: CO_TECHNOVA, userId: USER_SHRUTI, contactRole: 'TRAINING_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000006', companyId: CO_TECHNOVA, userId: USER_ADITYA, contactRole: 'INTERNSHIP_MENTOR' },
    // TCS
    { id: 'e1000000-0000-0000-0000-000000000007', companyId: CO_TCS, userId: USER_PRIYA,  contactRole: 'HR_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000008', companyId: CO_TCS, userId: USER_RAHUL,  contactRole: 'RECRUITMENT_HEAD' },
    { id: 'e1000000-0000-0000-0000-000000000009', companyId: CO_TCS, userId: USER_DIVYA,  contactRole: 'TRAINING_COORDINATOR' },
    { id: 'e1000000-0000-0000-0000-000000000010', companyId: CO_TCS, userId: USER_KARAN,  contactRole: 'INTERNSHIP_MENTOR' },
  ];

  for (const contact of contacts) {
    await prisma.companyContact.upsert({
      where: { companyId_userId_contactRole: { companyId: contact.companyId, userId: contact.userId, contactRole: contact.contactRole } },
      update: {},
      create: { ...contact, isActive: true, createdBy: SEED_USER },
    });
  }
  console.log('Company contacts seeded.');

  // ── Hiring Stats ──────────────────────────────────────────────────────────
  const hiringStats = [
    { id: 'f1000000-0000-0000-0000-000000000001', companyId: CO_TECHNOVA, year: 2024, hires: 150, internshipConversionRate: 0.7 },
    { id: 'f1000000-0000-0000-0000-000000000002', companyId: CO_TECHNOVA, year: 2023, hires: 120, internshipConversionRate: 0.65 },
    { id: 'f1000000-0000-0000-0000-000000000003', companyId: CO_TCS,      year: 2024, hires: 500, internshipConversionRate: 0.8 },
  ];

  for (const stat of hiringStats) {
    await prisma.companyHiringStat.upsert({
      where: { id: stat.id },
      update: {},
      create: { ...stat, createdBy: SEED_USER },
    });
  }

  // ── Hiring Roles ──────────────────────────────────────────────────────────
  const hiringRoles = [
    { id: 'f2000000-0000-0000-0000-000000000001', companyId: CO_TECHNOVA, roleName: 'Software Developer' },
    { id: 'f2000000-0000-0000-0000-000000000002', companyId: CO_TECHNOVA, roleName: 'Cloud Engineer' },
    { id: 'f2000000-0000-0000-0000-000000000003', companyId: CO_TECHNOVA, roleName: 'AI Specialist' },
    { id: 'f2000000-0000-0000-0000-000000000004', companyId: CO_TECHNOVA, roleName: 'Cybersecurity Analyst' },
    { id: 'f2000000-0000-0000-0000-000000000005', companyId: CO_TCS,      roleName: 'Software Engineer' },
    { id: 'f2000000-0000-0000-0000-000000000006', companyId: CO_TCS,      roleName: 'Data Engineer' },
  ];

  for (const role of hiringRoles) {
    await prisma.companyHiringRole.upsert({
      where: { id: role.id },
      update: {},
      create: { ...role, isActive: true, createdBy: SEED_USER },
    });
  }

  // ── Hiring Domains ────────────────────────────────────────────────────────
  const hiringDomains = [
    { id: 'f3000000-0000-0000-0000-000000000001', companyId: CO_TECHNOVA, domain: 'Cloud Computing' },
    { id: 'f3000000-0000-0000-0000-000000000002', companyId: CO_TECHNOVA, domain: 'AI/ML' },
    { id: 'f3000000-0000-0000-0000-000000000003', companyId: CO_TECHNOVA, domain: 'Cybersecurity' },
    { id: 'f3000000-0000-0000-0000-000000000004', companyId: CO_TECHNOVA, domain: 'DevOps' },
    { id: 'f3000000-0000-0000-0000-000000000005', companyId: CO_TCS,      domain: 'Software Engineering' },
    { id: 'f3000000-0000-0000-0000-000000000006', companyId: CO_TCS,      domain: 'Data Analytics' },
  ];

  for (const domain of hiringDomains) {
    await prisma.companyHiringDomain.upsert({
      where: { id: domain.id },
      update: {},
      create: { ...domain, isActive: true, createdBy: SEED_USER },
    });
  }

  // ── Compensation Stats ────────────────────────────────────────────────────
  const compensationStats = [
    { id: 'f4000000-0000-0000-0000-000000000001', companyId: CO_TECHNOVA, year: 2024, highestPackage: 22, averagePackage: 8.5 },
    { id: 'f4000000-0000-0000-0000-000000000002', companyId: CO_TCS,      year: 2024, highestPackage: 22, averagePackage: 8.5 },
    { id: 'f4000000-0000-0000-0000-000000000003', companyId: CO_AMAZON,   year: 2024, highestPackage: 45, averagePackage: 18  },
  ];

  for (const stat of compensationStats) {
    await prisma.companyCompensationStat.upsert({
      where: { id: stat.id },
      update: {},
      create: { ...stat, createdBy: SEED_USER },
    });
  }

  console.log('Hiring stats, roles, domains, compensation stats seeded.');
  console.log('Company organization seed completed successfully.');
}

seedCompanyOrganization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
