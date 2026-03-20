import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWrcfReference(): Promise<void> {
  // Sectors
  const manufacturing = await prisma.industrySector.upsert({
    where: { id: 'sector-manufacturing' },
    update: {},
    create: { id: 'sector-manufacturing', name: 'Manufacturing', isActive: true }
  });

  const energy = await prisma.industrySector.upsert({
    where: { id: 'sector-energy' },
    update: {},
    create: { id: 'sector-energy', name: 'Energy & Utilities', isActive: true }
  });

  // Industries
  await prisma.industry.upsert({
    where: { id: 'industry-thermal' },
    update: {},
    create: { id: 'industry-thermal', sectorId: energy.id, name: 'Thermal Power Plant', isActive: true }
  });

  await prisma.industry.upsert({
    where: { id: 'industry-steel' },
    update: {},
    create: { id: 'industry-steel', sectorId: manufacturing.id, name: 'Steel Manufacturing', isActive: true }
  });

  await prisma.industry.upsert({
    where: { id: 'industry-wind' },
    update: {},
    create: { id: 'industry-wind', sectorId: energy.id, name: 'Wind Energy', isActive: true }
  });

  // Capabilities
  const capabilities = [
    { id: 'cap-01', code: 'CAP-01', name: 'Fundamental Principles', type: 'Cognitive' },
    { id: 'cap-02', code: 'CAP-02', name: 'System Understanding', type: 'Cognitive' },
    { id: 'cap-03', code: 'CAP-03', name: 'Operational Execution', type: 'Execution' },
    { id: 'cap-04', code: 'CAP-04', name: 'Routine Maintenance', type: 'Execution' },
    { id: 'cap-05', code: 'CAP-05', name: 'Fault Diagnosis', type: 'Diagnostic' },
    { id: 'cap-06', code: 'CAP-06', name: 'Root Cause Analysis', type: 'Diagnostic' },
    { id: 'cap-07', code: 'CAP-07', name: 'First Response Resolution', type: 'Execution' },
  ] as const;

  for (const cap of capabilities) {
    await prisma.capability.upsert({
      where: { code: cap.code },
      update: {},
      create: { id: cap.id, code: cap.code, name: cap.name, type: cap.type, isActive: true }
    });
  }

  // Proficiency levels
  const proficiencies = [
    { id: 'prof-l1', level: 1, label: 'Plant Awareness', description: 'Basic awareness of plant systems', independenceLevel: 'Supervised' },
    { id: 'prof-l2', level: 2, label: 'Assisted Execution', description: 'Can execute tasks with assistance', independenceLevel: 'Assisted' },
    { id: 'prof-l3a', level: 3, label: 'Conditional Independence Supervised', description: 'Can work independently under supervision', independenceLevel: 'Conditional' },
    { id: 'prof-l3b', level: 4, label: 'Conditional Independence Scoped', description: 'Independent within defined scope', independenceLevel: 'Scoped' },
    { id: 'prof-l4', level: 5, label: 'Full Independence', description: 'Fully independent operation', independenceLevel: 'Full' },
  ];

  for (const prof of proficiencies) {
    await prisma.proficiency.upsert({
      where: { id: prof.id },
      update: {},
      create: prof
    });
  }

  console.log('WRCF reference data seeded successfully.');
}

seedWrcfReference()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
