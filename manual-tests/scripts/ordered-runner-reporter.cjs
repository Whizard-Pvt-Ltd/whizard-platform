const fs = require('node:fs');
const path = require('node:path');

function flattenSuites(suite, list = []) {
  for (const child of suite.suites || []) flattenSuites(child, list);
  for (const spec of suite.specs || []) list.push(spec);
  return list;
}

function locationOf(test) {
  return test.location || test.parent?.location || null;
}

class OrderedRunnerReporter {
  constructor() {
    this.records = [];
    this.outputFile = process.env.ORDERED_REPORT_FILE || '';
    this.startedAt = Date.now();
  }

  onBegin(config, suite) {
    const total = typeof suite.allTests === 'function' ? suite.allTests().length : flattenSuites(suite).length;
    console.log(`[ordered-runner] Starting ${total} test(s)...`);
  }

  onTestBegin(test) {
    console.log(`[ordered-runner] RUN  ${test.title}`);
  }

  onTestEnd(test, result) {
    const seconds = ((result.duration || 0) / 1000).toFixed(1);
    const status = String(result.status || 'unknown').toUpperCase().padEnd(9);
    const errors = (result.errors || [])
      .map((error) => error?.message || error?.value || '')
      .filter(Boolean)
      .join(' | ')
      .replace(/\s+/g, ' ')
      .trim();

    this.records.push({
      title: test.title,
      location: locationOf(test),
      status: result.status,
      durationMs: result.duration || 0,
      details: errors,
    });

    console.log(`[ordered-runner] ${status} ${seconds}s  ${test.title}`);
    if (errors) {
      console.log(`[ordered-runner] note: ${errors}`);
    }
  }

  onEnd(result) {
    if (!this.outputFile) return;

    const payload = {
      kind: 'ordered-playwright-run',
      startedAt: this.startedAt,
      finishedAt: Date.now(),
      status: result.status,
      tests: this.records,
    };

    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, JSON.stringify(payload, null, 2));
    console.log(`[ordered-runner] wrote raw report -> ${this.outputFile}`);
  }
}

module.exports = OrderedRunnerReporter;
