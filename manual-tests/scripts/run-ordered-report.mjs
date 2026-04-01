import { spawn } from 'node:child_process';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      args[key] = value;
    } else if (!args._) {
      args._ = [arg];
    } else {
      args._.push(arg);
    }
  }
  return args;
}

const suites = {
  dashboard: {
    spec: 'manual-tests/wrcf-dashboard.playwright.spec.ts',
    base: 'manual-tests/results/wrcf-dashboard',
    title: 'WRCF Dashboard Ordered Results',
    prefix: 'WD',
  },
  'manage-wrcf': {
    spec: 'manual-tests/wrcf-manage-wrcf.playwright.spec.ts',
    base: 'manual-tests/results/wrcf-manage-wrcf',
    title: 'Manage WRCF Ordered Results',
    prefix: 'MW',
  },
  'functional-group': {
    spec: 'manual-tests/wrcf_Functional_Group.playwright.spec.ts',
    base: 'manual-tests/results/wrcf-functional-group',
    title: 'WRCF Functional Group Ordered Results',
    prefix: 'FG',
  },
};

const args = parseArgs(process.argv.slice(2));
const key = args._?.[0];

if (!key || !suites[key]) {
  throw new Error(`Usage: node manual-tests/scripts/run-ordered-report.mjs <dashboard|manage-wrcf|functional-group>`);
}

const suite = suites[key];
const cwd = process.cwd();
const rawJson = path.join(cwd, `${suite.base}-report.json`);
const outputMd = path.join(cwd, `${suite.base}-results.md`);
const outputCsv = path.join(cwd, `${suite.base}-results.csv`);
const outputHtml = path.join(cwd, `${suite.base}-results.html`);
const reporterPath = path.join(cwd, 'manual-tests', 'scripts', 'ordered-runner-reporter.cjs');
const generatorPath = path.join(cwd, 'manual-tests', 'scripts', 'generate-ordered-playwright-results.mjs');

function run(command, commandArgs, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd,
      env,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const runnerCode = await run(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', suite.spec, `--reporter=${reporterPath}`],
  { ...process.env, ORDERED_REPORT_FILE: rawJson }
);

const generatorCode = await run(
  process.platform === 'win32' ? 'node.exe' : 'node',
  [
    generatorPath,
    '--input', rawJson,
    '--outputMd', outputMd,
    '--outputCsv', outputCsv,
    '--outputHtml', outputHtml,
    '--prefix', suite.prefix,
    '--title', suite.title,
  ]
);

console.log(`[ordered-runner] html -> ${outputHtml}`);
console.log(`[ordered-runner] markdown -> ${outputMd}`);
console.log(`[ordered-runner] csv -> ${outputCsv}`);

process.exit(runnerCode !== 0 ? runnerCode : generatorCode);
