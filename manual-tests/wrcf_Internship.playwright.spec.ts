import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';

async function assertServiceAvailable(url: string, label: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${label} responded with HTTP ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} is not ready at ${url}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function assertLocalServicesReady(): Promise<void> {
  await assertServiceAvailable(`${appUrl}/login`, 'Frontend login');
  await assertServiceAvailable('http://localhost:3000', 'BFF');
  await assertServiceAvailable('http://localhost:3001', 'Core API');
}

async function openClosestRuntimeSurface(page: Page): Promise<void> {
  await page.goto(`${appUrl}/login`, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true }).or(page.getByRole('heading', { name: /dashboard/i })),
  ).toBeVisible({ timeout: 15000 });
}

function futureInternshipBlocker(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @internship ${title}`, async ({ page }) => {
    await openClosestRuntimeSurface(page);
    throw new Error(reason);
  });
}

test.describe('Internship sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await assertLocalServicesReady();
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test.beforeEach(async () => {
    await openClosestRuntimeSurface(page);
  });

  futureInternshipBlocker(
    'INT-E2E-001',
    'Manage Internship screen loads',
    'Internship SRS defines a Manage Internship module, but the current live admin runtime does not expose an Internship page or route.'
  );
  futureInternshipBlocker(
    'INT-E2E-002',
    'HR can open Create Internship and view required sections',
    'The current live admin runtime does not expose a Create Internship entry point or internship form surface.'
  );
  futureInternshipBlocker(
    'INT-E2E-003',
    'internship supports base fields such as title, description, role overview, responsibilities, timeline, work schedule, benefits, and selection process',
    'The Internship create/edit form described in the SRS is not implemented in the current live admin runtime.'
  );
  futureInternshipBlocker(
    'INT-E2E-004',
    'internship can link to predefined role competency and capability instances',
    'The live runtime does not expose internship creation or the role-competency linkage screen described by FR-3.'
  );
  futureInternshipBlocker(
    'INT-E2E-005',
    'internship supports Draft to Published transition',
    'The live runtime does not expose an Internship entity with Draft and Published states.'
  );
  futureInternshipBlocker(
    'INT-E2E-006',
    'HR can define screening eligibility criteria and questionnaire',
    'The live runtime does not expose the Screening Criteria screen described in the Internship SRS.'
  );
  futureInternshipBlocker(
    'INT-E2E-007',
    'system shows eligible candidate count after applying screening criteria',
    'The live runtime does not expose internship screening criteria or eligible-candidate count output.'
  );
  futureInternshipBlocker(
    'INT-E2E-008',
    'internship supports assessment attachment, minimum score, and weightage configuration',
    'The live runtime does not expose the Internship Assessment configuration described by FR-9 through FR-11.'
  );
  futureInternshipBlocker(
    'INT-E2E-009',
    'interview rubric, panel creation, and schedule generation are supported',
    'The live runtime does not expose the Internship interview configuration and scheduling screens.'
  );
  futureInternshipBlocker(
    'INT-E2E-010',
    'final selection score uses configured assessment and interview weightage',
    'The live runtime does not expose the Final Selection screen or the weighted-score computation flow for internships.'
  );
  futureInternshipBlocker(
    'INT-E2E-011',
    'HR can override selection manually',
    'The live runtime does not expose the Final Selection override workflow for internships.'
  );
  futureInternshipBlocker(
    'INT-E2E-012',
    'system can generate offer letter and track acceptance',
    'The live runtime does not expose the Internship Offer module described in the SRS.'
  );
  futureInternshipBlocker(
    'INT-E2E-013',
    'internship role maps to FG, PWO, and capability instances',
    'The live runtime does not expose the Internship Execution setup that maps a role to WRCF structures.'
  );
  futureInternshipBlocker(
    'INT-E2E-014',
    'system auto-loads skills and tasks associated with capability instances',
    'The live runtime does not expose the internship execution surface that auto-loads skills and tasks from capability instances.'
  );
  futureInternshipBlocker(
    'INT-E2E-015',
    'student can upload evidence and mentor can approve or reject it',
    'The live runtime does not expose the During Internship validation workflow described in FR-23 through FR-25.'
  );
  futureInternshipBlocker(
    'INT-E2E-016',
    'student submits weekly reflection and mentor provides weekly feedback',
    'The live runtime does not expose the Weekly Schedule workflow described in FR-26 and FR-27.'
  );
  futureInternshipBlocker(
    'INT-E2E-017',
    'system auto-generates internship logbook with weekly tasks, validation, feedback, and skill progress',
    'The live runtime does not expose the Internship Logbook screen or generated logbook workflow described by FR-28 through FR-30.'
  );
  futureInternshipBlocker(
    'INT-E2E-018',
    'system supports scheduling and recording mid-term review remarks',
    'The live runtime does not expose the mid-term review scheduling and remarks workflow for internships.'
  );
  futureInternshipBlocker(
    'INT-E2E-019',
    'system verifies required skills, captures final report and rating, issues certificate, and updates club points',
    'The live runtime does not expose the internship completion and certification workflow described in FR-33 through FR-39.'
  );
});
