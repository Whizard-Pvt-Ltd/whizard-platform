import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_USER = 'seed';
const SYSTEM_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

async function seedCollegeOperations(): Promise<void> {

  // ── System Tenant (for clubs & colleges) ─────────────────────────────────
  await prisma.tenant.upsert({
    where: { id: SYSTEM_TENANT_ID },
    update: {},
    create: { id: SYSTEM_TENANT_ID, name: 'System - College Operations', type: 'COLLEGE', isActive: true },
  });
  console.log('System tenant seeded.');

  // ── Cities ────────────────────────────────────────────────────────────────
  const cities = [
    { id: '94531aad-4763-47d7-ab16-df64c16375cd', name: 'Mumbai',        state: 'Maharashtra' },
    { id: '808741a2-6ab3-4154-80b1-c5c2b24dcdf0', name: 'Delhi',         state: 'Delhi' },
    { id: 'e9efee21-c405-42ab-974e-db31b0c53cbb', name: 'Bengaluru',     state: 'Karnataka' },
    { id: 'c833be91-8c46-43ad-9635-84a6cc780736', name: 'Hyderabad',     state: 'Telangana' },
    { id: 'df70c349-f1db-4049-99bb-92a22d402357', name: 'Chennai',       state: 'Tamil Nadu' },
    { id: '385e4c40-65f0-4001-a966-fa6ed4eff48f', name: 'Pune',          state: 'Maharashtra' },
    { id: '2dbd3833-5233-4e6b-9989-3a7cb8bdb74a', name: 'Kolkata',       state: 'West Bengal' },
    { id: '6f35ae51-8648-43c0-b093-39e77556e9ed', name: 'Ahmedabad',     state: 'Gujarat' },
    { id: 'c682843e-0607-4ce1-898d-37b3b7c62182', name: 'Jaipur',        state: 'Rajasthan' },
    { id: '16303308-bbf5-4c53-a522-4b0db56b5f63', name: 'Lucknow',       state: 'Uttar Pradesh' },
    { id: 'b356c9b7-6b4c-4fa1-95fe-7e114bbc42de', name: 'Chandigarh',    state: 'Punjab' },
    { id: '69967d0f-d964-4833-8798-6a54776de52b', name: 'Bhopal',        state: 'Madhya Pradesh' },
    { id: 'a0e37bb5-15d5-496b-acaf-d0d5c6f978cd', name: 'Indore',        state: 'Madhya Pradesh' },
    { id: 'b8498327-a44a-41c9-9ee8-861fdcebd6f7', name: 'Nagpur',        state: 'Maharashtra' },
    { id: '73db095e-88d5-4ac6-9229-cd96fa0ed582', name: 'Coimbatore',    state: 'Tamil Nadu' },
    { id: '166f1566-db10-4f43-bd35-19756d6bbb6f', name: 'Kochi',         state: 'Kerala' },
    { id: '639ebb65-6024-48a7-b0ae-52fa7785234b', name: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { id: '31e77755-dc7d-4d57-8924-7d85a173dc1e', name: 'Surat',         state: 'Gujarat' },
    { id: 'b84f8afe-101d-4f17-87bb-3cd1b61078f6', name: 'Patna',         state: 'Bihar' },
    { id: 'e6fa7b31-50bf-4b06-8dfd-35b36a26a321', name: 'Bhubaneswar',   state: 'Odisha' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: {},
      create: { ...city, isActive: true }
    });
  }
  console.log('Cities seeded.');

  // ── Clubs ─────────────────────────────────────────────────────────────────
  const clubs = [
    { id: '1608bf2f-4032-4617-8ba2-b8f8164c44fe', name: 'Coding Club',           description: 'Programming, competitive coding and open-source projects' },
    { id: '270de925-73b2-4727-b10c-c51329768d2a', name: 'Robotics Club',         description: 'AI, machines and robotics – build real-world projects' },
    { id: 'b5b7eea2-f44b-426a-89e9-86795de01731', name: 'Design Thinkers Hub',   description: 'A creative space for UX/UI designers and product thinkers' },
    { id: '0d0204b3-b198-476b-a379-1bad4829b97b', name: 'Solar Energy Club',     description: 'Sustainable environments, renewable and eco-friendly tech solutions' },
    { id: '2c3a0fae-a1ae-4012-8bdb-cd92a9005b43', name: 'Innovators Tech Club',  description: 'AI & ML technologies, algorithms and applications in the real world' },
    { id: 'baac97ba-a08d-456d-8523-8d46c122fd16', name: 'Debate Society',        description: 'Public speaking, argumentation and critical thinking' },
    { id: '666ecb05-42da-45c5-a5ad-de31d574679b', name: 'Entrepreneurship Cell', description: 'Startup ideation, funding and mentorship network' },
    { id: '740301da-b570-495f-a494-e03b723af503', name: 'Cultural Club',         description: 'Arts, music, dance and cultural events' },
    { id: '324fe597-d31e-4556-9fda-31612e6920de', name: 'Sports Club',           description: 'Inter-college sports tournaments and fitness activities' },
    { id: '95c16134-fb7d-4388-beaa-67781dad6042', name: 'NSS Unit',              description: 'National Service Scheme – community outreach and social work' },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: {},
      create: { ...club, tenantId: SYSTEM_TENANT_ID, isActive: true, createdBy: SEED_USER }
    });
  }
  console.log('Clubs seeded.');

  // ── Degree Programs + Specializations ────────────────────────────────────
  const programs = [
    {
      id: 'f1bfdd48-1464-4b05-9042-90439de27970', name: 'B.Tech', level: 'UG', durationYears: 4,
      specializations: [
        { id: '154874f3-9799-46da-b485-6339ea6cf6d8', name: 'Computer Science & Engineering' },
        { id: 'e5c2131f-88d5-4cce-8253-a10641cc690c', name: 'Artificial Intelligence & Machine Learning' },
        { id: '6ec69d21-23b7-44b5-afc5-615ca990f20a', name: 'Mechanical Engineering' },
        { id: 'c76ac88b-1eb0-4043-955c-15ded8e8d6d9', name: 'Civil Engineering' },
        { id: 'c18437cc-addc-4f50-95a7-139c59483d09', name: 'Electrical & Electronics Engineering' },
        { id: 'a557a1e9-3802-4da5-9a43-f3129c87a467', name: 'Information Technology' },
        { id: 'cf545d3d-a722-4872-bbcd-0fbc7bef6bb8', name: 'Chemical Engineering' },
      ]
    },
    {
      id: 'f31bba82-942a-41af-857c-47f687742dd1', name: 'M.Tech', level: 'PG', durationYears: 2,
      specializations: [
        { id: '29950ef8-82e2-4ebc-aa30-86bccc4d7eb0', name: 'Data Science & Analytics' },
        { id: '8806dd33-d2b7-44f0-9ec9-08c3bc6c0681', name: 'Robotics & Automation' },
        { id: '631ebe72-174f-4aae-ac4e-a35d1d9d5eeb', name: 'VLSI Design' },
        { id: 'c261b240-5a1b-4f99-a67c-173b3d26606c', name: 'Structural Engineering' },
      ]
    },
    {
      id: '1b273b5b-18ee-466b-9ea7-5ebc105e13d9', name: 'MBA', level: 'PG', durationYears: 2,
      specializations: [
        { id: 'ae624c79-14db-4145-9045-5eb5405e6501', name: 'Finance' },
        { id: 'f2a4acbb-cb7d-46eb-8d6e-cdb82b00fa6a', name: 'Marketing' },
        { id: '93fb5772-d5b2-4856-807b-d99c8a3a74b8', name: 'Human Resources' },
        { id: '4bef483d-8916-4dd1-a5ea-421ddc3914a8', name: 'Operations Management' },
      ]
    },
    {
      id: '570d0e6f-b548-44e2-8d09-c7f0276eb97a', name: 'Diploma', level: 'DIPLOMA', durationYears: 3,
      specializations: [
        { id: '79ae0ea5-3437-4f26-b9a9-4c31b96ed341', name: 'Embedded Systems' },
        { id: '2bb555ae-646e-4569-a63b-d540cafcee3f', name: 'IoT & Smart Technologies' },
        { id: '25f315cc-5a95-48d0-874c-1c77ed2cf90f', name: 'Civil Engineering' },
      ]
    },
    {
      id: '9bbd4b0d-dfd3-4f31-a957-419415fd909c', name: 'Ph.D', level: 'PHD', durationYears: null,
      specializations: [
        { id: '526aa557-246f-4de0-8b8b-9088d9efbc31', name: 'Computer Science' },
        { id: '3d0c3c6d-411c-4cb5-b083-44926da1e6b3', name: 'Physics' },
        { id: '5d1a4f63-fdeb-4ce7-ac28-ab1b02090f20', name: 'Chemistry' },
      ]
    },
  ];

  for (const prog of programs) {
    await prisma.degreeProgram.upsert({
      where: { id: prog.id },
      update: {},
      create: { id: prog.id, name: prog.name, level: prog.level, durationYears: prog.durationYears, isActive: true, createdBy: SEED_USER }
    });
    for (const spec of prog.specializations) {
      await prisma.programSpecialization.upsert({
        where: { id: spec.id },
        update: {},
        create: { id: spec.id, programId: prog.id, name: spec.name, isActive: true, createdBy: SEED_USER }
      });
    }
  }
  console.log('Degree programs and specializations seeded.');

  // ── College Contact Users ─────────────────────────────────────────────────
  const contactUsers = [
    { id: '0e64ef80-0885-4dfb-bb3a-914b74c29ac4', primaryLoginId: 'dr.vishwanath@college.in',  primaryEmail: 'dr.vishwanath@college.in',  role: 'VICE_CHANCELLOR' },
    { id: '1de69661-1178-4de8-bc03-45a3c8875042', primaryLoginId: 'dr.arvind@college.in',      primaryEmail: 'dr.arvind@college.in',      role: 'PLACEMENT_HEAD' },
    { id: '5da2d0d1-3bdf-44f1-95d8-1c37fa2fd99a', primaryLoginId: 'sneha.iyer@college.in',     primaryEmail: 'sneha.iyer@college.in',     role: 'COORDINATOR' },
    { id: '2c21d2e3-20b2-413f-abe3-ca9de909d3c6', primaryLoginId: 'priya.sharma@college.in',   primaryEmail: 'priya.sharma@college.in',   role: 'PLACEMENT_COORDINATOR' },
    { id: '5d1a4f63-fdeb-4ce7-ac28-ab1b02090f20', primaryLoginId: 'rajesh.nair@college.in',    primaryEmail: 'rajesh.nair@college.in',    role: 'GROOM_COORDINATOR' },
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
  console.log(`College contact users seeded (VICE_CHANCELLOR, PLACEMENT_HEAD, COORDINATOR, PLACEMENT_COORDINATOR, GROOM_COORDINATOR).`);

  console.log('College operations seed completed successfully.');
}

seedCollegeOperations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
