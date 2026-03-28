import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    args[key] = value;
  }
  return args;
}

function collectSpecs(node, list = []) {
  if (!node) return list;
  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) list.push(spec);
  }
  if (Array.isArray(node.suites)) {
    for (const suite of node.suites) collectSpecs(suite, list);
  }
  return list;
}

function getStatus(spec) {
  const tests = spec.tests ?? [];
  const results = tests.flatMap((test) => test.results ?? []);
  if (results.some((result) => result.status === 'failed')) return 'Failed';
  if (results.some((result) => result.status === 'timedOut')) return 'Timed Out';
  if (results.some((result) => result.status === 'skipped')) return 'Skipped';
  if (results.some((result) => result.status === 'interrupted')) return 'Interrupted';
  if (results.some((result) => result.status === 'passed')) return 'Passed';
  return 'Unknown';
}

function getFailureDetails(spec) {
  const tests = spec.tests ?? [];
  for (const test of tests) {
    for (const result of test.results ?? []) {
      if ((result.status === 'failed' || result.status === 'timedOut') && Array.isArray(result.errors) && result.errors.length) {
        return result.errors
          .map((error) => error.message || error.value || '')
          .filter(Boolean)
          .join(' | ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
  }
  return '';
}

function getDuration(spec) {
  const tests = spec.tests ?? [];
  const durations = tests.flatMap((test) => (test.results ?? []).map((result) => result.duration ?? 0));
  return durations.length ? Math.max(...durations) : 0;
}

function parseCaseId(title) {
  const match = title.match(/([A-Z]+-E2E-\d+)/);
  return match ? match[1] : title;
}

function parseCaseOrder(caseId) {
  const match = caseId.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function csvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(args.input ?? '');
const outputMd = path.resolve(args.outputMd ?? '');
const outputCsv = path.resolve(args.outputCsv ?? '');
const title = args.title ?? 'Playwright Ordered Results';

if (!inputPath || !outputMd || !outputCsv) {
  throw new Error('Usage: node generate-ordered-playwright-results.mjs --input <json> --outputMd <md> --outputCsv <csv> --title <title>');
}

const rawReport = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
const report = JSON.parse(rawReport);
const specs = collectSpecs(report);

const rows = specs
  .map((spec) => {
    const caseId = parseCaseId(spec.title);
    return {
      caseId,
      order: parseCaseOrder(caseId),
      title: spec.title,
      status: getStatus(spec),
      durationMs: getDuration(spec),
      details: getFailureDetails(spec),
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

fs.mkdirSync(path.dirname(outputMd), { recursive: true });
fs.mkdirSync(path.dirname(outputCsv), { recursive: true });

const markdown = [
  `# ${title}`,
  '',
  '| Test Case ID | Test Name | Status | Duration (ms) | Notes |',
  '| --- | --- | --- | ---: | --- |',
  ...rows.map((row) => `| ${escapeCell(row.caseId)} | ${escapeCell(row.title)} | ${escapeCell(row.status)} | ${row.durationMs} | ${escapeCell(row.details)} |`),
  '',
].join('\n');

const csv = [
  'Test Case ID,Test Name,Status,Duration (ms),Notes',
  ...rows.map((row) => [row.caseId, row.title, row.status, row.durationMs, row.details].map(csvCell).join(',')),
  '',
].join('\n');

fs.writeFileSync(outputMd, markdown);
fs.writeFileSync(outputCsv, csv);

console.log(`Wrote ${rows.length} ordered results to ${outputMd} and ${outputCsv}`);
