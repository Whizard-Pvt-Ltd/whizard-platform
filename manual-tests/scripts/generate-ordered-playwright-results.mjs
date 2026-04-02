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

function collectOrderedRunnerRows(report) {
  return (report.tests ?? []).map((test, index) => ({
    parsedCaseId: parseCaseId(test.title),
    hasExplicitCaseId: parseCaseId(test.title) !== test.title,
    order: parseCaseOrder(parseCaseId(test.title)),
    line: test.location?.line ?? Number.MAX_SAFE_INTEGER,
    title: test.title,
    status: mapRunnerStatus(test.status),
    durationMs: test.durationMs ?? 0,
    details: test.details ?? '',
    _index: index,
  }));
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

function mapRunnerStatus(status) {
  if (status === 'passed') return 'Passed';
  if (status === 'failed') return 'Failed';
  if (status === 'timedOut') return 'Timed Out';
  if (status === 'skipped') return 'Skipped';
  if (status === 'interrupted') return 'Interrupted';
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

function getLocation(spec) {
  const test = (spec.tests ?? [])[0];
  const result = (test?.results ?? [])[0];
  return test?.location ?? result?.location ?? spec.location ?? null;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function csvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(durationMs) {
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(1)} s`;
}

function classifyResult(row) {
  if (row.status === 'Passed') return 'Verified';
  if (row.status === 'Skipped') return 'Pending / Blocked';

  const signal = `${row.title} ${row.details}`.toLowerCase();
  if (
    /\/login|test_login_email|test_login_password|e-mail|password|tohaveurl\(\/\\\/dashboard|navigation.*interrupted|page\.goto|waiting for .*dashboard/i.test(signal)
    || /context.*closed|page.*closed|browser.*closed|net::err_|connection refused/i.test(signal)
  ) {
    return 'Environment / Auth Flake';
  }

  if (row.status === 'Timed Out' || row.status === 'Interrupted') {
    return 'Environment / Runtime Failure';
  }

  return 'Product Gap';
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(args.input ?? '');
const outputMd = path.resolve(args.outputMd ?? '');
const outputCsv = path.resolve(args.outputCsv ?? '');
const outputHtml = args.outputHtml ? path.resolve(args.outputHtml) : '';
const generatedPrefix = args.prefix ?? 'TC';
const rawTitle = args.title ?? 'Playwright Ordered Results';
const title = rawTitle.trim();
const displayTitle = title.length ? title : 'Playwright Ordered Results';

if (!inputPath || !outputMd || !outputCsv) {
  throw new Error('Usage: node generate-ordered-playwright-results.mjs --input <json> --outputMd <md> --outputCsv <csv> [--outputHtml <html>] [--prefix <id-prefix>] --title <title>');
}

const rawReport = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
const report = JSON.parse(rawReport);
const baseRows = report.kind === 'ordered-playwright-run'
  ? collectOrderedRunnerRows(report)
  : collectSpecs(report).map((spec) => {
    const parsedCaseId = parseCaseId(spec.title);
    const location = getLocation(spec);
    const line = location?.line ?? Number.MAX_SAFE_INTEGER;
    return {
      parsedCaseId,
      hasExplicitCaseId: parsedCaseId !== spec.title,
      order: parseCaseOrder(parsedCaseId),
      line,
      title: spec.title,
      status: getStatus(spec),
      durationMs: getDuration(spec),
      details: getFailureDetails(spec),
    };
  });

const rows = baseRows
  .sort((a, b) => a.order - b.order || a.line - b.line || a.title.localeCompare(b.title))
  .map((row, index) => ({
    ...row,
    caseId: row.hasExplicitCaseId ? row.parsedCaseId : `${generatedPrefix}-${String(index + 1).padStart(3, '0')}`,
    durationText: formatDuration(row.durationMs),
    classification: classifyResult(row),
  }));

fs.mkdirSync(path.dirname(outputMd), { recursive: true });
fs.mkdirSync(path.dirname(outputCsv), { recursive: true });
if (outputHtml) fs.mkdirSync(path.dirname(outputHtml), { recursive: true });

const markdown = [
  `# ${displayTitle}`,
  '',
  '| Test Case ID | Test Name | Status | Failure Type | Duration | Notes |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...rows.map((row) => `| ${escapeCell(row.caseId)} | ${escapeCell(row.title)} | ${escapeCell(row.status)} | ${escapeCell(row.classification)} | ${escapeCell(row.durationText)} | ${escapeCell(row.details)} |`),
  '',
].join('\n');

const csv = [
  'Test Case ID,Test Name,Status,Failure Type,Duration,Notes',
  ...rows.map((row) => [row.caseId, row.title, row.status, row.classification, row.durationText, row.details].map(csvCell).join(',')),
  '',
].join('\n');

const writeWarnings = [];

function tryWriteFile(targetPath, content) {
  try {
    fs.writeFileSync(targetPath, content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeWarnings.push(`${targetPath}: ${message}`);
  }
}

if (outputHtml) {
  const totals = rows.reduce((acc, row) => {
    acc.total += 1;
    if (row.status === 'Passed') acc.passed += 1;
    else if (row.status === 'Failed' || row.status === 'Timed Out' || row.status === 'Interrupted') acc.failed += 1;
    else if (row.status === 'Skipped') acc.skipped += 1;
    else acc.other += 1;
    return acc;
  }, { total: 0, passed: 0, failed: 0, skipped: 0, other: 0 });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(displayTitle)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1220;
      --panel: #132033;
      --panel-2: #1a2b43;
      --text: #edf4ff;
      --muted: #9bb0d1;
      --border: #30455f;
      --passed: #22c55e;
      --failed: #ef4444;
      --skipped: #eab308;
      --other: #60a5fa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Arial, sans-serif;
      background: linear-gradient(180deg, #08111f 0%, var(--bg) 100%);
      color: var(--text);
    }
    .wrap {
      max-width: 1240px;
      margin: 0 auto;
      padding: 28px 20px 40px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 30px;
      line-height: 1.2;
    }
    .subtitle {
      margin: 0 0 20px;
      color: var(--muted);
      font-size: 14px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 16px;
    }
    .stat-label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-value {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 700;
    }
    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--panel);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 980px;
    }
    th, td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(48, 69, 95, 0.7);
      vertical-align: top;
      text-align: left;
      font-size: 14px;
      line-height: 1.45;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--panel-2);
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    tr:last-child td { border-bottom: 0; }
    .main-row {
      cursor: pointer;
    }
    .main-row:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .case-id {
      white-space: nowrap;
      font-weight: 700;
      width: 120px;
    }
    .test-name {
      min-width: 420px;
      font-weight: 600;
    }
    .duration {
      white-space: nowrap;
      width: 110px;
    }
    .status {
      display: inline-block;
      min-width: 76px;
      text-align: center;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      border: 0;
      cursor: pointer;
    }
    .status-passed { color: var(--passed); background: rgba(34, 197, 94, 0.14); }
    .status-failed { color: var(--failed); background: rgba(239, 68, 68, 0.14); }
    .status-skipped { color: var(--skipped); background: rgba(234, 179, 8, 0.14); }
    .status-other { color: var(--other); background: rgba(96, 165, 250, 0.14); }
    .details-row {
      display: none;
    }
    .details-row.is-open {
      display: table-row;
    }
    .details-cell {
      background: rgba(9, 17, 30, 0.6);
      padding: 0;
    }
    .details-wrap {
      padding: 16px;
      display: grid;
      gap: 12px;
    }
    .detail-block {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(48, 69, 95, 0.65);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .detail-label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    .notes {
      color: var(--muted);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .source {
      color: var(--text);
      font-family: Consolas, "Courier New", monospace;
      font-size: 13px;
    }
    .classification {
      white-space: nowrap;
      width: 190px;
    }
    .type-pill {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
    }
    .type-verified { color: var(--passed); background: rgba(34, 197, 94, 0.14); }
    .type-pending { color: var(--skipped); background: rgba(234, 179, 8, 0.14); }
    .type-product { color: #fda4af; background: rgba(244, 63, 94, 0.16); }
    .type-env { color: #93c5fd; background: rgba(59, 130, 246, 0.16); }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(displayTitle)}</h1>
    <p class="subtitle">Custom point-wise ordered report generated from Playwright JSON output.</p>
    <div class="stats">
      <div class="stat"><div class="stat-label">Total</div><div class="stat-value">${totals.total}</div></div>
      <div class="stat"><div class="stat-label">Passed</div><div class="stat-value">${totals.passed}</div></div>
      <div class="stat"><div class="stat-label">Failed</div><div class="stat-value">${totals.failed}</div></div>
      <div class="stat"><div class="stat-label">Skipped</div><div class="stat-value">${totals.skipped}</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Test Case ID</th>
            <th>Test Name</th>
            <th>Status</th>
            <th>Failure Type</th>
            <th>Duration</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, index) => {
            const statusClass = row.status === 'Passed'
              ? 'status-passed'
              : row.status === 'Skipped'
                ? 'status-skipped'
                : row.status === 'Failed' || row.status === 'Timed Out' || row.status === 'Interrupted'
                  ? 'status-failed'
                  : 'status-other';
            const typeClass = row.classification === 'Verified'
              ? 'type-verified'
              : row.classification === 'Pending / Blocked'
                ? 'type-pending'
                : row.classification === 'Environment / Auth Flake' || row.classification === 'Environment / Runtime Failure'
                  ? 'type-env'
                  : 'type-product';
            const detailsId = `details-${index + 1}`;
            return `<tr class="main-row" data-target="${detailsId}">
              <td class="case-id">${escapeHtml(row.caseId)}</td>
              <td class="test-name">${escapeHtml(row.title)}</td>
              <td><button type="button" class="status ${statusClass}" data-target="${detailsId}">${escapeHtml(row.status)}</button></td>
              <td class="classification"><span class="type-pill ${typeClass}">${escapeHtml(row.classification)}</span></td>
              <td class="duration">${escapeHtml(row.durationText)}</td>
              <td>${row.details ? 'Click row or status' : 'No extra details'}</td>
            </tr>
            <tr id="${detailsId}" class="details-row">
              <td colspan="6" class="details-cell">
                <div class="details-wrap">
                  <div class="detail-block">
                    <div class="detail-label">Source</div>
                    <div class="source">${escapeHtml(row.title)}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">Failure Type</div>
                    <div class="notes">${escapeHtml(row.classification)}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">Failure / Notes</div>
                    <div class="notes">${escapeHtml(row.details || 'No additional failure details for this test.')}</div>
                  </div>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <script>
    const toggle = (id) => {
      const row = document.getElementById(id);
      if (!row) return;
      row.classList.toggle('is-open');
    };
    document.querySelectorAll('.main-row').forEach((row) => {
      row.addEventListener('click', () => toggle(row.dataset.target));
    });
    document.querySelectorAll('.status').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        toggle(button.dataset.target);
      });
    });
  </script>
</body>
</html>`;

  tryWriteFile(outputHtml, html);
}

tryWriteFile(outputMd, markdown);
tryWriteFile(outputCsv, csv);

console.log(`Processed ${rows.length} ordered results.`);
console.log(`Attempted outputs: ${outputMd}, ${outputCsv}${outputHtml ? `, ${outputHtml}` : ''}`);

if (writeWarnings.length) {
  for (const warning of writeWarnings) {
    console.warn(`Warning: could not write ${warning}`);
  }
}
