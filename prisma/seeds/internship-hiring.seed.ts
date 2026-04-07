import { PrismaClient, InternshipType, InternshipStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ── Existing UUIDs (from company-organization.seed.ts) ────────────────────────
const TENANT_SYSTEM_UUID   = 'a0000000-0000-0000-0000-000000000001'; // id=1, default tenant
const TENANT_TCS_UUID      = 'b1000000-0000-0000-0000-000000000001';
const TENANT_TECHNOVA_UUID = 'b1000000-0000-0000-0000-000000000002';
const TENANT_HDFC_UUID     = 'b1000000-0000-0000-0000-000000000003';
const TENANT_AMAZON_UUID   = 'b1000000-0000-0000-0000-000000000005';

const INT_HDFC_FINTECH_UUID  = 'a3000000-0000-0000-0000-000000000008';
const INT_AMAZON_SDE_UUID    = 'a3000000-0000-0000-0000-000000000009';

const USER_ANANYA_UUID = 'd1000000-0000-0000-0000-000000000001';
const USER_ROHIT_UUID  = 'd1000000-0000-0000-0000-000000000002';
const USER_ADITYA_UUID = 'd1000000-0000-0000-0000-000000000006';
const USER_PRIYA_UUID  = 'd1000000-0000-0000-0000-000000000007';
const USER_DIVYA_UUID  = 'd1000000-0000-0000-0000-000000000009';

// ── New UUIDs for internship seed data ────────────────────────────────────────
const FG_TCS_SOFTDEV_UUID    = 'a2000000-0000-0000-0000-000000000001';
const FG_TCS_CLOUD_UUID      = 'a2000000-0000-0000-0000-000000000002';
const FG_NOVA_AI_UUID        = 'a2000000-0000-0000-0000-000000000003';
const FG_NOVA_CYBER_UUID     = 'a2000000-0000-0000-0000-000000000004';

const INT_TCS_SDET_UUID      = 'a3000000-0000-0000-0000-000000000001';
const INT_TCS_CLOUD_UUID     = 'a3000000-0000-0000-0000-000000000002';
const INT_TCS_DATA_UUID      = 'a3000000-0000-0000-0000-000000000003';
const INT_NOVA_AI_UUID       = 'a3000000-0000-0000-0000-000000000004';
const INT_NOVA_CYBER_UUID    = 'a3000000-0000-0000-0000-000000000005';
const INT_SYS_FULLSTACK_UUID = 'a3000000-0000-0000-0000-000000000006';
const INT_SYS_PRODUCT_UUID   = 'a3000000-0000-0000-0000-000000000007';

async function seedInternshipHiring(): Promise<void> {

  // ── Resolve existing tenant IDs ───────────────────────────────────────────
  const tenantRecords = await prisma.tenant.findMany({
    where: { publicUuid: { in: [TENANT_SYSTEM_UUID, TENANT_TCS_UUID, TENANT_TECHNOVA_UUID, TENANT_HDFC_UUID, TENANT_AMAZON_UUID] } },
    select: { id: true, publicUuid: true },
  });
  if (tenantRecords.length === 0) {
    throw new Error('Tenants not found — run seeds in order');
  }
  const tenantMap = new Map(tenantRecords.map(r => [r.publicUuid, r.id]));
  const systemTenantId   = tenantMap.get(TENANT_SYSTEM_UUID)!;
  const tcsTenantId      = tenantMap.get(TENANT_TCS_UUID)!;
  const technovaTenantId = tenantMap.get(TENANT_TECHNOVA_UUID)!;
  const hdfcTenantId     = tenantMap.get(TENANT_HDFC_UUID) ?? null;
  const amazonTenantId   = tenantMap.get(TENANT_AMAZON_UUID) ?? null;

  // ── Resolve user IDs ──────────────────────────────────────────────────────
  const userRecords = await prisma.userAccount.findMany({
    where: { publicUuid: { in: [USER_ANANYA_UUID, USER_ROHIT_UUID, USER_ADITYA_UUID, USER_PRIYA_UUID, USER_DIVYA_UUID] } },
    select: { id: true, publicUuid: true },
  });
  if (userRecords.length === 0) {
    throw new Error('Contact users not found — run company-organization.seed.ts first');
  }
  const userMap = new Map(userRecords.map(r => [r.publicUuid, r.id]));
  const ananyaId = userMap.get(USER_ANANYA_UUID)!;
  const rohitId  = userMap.get(USER_ROHIT_UUID)!;
  const adityaId = userMap.get(USER_ADITYA_UUID)!;
  const priyaId  = userMap.get(USER_PRIYA_UUID)!;
  const divyaId  = userMap.get(USER_DIVYA_UUID)!;

  // ── Resolve city IDs ──────────────────────────────────────────────────────
  const cityRecords = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  const bangalore = cityRecords.find(c => c.name === 'Bengaluru');
  const mumbai    = cityRecords.find(c => c.name === 'Mumbai');
  const hyderabad = cityRecords.find(c => c.name === 'Hyderabad');

  // ── Resolve first industry for functional group creation ──────────────────
  const firstIndustry = await prisma.industry.findFirst({ select: { id: true } });
  if (!firstIndustry) {
    throw new Error('No industries found — run wrcf-reference.seed.ts first');
  }
  const industryId = firstIndustry.id;

  // ── Functional Groups ─────────────────────────────────────────────────────
  const fgDefs = [
    { uuid: 'a2000000-0000-0000-0000-000000000005', tenantId: systemTenantId,   name: 'Engineering',          domainType: 'TECHNICAL'  },
    { uuid: 'a2000000-0000-0000-0000-000000000006', tenantId: systemTenantId,   name: 'Product Management',   domainType: 'FUNCTIONAL' },
    { uuid: FG_TCS_SOFTDEV_UUID,                   tenantId: tcsTenantId,      name: 'Software Development', domainType: 'TECHNICAL'  },
    { uuid: FG_TCS_CLOUD_UUID,                     tenantId: tcsTenantId,      name: 'Cloud Engineering',    domainType: 'TECHNICAL'  },
    { uuid: FG_NOVA_AI_UUID,                       tenantId: technovaTenantId, name: 'AI & Data Science',    domainType: 'TECHNICAL'  },
    { uuid: FG_NOVA_CYBER_UUID,                    tenantId: technovaTenantId, name: 'Cybersecurity',        domainType: 'TECHNICAL'  },
  ];

  for (const fg of fgDefs) {
    await prisma.functionalGroup.upsert({
      where: { publicUuid: fg.uuid },
      update: {},
      create: {
        publicUuid: fg.uuid,
        tenantId: fg.tenantId,
        industryId,
        name: fg.name,
        domainType: fg.domainType,
        isActive: true,
        version: 1,
        createdBy: ananyaId,
      },
    });
  }
  console.log('Functional groups seeded.');

  // Resolve FG BigInt IDs
  const fgRecords = await prisma.functionalGroup.findMany({
    where: { publicUuid: { in: fgDefs.map(f => f.uuid) } },
    select: { id: true, publicUuid: true },
  });
  const fgMap = new Map(fgRecords.map(r => [r.publicUuid, r.id]));

  // ── Sample JSON payloads ──────────────────────────────────────────────────

  const sampleScreeningQuestions = [
    { question: 'Why are you interested in this internship?', expectedAnswer: 'Should demonstrate genuine interest and alignment with company values.' },
    { question: 'Describe a project where you applied your technical skills.', expectedAnswer: 'Should mention specific technologies and measurable outcomes.' },
    { question: 'How do you prioritize tasks when working on multiple deadlines?', expectedAnswer: 'Should describe a structured approach such as prioritization matrix or task management tools.' },
  ];

  const sampleEligibilityCheck = {
    minClubPoints: 50,
    minProjects: 2,
    minInternships: 0,
    minClubCertification: 1,
  };

  const sampleAssessments = [
    { name: 'Technical Aptitude Test', pdfUrl: null, minScore: 60, weightage: 40 },
    { name: 'Domain Knowledge Assessment', pdfUrl: null, minScore: 55, weightage: 60 },
  ];

  const sampleInterviewRubric = {
    pdfUrl: null,
    minScore: 65,
    weightage: 100,
    criteria: ['Communication', 'Technical Knowledge', 'Problem Solving', 'Cultural Fit'],
  };

  const samplePreReadCourses = [
    { title: 'Introduction to Software Development Lifecycle', pdfUrl: null, orderIndex: 1 },
    { title: 'Agile & Scrum Fundamentals', pdfUrl: null, orderIndex: 2 },
  ];

  const samplePreReadArticles = [
    { title: 'Best Practices for Code Review', pdfUrl: null, orderIndex: 1 },
    { title: 'Clean Code Principles', pdfUrl: null, orderIndex: 2 },
  ];

  const sampleWeeklySchedule = [
    {
      orderIndex: 1,
      numberOfWeeks: 2,
      functionalGroupName: 'Software Development',
      capabilityInstanceLabel: 'Fundamental Principles — L1',
      coordinatorName: 'Priya Nair',
      focus: 'Orientation, codebase walkthrough, and environment setup',
    },
    {
      orderIndex: 2,
      numberOfWeeks: 3,
      functionalGroupName: 'Software Development',
      capabilityInstanceLabel: 'Operational Execution — L2',
      coordinatorName: 'Divya Mehta',
      focus: 'Feature development under supervision with code reviews',
    },
    {
      orderIndex: 3,
      numberOfWeeks: 3,
      functionalGroupName: 'Cloud Engineering',
      capabilityInstanceLabel: 'System Understanding — L2',
      coordinatorName: 'Priya Nair',
      focus: 'Cloud deployment pipelines, CI/CD, and infrastructure-as-code',
    },
  ];

  const sampleFinalSubmissionDocuments = [
    { type: 'INTERNSHIP_REPORT', label: 'Final Internship Report', required: true },
    { type: 'PROJECT_PRESENTATION', label: 'Project Presentation Deck', required: true },
    { type: 'MENTOR_EVALUATION', label: 'Mentor Evaluation Form', required: false },
  ];

  // ── Internships ───────────────────────────────────────────────────────────

  const systemFgEngId     = fgMap.get('a2000000-0000-0000-0000-000000000005') ?? null;
  const systemFgProductId = fgMap.get('a2000000-0000-0000-0000-000000000006') ?? null;

  const internshipDefs = [
    // System tenant (id=1) — Full Stack Web Dev Intern (PUBLISHED)
    {
      uuid: INT_SYS_FULLSTACK_UUID,
      tenantId: systemTenantId,
      companyTenantId: tcsTenantId,
      title: 'Full Stack Web Development Intern',
      vacancies: 12,
      cityId: bangalore?.id ?? null,
      stipend: 18000,
      durationMonths: 4,
      applicationDeadline: new Date('2026-06-30'),
      internshipType: InternshipType.REMOTE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: systemFgEngId,
      internshipDetail: '<p>Join our Engineering team as a Full Stack Web Development Intern. You will build and ship product features across the frontend (Angular/React) and backend (Node.js), working in a fast-paced agile environment.</p>',
      roleOverview: '<p>You will own small but complete features end to end — from UI component to API to database. Expect real code reviews, real deployments, and real user impact from week two onwards.</p>',
      keyResponsibilities: '<ul><li>Build responsive UI components in Angular 19 using standalone components and signals</li><li>Develop REST API endpoints in Node.js/Fastify</li><li>Write unit and integration tests (Vitest)</li><li>Participate in sprint planning, standups, and retrospectives</li><li>Review peer PRs and give constructive feedback</li></ul>',
      eligibilityRequirements: '<ul><li>Pursuing B.Tech / BCA / B.Sc. CS (2nd year or above)</li><li>Solid HTML, CSS, and JavaScript fundamentals</li><li>Familiarity with any JS framework (Angular, React, or Vue)</li><li>Basic knowledge of REST APIs and Git</li></ul>',
      timelineWorkSchedule: '<p><strong>Week 1-2:</strong> Onboarding, codebase walkthrough, first small bug fix<br/><strong>Week 3-8:</strong> Feature development with mentor pairing<br/><strong>Week 9-14:</strong> Independent feature ownership<br/><strong>Week 15-16:</strong> Final project wrap-up and presentation</p>',
      perksAndBenefits: '<ul><li>Stipend of Rs. 18,000/month</li><li>Fully remote — work from anywhere</li><li>PPO consideration for top performers</li><li>Direct mentorship from senior engineers</li><li>Completion certificate</li></ul>',
      selectionProcess: '<p><strong>Step 1:</strong> Resume screening<br/><strong>Step 2:</strong> Online coding round (60 mins)<br/><strong>Step 3:</strong> Technical interview</p>',
      contactInformation: '<p><strong>Internship Team:</strong> internships@system.in<br/><strong>Coordinator:</strong> Ananya Singh</p>',
      screeningQuestions: [
        { question: 'What frontend framework are you most comfortable with and why?', expectedAnswer: 'Should demonstrate hands-on experience with at least one framework and explain the reasoning.' },
        { question: 'Describe how an HTTP request travels from browser to database and back.', expectedAnswer: 'Should cover DNS, TCP, HTTP, server routing, DB query, response serialization.' },
        { question: 'Have you contributed to any open-source project or personal project? Describe it.', expectedAnswer: 'Should show initiative, technical depth, and ability to ship something.' },
      ],
      eligibilityCheck: { minClubPoints: 30, minProjects: 1, minInternships: 0, minClubCertification: 0 },
      assessments: [{ name: 'JavaScript & Web Fundamentals Test', pdfUrl: null, minScore: 55, weightage: 100 }],
      interviewRubric: { pdfUrl: null, minScore: 60, weightage: 100, criteria: ['JS/TS Knowledge', 'Problem Solving', 'Communication', 'Eagerness to Learn'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'MANUAL',
      preInternshipCommunication: '<p>Welcome! Please set up your development environment using our onboarding guide (shared via email). Complete the pre-read materials before Day 1 so you can hit the ground running.</p>',
      preReadCourses: [
        { title: 'Angular 19 Essentials', pdfUrl: null, orderIndex: 1 },
        { title: 'Node.js & Fastify Basics', pdfUrl: null, orderIndex: 2 },
      ],
      preReadArticles: [
        { title: 'How the Web Works — HTTP Deep Dive', pdfUrl: null, orderIndex: 1 },
        { title: 'Git Branching Strategy for Teams', pdfUrl: null, orderIndex: 2 },
      ],
      totalWeeks: 16,
      weeklySchedule: [
        { orderIndex: 1, numberOfWeeks: 4, functionalGroupName: 'Engineering', capabilityInstanceLabel: 'Fundamental Principles — L1', coordinatorName: 'Ananya Singh', focus: 'Onboarding, first features, code review culture' },
        { orderIndex: 2, numberOfWeeks: 8, functionalGroupName: 'Engineering', capabilityInstanceLabel: 'Operational Execution — L2', coordinatorName: 'Rohit Malhotra', focus: 'Independent feature development, PR ownership' },
        { orderIndex: 3, numberOfWeeks: 4, functionalGroupName: 'Engineering', capabilityInstanceLabel: 'System Understanding — L2', coordinatorName: 'Ananya Singh', focus: 'Final project, documentation, demo prep' },
      ],
      midTermFeedbackDate: new Date('2026-08-15'),
      finalSubmissionDocuments: [
        { type: 'PROJECT_REPORT', label: 'Final Project Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Live Demo + Slides', required: true },
      ],
      documentGuidelines: '<p>Submit your final project report (5-8 pages) covering: problem statement, technical approach, architecture diagram, and key learnings. Demo must include a working feature walkthrough.</p>',
      presentationRubricUrl: null,
      minPresentationScore: 55,
      presentationWeightage: 30,
      certificateTemplateUrl: null,
      createdBy: ananyaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000006', batchSize: 12, coordinatorUserId: ananyaId },
      ],
    },

    // System tenant (id=1) — Product Management Intern (DRAFT)
    {
      uuid: INT_SYS_PRODUCT_UUID,
      tenantId: systemTenantId,
      companyTenantId: tcsTenantId,
      title: 'Product Management Intern',
      vacancies: 4,
      cityId: mumbai?.id ?? null,
      stipend: 20000,
      durationMonths: 3,
      applicationDeadline: new Date('2026-07-15'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.DRAFT,
      functionalGroupId: systemFgProductId,
      internshipDetail: '<p>Work with our Product team to research user needs, define feature requirements, and collaborate with engineering and design to ship meaningful product improvements.</p>',
      roleOverview: '<p>As a Product Management Intern you will assist PMs in discovery, prioritisation, and delivery. You will write PRDs, run user interviews, and track sprint metrics.</p>',
      keyResponsibilities: null,
      eligibilityRequirements: null,
      timelineWorkSchedule: null,
      perksAndBenefits: null,
      selectionProcess: null,
      contactInformation: null,
      screeningQuestions: null,
      eligibilityCheck: null,
      assessments: null,
      interviewRubric: null,
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: null,
      preInternshipCommunication: null,
      preReadCourses: null,
      preReadArticles: null,
      totalWeeks: null,
      weeklySchedule: null,
      midTermFeedbackDate: null,
      finalSubmissionDocuments: null,
      documentGuidelines: null,
      presentationRubricUrl: null,
      minPresentationScore: null,
      presentationWeightage: null,
      certificateTemplateUrl: null,
      createdBy: rohitId,
      batches: [],
    },

    // TCS — Software Development Engineering Internship (PUBLISHED, full data)
    {
      uuid: INT_TCS_SDET_UUID,
      tenantId: tcsTenantId,
      companyTenantId: tcsTenantId,
      title: 'Software Development Engineering Intern',
      vacancies: 15,
      cityId: bangalore?.id ?? null,
      stipend: 25000,
      durationMonths: 6,
      applicationDeadline: new Date('2026-05-31'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: fgMap.get(FG_TCS_SOFTDEV_UUID) ?? null,
      // About
      internshipDetail: '<p>Join TCS as a Software Development Engineering Intern and work on real-world enterprise software projects. You will be embedded in cross-functional agile teams, contributing to production-grade features across our flagship platforms including TCS iON and TCS BaNCS.</p>',
      roleOverview: '<p>As a Software Development Engineering Intern, you will design, develop, and test software features under the guidance of senior engineers. You will participate in full sprint cycles, code reviews, and deployment pipelines.</p>',
      keyResponsibilities: '<ul><li>Develop and maintain backend services using Java/Spring Boot or Node.js</li><li>Write unit and integration tests to maintain code coverage above 80%</li><li>Participate in daily standups and sprint planning sessions</li><li>Collaborate with UX designers to implement frontend components in Angular or React</li><li>Document technical decisions and APIs using OpenAPI specifications</li></ul>',
      eligibilityRequirements: '<ul><li>Pursuing B.Tech / B.E. in Computer Science, IT, or related field (3rd or final year)</li><li>CGPA ≥ 7.0 or equivalent</li><li>Strong foundation in data structures, algorithms, and object-oriented programming</li><li>Familiarity with at least one backend language (Java, Python, Node.js)</li><li>Basic knowledge of SQL and REST APIs</li></ul>',
      timelineWorkSchedule: '<p><strong>Weeks 1–2:</strong> Onboarding, codebase orientation, and environment setup<br/><strong>Weeks 3–8:</strong> Feature development in assigned squad<br/><strong>Weeks 9–16:</strong> Independent feature ownership with code reviews<br/><strong>Weeks 17–24:</strong> Project completion, documentation, and final presentation</p>',
      perksAndBenefits: '<ul><li>Stipend of ₹25,000/month</li><li>Pre-placement offer (PPO) consideration for top performers</li><li>Access to TCS Learning Platform with 500+ courses</li><li>Mentorship from TCS Principal Engineers</li><li>Certificate of internship completion</li></ul>',
      selectionProcess: '<p><strong>Step 1:</strong> Application screening (resume + screening questions)<br/><strong>Step 2:</strong> Online technical assessment (90 mins)<br/><strong>Step 3:</strong> Technical interview with engineering panel<br/><strong>Step 4:</strong> HR discussion and offer</p>',
      contactInformation: '<p><strong>HR Contact:</strong> hr-internships@tcs.com<br/><strong>Technical Queries:</strong> tech-recruitment@tcs.com<br/><strong>Campus Coordinator:</strong> Priya Nair — priya.nair@tcs.com</p>',
      // Screening
      screeningQuestions: sampleScreeningQuestions,
      eligibilityCheck: sampleEligibilityCheck,
      assessments: sampleAssessments,
      interviewRubric: sampleInterviewRubric,
      // Selection
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'MANUAL',
      preInternshipCommunication: '<p>Congratulations on being selected! Before your start date, please complete the following pre-read materials and set up your development environment as outlined in the onboarding guide.</p>',
      preReadCourses: samplePreReadCourses,
      preReadArticles: samplePreReadArticles,
      // During
      totalWeeks: 24,
      weeklySchedule: sampleWeeklySchedule,
      midTermFeedbackDate: new Date('2026-09-15'),
      // Final submission
      finalSubmissionDocuments: sampleFinalSubmissionDocuments,
      documentGuidelines: '<p>All final submission documents must be submitted via the intern portal by the last working day. Ensure the internship report follows the TCS report template provided during onboarding. Presentations should be in PDF or PPTX format.</p>',
      presentationRubricUrl: null,
      minPresentationScore: 60,
      presentationWeightage: 30,
      certificateTemplateUrl: null,
      createdBy: priyaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000001', batchSize: 8, coordinatorUserId: priyaId },
        { uuid: 'a4000000-0000-0000-0000-000000000002', batchSize: 7, coordinatorUserId: divyaId },
      ],
    },

    // TCS — Cloud Engineering Internship (PUBLISHED, full data)
    {
      uuid: INT_TCS_CLOUD_UUID,
      tenantId: tcsTenantId,
      companyTenantId: tcsTenantId,
      title: 'Cloud Engineering Intern',
      vacancies: 10,
      cityId: hyderabad?.id ?? null,
      stipend: 22000,
      durationMonths: 3,
      applicationDeadline: new Date('2026-06-15'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: fgMap.get(FG_TCS_CLOUD_UUID) ?? null,
      internshipDetail: '<p>TCS Cloud Engineering Internship offers hands-on exposure to AWS, Azure, and GCP environments, working alongside our Cloud Center of Excellence team on live client infrastructure projects.</p>',
      roleOverview: '<p>You will assist in designing and managing cloud infrastructure, automating deployments, and monitoring cloud resources. You will work with Infrastructure-as-Code tools and container orchestration platforms.</p>',
      keyResponsibilities: '<ul><li>Assist in provisioning and managing cloud resources using Terraform and CloudFormation</li><li>Monitor cloud cost dashboards and flag optimization opportunities</li><li>Write automation scripts in Python/Bash for routine operational tasks</li><li>Support Kubernetes cluster management and container deployments</li><li>Document runbooks and infrastructure diagrams</li></ul>',
      eligibilityRequirements: '<ul><li>Pursuing B.Tech in CS/IT/ECE (final year preferred)</li><li>Exposure to any cloud platform (AWS/Azure/GCP)</li><li>Basic Linux command-line proficiency</li><li>Knowledge of networking fundamentals (DNS, HTTP, TCP/IP)</li></ul>',
      timelineWorkSchedule: '<p><strong>Weeks 1–2:</strong> Cloud platform orientation and sandbox access<br/><strong>Weeks 3–8:</strong> Infrastructure automation projects<br/><strong>Weeks 9–12:</strong> Live migration support and final project</p>',
      perksAndBenefits: '<ul><li>Stipend of ₹22,000/month</li><li>AWS/Azure certification voucher on completion</li><li>PPO consideration for outstanding interns</li><li>Mentorship by AWS Certified Solutions Architects</li></ul>',
      selectionProcess: '<p><strong>Step 1:</strong> Resume screening<br/><strong>Step 2:</strong> Cloud fundamentals online test<br/><strong>Step 3:</strong> Technical interview</p>',
      contactInformation: '<p><strong>Contact:</strong> cloud-campus@tcs.com<br/><strong>Coordinator:</strong> Divya Mehta — divya.mehta@tcs.com</p>',
      screeningQuestions: [
        { question: 'Which cloud platforms have you worked with?', expectedAnswer: 'Should mention specific cloud services used and context.' },
        { question: 'Explain the difference between IaaS, PaaS, and SaaS.', expectedAnswer: 'Should demonstrate conceptual understanding with examples.' },
      ],
      eligibilityCheck: { minClubPoints: 40, minProjects: 1, minInternships: 0, minClubCertification: 0 },
      assessments: [{ name: 'Cloud Fundamentals Assessment', pdfUrl: null, minScore: 60, weightage: 100 }],
      interviewRubric: { pdfUrl: null, minScore: 60, weightage: 100, criteria: ['Technical Knowledge', 'Problem Solving', 'Communication'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'MANUAL',
      preInternshipCommunication: '<p>Please complete the AWS Cloud Practitioner free tier training before Day 1. Setup your free AWS account and explore the EC2 and S3 services.</p>',
      preReadCourses: [{ title: 'AWS Cloud Practitioner Essentials', pdfUrl: null, orderIndex: 1 }],
      preReadArticles: [{ title: 'Introduction to Infrastructure as Code', pdfUrl: null, orderIndex: 1 }],
      totalWeeks: 12,
      weeklySchedule: [
        { orderIndex: 1, numberOfWeeks: 4, functionalGroupName: 'Cloud Engineering', capabilityInstanceLabel: 'System Understanding — L1', coordinatorName: 'Divya Mehta', focus: 'Cloud orientation, IaaS fundamentals, sandbox projects' },
        { orderIndex: 2, numberOfWeeks: 4, functionalGroupName: 'Cloud Engineering', capabilityInstanceLabel: 'Operational Execution — L2', coordinatorName: 'Divya Mehta', focus: 'Terraform scripts, CI/CD pipelines, Kubernetes basics' },
        { orderIndex: 3, numberOfWeeks: 4, functionalGroupName: 'Cloud Engineering', capabilityInstanceLabel: 'System Understanding — L2', coordinatorName: 'Divya Mehta', focus: 'Live project: cloud cost optimization and migration support' },
      ],
      midTermFeedbackDate: new Date('2026-08-01'),
      finalSubmissionDocuments: [
        { type: 'INTERNSHIP_REPORT', label: 'Cloud Project Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Architecture Presentation', required: true },
      ],
      documentGuidelines: '<p>Submit your final cloud project report including architecture diagrams, cost analysis, and lessons learned. Presentation should be 10–15 slides in PDF format.</p>',
      presentationRubricUrl: null,
      minPresentationScore: 55,
      presentationWeightage: 25,
      certificateTemplateUrl: null,
      createdBy: divyaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000003', batchSize: 10, coordinatorUserId: divyaId },
      ],
    },

    // TCS — Data Analytics Internship (DRAFT, partial data)
    {
      uuid: INT_TCS_DATA_UUID,
      tenantId: tcsTenantId,
      companyTenantId: tcsTenantId,
      title: 'Data Analytics Intern',
      vacancies: 8,
      cityId: bangalore?.id ?? null,
      stipend: 20000,
      durationMonths: 4,
      applicationDeadline: new Date('2026-07-31'),
      internshipType: InternshipType.REMOTE,
      status: InternshipStatus.DRAFT,
      functionalGroupId: fgMap.get(FG_TCS_SOFTDEV_UUID) ?? null,
      internshipDetail: '<p>Work with TCS Analytics team on real datasets to derive insights and build dashboards for enterprise clients. This remote internship is ideal for students passionate about data, statistics, and visualization.</p>',
      roleOverview: '<p>You will analyze large datasets, build predictive models, and create visual dashboards. You will work with senior data scientists and business analysts on client engagements.</p>',
      keyResponsibilities: null,
      eligibilityRequirements: null,
      timelineWorkSchedule: null,
      perksAndBenefits: null,
      selectionProcess: null,
      contactInformation: null,
      screeningQuestions: null,
      eligibilityCheck: null,
      assessments: null,
      interviewRubric: null,
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: null,
      preInternshipCommunication: null,
      preReadCourses: null,
      preReadArticles: null,
      totalWeeks: null,
      weeklySchedule: null,
      midTermFeedbackDate: null,
      finalSubmissionDocuments: null,
      documentGuidelines: null,
      presentationRubricUrl: null,
      minPresentationScore: null,
      presentationWeightage: null,
      certificateTemplateUrl: null,
      createdBy: ananyaId,
      batches: [],
    },

    // TechNova — AI/ML Internship (PUBLISHED, full data)
    {
      uuid: INT_NOVA_AI_UUID,
      tenantId: technovaTenantId,
      companyTenantId: technovaTenantId,
      title: 'AI/ML Research Intern',
      vacancies: 6,
      cityId: bangalore?.id ?? null,
      stipend: 30000,
      durationMonths: 6,
      applicationDeadline: new Date('2026-05-15'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: fgMap.get(FG_NOVA_AI_UUID) ?? null,
      internshipDetail: '<p>TechNova&apos;s AI/ML Internship places you at the forefront of applied artificial intelligence. You will work on NLP, computer vision, and predictive modelling projects that power TechNova&apos;s AI-driven product suite.</p>',
      roleOverview: '<p>As an AI/ML Research Intern, you will assist in designing machine learning pipelines, training models, evaluating performance, and deploying models to production via our MLOps infrastructure.</p>',
      keyResponsibilities: '<ul><li>Conduct exploratory data analysis and feature engineering</li><li>Train and fine-tune ML models using PyTorch or TensorFlow</li><li>Evaluate model performance using precision, recall, F1, and AUC metrics</li><li>Integrate models into REST API endpoints using FastAPI</li><li>Document experiments in MLflow and maintain reproducibility standards</li></ul>',
      eligibilityRequirements: '<ul><li>Pursuing M.Tech / M.S. or final year B.Tech in CS, AI, or Data Science</li><li>Strong Python programming skills</li><li>Experience with ML frameworks: scikit-learn, PyTorch, or TensorFlow</li><li>Familiarity with Jupyter notebooks and Git</li><li>CGPA ≥ 7.5 preferred</li></ul>',
      timelineWorkSchedule: '<p><strong>Month 1:</strong> Data exploration, literature review, problem scoping<br/><strong>Months 2–3:</strong> Model development and experimentation<br/><strong>Months 4–5:</strong> Model optimisation, MLOps integration<br/><strong>Month 6:</strong> Production deployment and final presentation</p>',
      perksAndBenefits: '<ul><li>Stipend of ₹30,000/month</li><li>Research publication co-authorship opportunity</li><li>PPO for top performers</li><li>GPU cloud credits for ML training</li><li>Access to TechNova&apos;s proprietary datasets</li></ul>',
      selectionProcess: '<p><strong>Round 1:</strong> Resume shortlisting<br/><strong>Round 2:</strong> ML take-home assignment (48 hrs)<br/><strong>Round 3:</strong> Technical interview — model design and ML system design<br/><strong>Round 4:</strong> Team fit discussion with AI lead</p>',
      contactInformation: '<p><strong>AI Recruitment:</strong> ai-campus@technova.in<br/><strong>Coordinator:</strong> Ananya Singh — ananya.singh@technova.in</p>',
      screeningQuestions: [
        { question: 'Describe a machine learning project you have completed end to end.', expectedAnswer: 'Should cover data collection, preprocessing, modelling, evaluation, and deployment.' },
        { question: 'What is the difference between bagging and boosting?', expectedAnswer: 'Bagging trains models in parallel on random subsets; boosting trains sequentially, each correcting previous errors.' },
        { question: 'How would you handle a highly imbalanced dataset?', expectedAnswer: 'Should mention resampling (SMOTE, undersampling), cost-sensitive learning, and appropriate evaluation metrics.' },
      ],
      eligibilityCheck: { minClubPoints: 75, minProjects: 3, minInternships: 0, minClubCertification: 1 },
      assessments: [
        { name: 'ML Foundations Test', pdfUrl: null, minScore: 70, weightage: 30 },
        { name: 'Take-Home ML Assignment', pdfUrl: null, minScore: 65, weightage: 70 },
      ],
      interviewRubric: { pdfUrl: null, minScore: 70, weightage: 100, criteria: ['Mathematical Foundations', 'ML Model Design', 'Coding Skills', 'Communication'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'AUTOMATED',
      preInternshipCommunication: '<p>Welcome to TechNova AI Labs! Before Day 1, please complete the pre-read materials below and set up your Python ML environment with the requirements file we will share via email.</p>',
      preReadCourses: [
        { title: 'Deep Learning Specialization — Coursera', pdfUrl: null, orderIndex: 1 },
        { title: 'MLOps Fundamentals', pdfUrl: null, orderIndex: 2 },
      ],
      preReadArticles: [
        { title: 'Attention Is All You Need — Transformer Architecture', pdfUrl: null, orderIndex: 1 },
        { title: 'A Survey of Transfer Learning in NLP', pdfUrl: null, orderIndex: 2 },
      ],
      totalWeeks: 24,
      weeklySchedule: [
        { orderIndex: 1, numberOfWeeks: 4, functionalGroupName: 'AI & Data Science', capabilityInstanceLabel: 'Fundamental Principles — L2', coordinatorName: 'Ananya Singh', focus: 'Data exploration, problem framing, baseline model' },
        { orderIndex: 2, numberOfWeeks: 8, functionalGroupName: 'AI & Data Science', capabilityInstanceLabel: 'Operational Execution — L3', coordinatorName: 'Rohit Malhotra', focus: 'Advanced model development, hyperparameter tuning, experiment tracking' },
        { orderIndex: 3, numberOfWeeks: 8, functionalGroupName: 'AI & Data Science', capabilityInstanceLabel: 'System Understanding — L3', coordinatorName: 'Ananya Singh', focus: 'MLOps pipeline, model deployment, A/B testing setup' },
        { orderIndex: 4, numberOfWeeks: 4, functionalGroupName: 'AI & Data Science', capabilityInstanceLabel: 'Root Cause Analysis — L2', coordinatorName: 'Ananya Singh', focus: 'Performance analysis, model fairness audit, final deliverables' },
      ],
      midTermFeedbackDate: new Date('2026-09-01'),
      finalSubmissionDocuments: [
        { type: 'RESEARCH_REPORT', label: 'ML Research Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Model Demo and Presentation', required: true },
        { type: 'CODE_REPOSITORY', label: 'Documented Code Repository Link', required: true },
      ],
      documentGuidelines: '<p>The final ML research report must include: problem statement, dataset description, methodology, results with statistical significance tests, limitations, and future work. Length: 8–12 pages in IEEE format.</p>',
      presentationRubricUrl: null,
      minPresentationScore: 70,
      presentationWeightage: 35,
      certificateTemplateUrl: null,
      createdBy: adityaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000004', batchSize: 6, coordinatorUserId: adityaId },
      ],
    },

    // TechNova — Cybersecurity Internship (ARCHIVED)
    {
      uuid: INT_NOVA_CYBER_UUID,
      tenantId: technovaTenantId,
      companyTenantId: technovaTenantId,
      title: 'Cybersecurity Analyst Intern',
      vacancies: 5,
      cityId: mumbai?.id ?? null,
      stipend: 28000,
      durationMonths: 3,
      applicationDeadline: new Date('2025-11-30'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.ARCHIVED,
      functionalGroupId: fgMap.get(FG_NOVA_CYBER_UUID) ?? null,
      internshipDetail: '<p>TechNova&apos;s Cybersecurity Internship exposes you to real-world security operations: threat monitoring, vulnerability assessments, and incident response — working alongside our SOC team.</p>',
      roleOverview: '<p>You will monitor security dashboards, conduct vulnerability scans, assist in penetration testing exercises, and document security findings. You will be embedded in TechNova&apos;s Security Operations Centre (SOC).</p>',
      keyResponsibilities: '<ul><li>Monitor SIEM dashboards (Splunk/QRadar) for anomalies and alerts</li><li>Run vulnerability scans using Nessus and document findings</li><li>Assist in incident triage and first-response procedures</li><li>Research emerging CVEs and prepare threat intelligence summaries</li></ul>',
      eligibilityRequirements: '<ul><li>B.Tech in CS/IT or pursuing CEH/CISSP certification</li><li>Familiarity with networking concepts and security tools</li><li>Basic knowledge of Linux and scripting (Python/Bash)</li></ul>',
      timelineWorkSchedule: '<p><strong>Weeks 1–2:</strong> SOC orientation and tool access<br/><strong>Weeks 3–8:</strong> Vulnerability assessments and threat monitoring<br/><strong>Weeks 9–12:</strong> Incident response and final report</p>',
      perksAndBenefits: '<ul><li>Stipend of ₹28,000/month</li><li>CEH exam voucher for top performers</li><li>Access to TechNova&apos;s threat intelligence platform</li></ul>',
      selectionProcess: '<p><strong>Round 1:</strong> Resume screening<br/><strong>Round 2:</strong> Security fundamentals MCQ test<br/><strong>Round 3:</strong> Technical interview</p>',
      contactInformation: '<p><strong>Contact:</strong> security-hr@technova.in</p>',
      screeningQuestions: [
        { question: 'What is the difference between symmetric and asymmetric encryption?', expectedAnswer: 'Symmetric uses the same key for encryption and decryption; asymmetric uses a public/private key pair.' },
        { question: 'Explain what a SQL injection attack is and how to prevent it.', expectedAnswer: 'Injecting SQL code via user inputs; prevented by parameterized queries and input sanitization.' },
      ],
      eligibilityCheck: { minClubPoints: 60, minProjects: 2, minInternships: 0, minClubCertification: 1 },
      assessments: [{ name: 'Security Fundamentals Test', pdfUrl: null, minScore: 65, weightage: 100 }],
      interviewRubric: { pdfUrl: null, minScore: 65, weightage: 100, criteria: ['Security Knowledge', 'Analytical Thinking', 'Communication'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'MANUAL',
      preInternshipCommunication: '<p>Please complete the TryHackMe beginner path before your start date and ensure your laptop has Kali Linux installed (VM is fine).</p>',
      preReadCourses: [{ title: 'TryHackMe — Pre-Security Path', pdfUrl: null, orderIndex: 1 }],
      preReadArticles: [{ title: 'OWASP Top 10 — 2024 Edition', pdfUrl: null, orderIndex: 1 }],
      totalWeeks: 12,
      weeklySchedule: [
        { orderIndex: 1, numberOfWeeks: 4, functionalGroupName: 'Cybersecurity', capabilityInstanceLabel: 'System Understanding — L2', coordinatorName: 'Rohit Malhotra', focus: 'SOC tools orientation and threat monitoring' },
        { orderIndex: 2, numberOfWeeks: 4, functionalGroupName: 'Cybersecurity', capabilityInstanceLabel: 'Fault Diagnosis — L2', coordinatorName: 'Rohit Malhotra', focus: 'Vulnerability assessment and penetration testing basics' },
        { orderIndex: 3, numberOfWeeks: 4, functionalGroupName: 'Cybersecurity', capabilityInstanceLabel: 'Root Cause Analysis — L1', coordinatorName: 'Rohit Malhotra', focus: 'Incident response simulation and final security report' },
      ],
      midTermFeedbackDate: new Date('2025-10-15'),
      finalSubmissionDocuments: [
        { type: 'SECURITY_ASSESSMENT_REPORT', label: 'Vulnerability Assessment Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Security Findings Presentation', required: true },
      ],
      documentGuidelines: '<p>The final security assessment report must follow the OWASP report template. All identified vulnerabilities must be classified by CVSS score and include remediation recommendations.</p>',
      presentationRubricUrl: null,
      minPresentationScore: 60,
      presentationWeightage: 30,
      certificateTemplateUrl: null,
      createdBy: rohitId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000005', batchSize: 5, coordinatorUserId: rohitId },
      ],
    },
    // HDFC Bank — Finance Technology Internship (PUBLISHED)
    ...(hdfcTenantId ? [{
      uuid: INT_HDFC_FINTECH_UUID,
      tenantId: systemTenantId,
      companyTenantId: hdfcTenantId,
      title: 'Finance Technology Intern',
      vacancies: 8,
      cityId: mumbai?.id ?? null,
      stipend: 22000,
      durationMonths: 3,
      applicationDeadline: new Date('2026-06-30'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: systemFgEngId,
      internshipDetail: '<p>Join HDFC Bank\'s FinTech team to build and modernize digital banking infrastructure. You will work on payment systems, API integrations, and data pipelines that serve millions of customers daily.</p>',
      roleOverview: '<p>As a FinTech Intern, you will contribute to backend services powering HDFC\'s digital banking platforms, including NetBanking, mobile apps, and merchant payment solutions.</p>',
      keyResponsibilities: '<ul><li>Develop REST APIs for banking transactions</li><li>Build data pipelines for fraud detection dashboards</li><li>Integrate with payment gateways (NPCI, UPI)</li><li>Write automated test suites for financial workflows</li></ul>',
      eligibilityRequirements: '<ul><li>B.Tech/B.E. in CS/IT (final year preferred)</li><li>Knowledge of Java or Python</li><li>Understanding of REST APIs and databases</li><li>Interest in financial systems and regulatory compliance</li></ul>',
      timelineWorkSchedule: null,
      perksAndBenefits: '<ul><li>Stipend of ₹22,000/month</li><li>Certificate of completion</li><li>Mentorship by senior banking technologists</li><li>PPO consideration for top performers</li></ul>',
      selectionProcess: '<p><strong>Step 1:</strong> Resume screening<br/><strong>Step 2:</strong> Online aptitude + coding test<br/><strong>Step 3:</strong> Technical interview</p>',
      contactInformation: '<p><strong>Contact:</strong> campus.recruitment@hdfcbank.com</p>',
      screeningQuestions: [
        { question: 'What do you know about UPI and how does a UPI transaction work?', expectedAnswer: 'Should describe the NPCI infrastructure, VPA addresses, and real-time settlement.' },
        { question: 'How would you secure a financial API endpoint?', expectedAnswer: 'Should mention OAuth2, rate limiting, input validation, TLS, and audit logging.' },
      ],
      eligibilityCheck: { minClubPoints: 40, minProjects: 1, minInternships: 0, minClubCertification: 0 },
      assessments: [{ name: 'Banking Technology Fundamentals', pdfUrl: null, minScore: 60, weightage: 100 }],
      interviewRubric: { pdfUrl: null, minScore: 60, weightage: 100, criteria: ['Technical Knowledge', 'Financial Domain', 'Communication'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'MANUAL',
      preInternshipCommunication: null,
      preReadCourses: [{ title: 'Introduction to Banking Technology', pdfUrl: null, orderIndex: 1 }],
      preReadArticles: [{ title: 'How UPI Works — NPCI Technical Overview', pdfUrl: null, orderIndex: 1 }],
      totalWeeks: 12,
      weeklySchedule: null,
      midTermFeedbackDate: new Date('2026-08-15'),
      finalSubmissionDocuments: [
        { type: 'PROJECT_REPORT', label: 'FinTech Project Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Demo Presentation', required: true },
      ],
      documentGuidelines: null,
      presentationRubricUrl: null,
      minPresentationScore: 55,
      presentationWeightage: 25,
      certificateTemplateUrl: null,
      createdBy: priyaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000007', batchSize: 8, coordinatorUserId: priyaId },
      ],
    }] : []),

    // Amazon — SDE/Cloud Internship (PUBLISHED)
    ...(amazonTenantId ? [{
      uuid: INT_AMAZON_SDE_UUID,
      tenantId: systemTenantId,
      companyTenantId: amazonTenantId,
      title: 'Software Development / Cloud Intern',
      vacancies: 10,
      cityId: hyderabad?.id ?? null,
      stipend: 40000,
      durationMonths: 3,
      applicationDeadline: new Date('2026-05-31'),
      internshipType: InternshipType.ONSITE,
      status: InternshipStatus.PUBLISHED,
      functionalGroupId: systemFgEngId,
      internshipDetail: '<p>Amazon SDE Internship offers a world-class engineering experience. You will be embedded in a product team, own a meaningful project end-to-end, and present your work to senior engineers at the end of your internship.</p>',
      roleOverview: '<p>As an SDE Intern, you will design and implement production-grade software features on AWS infrastructure, following Amazon\'s Leadership Principles and high engineering bar.</p>',
      keyResponsibilities: '<ul><li>Design and implement software features in Java or Python</li><li>Deploy services on AWS (Lambda, EC2, DynamoDB, S3)</li><li>Write comprehensive unit and integration tests</li><li>Participate in design reviews and code reviews</li><li>Present final project to engineering leadership</li></ul>',
      eligibilityRequirements: '<ul><li>B.Tech/M.Tech in CS or related field (final year)</li><li>Strong data structures and algorithms foundation</li><li>Proficiency in Java, Python, or C++</li><li>CGPA ≥ 8.0 preferred</li></ul>',
      timelineWorkSchedule: null,
      perksAndBenefits: '<ul><li>Stipend of ₹40,000/month</li><li>AWS credits for personal projects</li><li>Full-time return offer consideration</li><li>Mentorship by Amazon Senior SDEs</li></ul>',
      selectionProcess: '<p><strong>Round 1:</strong> Online DSA assessment (90 mins)<br/><strong>Round 2:</strong> Technical interview — coding + system design<br/><strong>Round 3:</strong> Bar raiser interview</p>',
      contactInformation: '<p><strong>Contact:</strong> university@amazon.com</p>',
      screeningQuestions: [
        { question: 'Describe a challenging technical problem you solved and how you approached it.', expectedAnswer: 'Should demonstrate structured problem-solving, technical depth, and measurable outcome.' },
      ],
      eligibilityCheck: { minClubPoints: 80, minProjects: 3, minInternships: 1, minClubCertification: 1 },
      assessments: [{ name: 'DSA Online Assessment', pdfUrl: null, minScore: 70, weightage: 100 }],
      interviewRubric: { pdfUrl: null, minScore: 75, weightage: 100, criteria: ['Problem Solving', 'Coding Quality', 'System Design', 'Leadership Principles'] },
      offerLetterTemplateUrl: null,
      termsConditionUrl: null,
      offerLetterReleaseMethod: 'AUTOMATED',
      preInternshipCommunication: null,
      preReadCourses: [{ title: 'AWS Cloud Practitioner Essentials', pdfUrl: null, orderIndex: 1 }],
      preReadArticles: [{ title: 'Amazon Leadership Principles — Deep Dive', pdfUrl: null, orderIndex: 1 }],
      totalWeeks: 12,
      weeklySchedule: null,
      midTermFeedbackDate: new Date('2026-08-01'),
      finalSubmissionDocuments: [
        { type: 'PROJECT_REPORT', label: 'Design Document + Implementation Report', required: true },
        { type: 'PROJECT_PRESENTATION', label: 'Final Demo to Engineering Team', required: true },
      ],
      documentGuidelines: null,
      presentationRubricUrl: null,
      minPresentationScore: 65,
      presentationWeightage: 30,
      certificateTemplateUrl: null,
      createdBy: ananyaId,
      batches: [
        { uuid: 'a4000000-0000-0000-0000-000000000008', batchSize: 10, coordinatorUserId: adityaId },
      ],
    }] : []),
  ];

  // ── Upsert internships + batches ──────────────────────────────────────────
  for (const def of internshipDefs) {
    const { batches, ...internshipData } = def;

    await prisma.internship.upsert({
      where: { publicUuid: def.uuid },
      update: {},
      create: {
        publicUuid: def.uuid,
        tenantId: internshipData.tenantId,
        companyTenantId: internshipData.companyTenantId ?? null,
        title: internshipData.title,
        vacancies: internshipData.vacancies,
        cityId: internshipData.cityId,
        stipend: internshipData.stipend,
        durationMonths: internshipData.durationMonths,
        applicationDeadline: internshipData.applicationDeadline,
        internshipType: internshipData.internshipType,
        status: internshipData.status,
        functionalGroupId: internshipData.functionalGroupId,
        // About
        internshipDetail: internshipData.internshipDetail,
        roleOverview: internshipData.roleOverview,
        keyResponsibilities: internshipData.keyResponsibilities,
        eligibilityRequirements: internshipData.eligibilityRequirements,
        timelineWorkSchedule: internshipData.timelineWorkSchedule,
        perksAndBenefits: internshipData.perksAndBenefits,
        selectionProcess: internshipData.selectionProcess,
        contactInformation: internshipData.contactInformation,
        // Screening
        screeningQuestions: internshipData.screeningQuestions ?? undefined,
        eligibilityCheck: internshipData.eligibilityCheck ?? undefined,
        assessments: internshipData.assessments ?? undefined,
        interviewRubric: internshipData.interviewRubric ?? undefined,
        // Selection
        offerLetterTemplateUrl: internshipData.offerLetterTemplateUrl,
        termsConditionUrl: internshipData.termsConditionUrl,
        offerLetterReleaseMethod: internshipData.offerLetterReleaseMethod,
        preInternshipCommunication: internshipData.preInternshipCommunication,
        preReadCourses: internshipData.preReadCourses ?? undefined,
        preReadArticles: internshipData.preReadArticles ?? undefined,
        // During
        totalWeeks: internshipData.totalWeeks,
        weeklySchedule: internshipData.weeklySchedule ?? undefined,
        midTermFeedbackDate: internshipData.midTermFeedbackDate,
        // Final
        finalSubmissionDocuments: internshipData.finalSubmissionDocuments ?? undefined,
        documentGuidelines: internshipData.documentGuidelines,
        presentationRubricUrl: internshipData.presentationRubricUrl,
        minPresentationScore: internshipData.minPresentationScore,
        presentationWeightage: internshipData.presentationWeightage,
        certificateTemplateUrl: internshipData.certificateTemplateUrl,
        createdBy: internshipData.createdBy,
      },
    });

    // Resolve internship BigInt ID for batch FK
    const internship = await prisma.internship.findUnique({
      where: { publicUuid: def.uuid },
      select: { id: true },
    });
    if (!internship) continue;

    for (const batch of batches) {
      await prisma.internshipBatch.upsert({
        where: { publicUuid: batch.uuid },
        update: {},
        create: {
          publicUuid: batch.uuid,
          internshipId: internship.id,
          batchSize: batch.batchSize,
          coordinatorUserId: batch.coordinatorUserId,
        },
      });
    }
  }

  console.log(`Internships seeded: ${internshipDefs.length} internships, ${internshipDefs.reduce((s, d) => s + d.batches.length, 0)} batches.`);
  console.log('Internship hiring seed completed successfully.');
}

seedInternshipHiring()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
