import { execSync } from 'child_process';
import path from 'path';

const seeds = [
  'wrcf-reference.seed.ts',
  'company-organization.seed.ts',
  'college-operations.seed.ts',
  'internship-hiring.seed.ts',
];

const seedsDir = path.resolve(__dirname);

for (const seed of seeds) {
  const seedPath = path.join(seedsDir, seed);
  console.log(`\n▶ Running ${seed}...`);
  execSync(`tsx ${seedPath}`, { stdio: 'inherit' });
  console.log(`✓ ${seed} completed.`);
}

console.log('\n✅ All seeds completed successfully.');
