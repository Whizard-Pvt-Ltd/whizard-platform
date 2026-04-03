import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-college-sheet.json');

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

async function interactiveLogin(page: Page): Promise<void> {
  if (!loginEmail || !loginPassword) {
    throw new Error('TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');
  }

  await page.goto(`${appUrl}/login`);
  await page.getByLabel('E-mail').fill(loginEmail);
  await page.getByLabel('Password').fill(loginPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

async function ensureAuthenticatedPage(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  if (fs.existsSync(authStatePath)) {
    const context = await browser.newContext({ storageState: authStatePath });
    const page = await context.newPage();
    await page.goto(`${appUrl}/dashboard`);

    if (/\/dashboard/.test(page.url())) {
      return { context, page };
    }

    await context.close();
  }

  fs.mkdirSync(authDir, { recursive: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await interactiveLogin(page);
  await context.storageState({ path: authStatePath });
  return { context, page };
}

function listPanel(page: Page): Locator {
  return page.locator('.w-\\[260px\\]').first();
}

function collegeButtons(page: Page): Locator {
  return listPanel(page).locator('button');
}

function saveButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Save' }).first();
}

function publishButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Sent to publish' }).first();
}

function collegeDescriptionEditor(page: Page): Locator {
  return page.locator('.ql-editor').first();
}

function futureCollegeBlocker(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @college ${title}`, async ({ page }) => {
    await openCollegePage(page);
    throw new Error(reason);
  });
}

async function openCollegePage(page: Page): Promise<void> {
  await page.goto(`${appUrl}/manage-college`, { waitUntil: 'domcontentloaded' });

  if (/\/login/.test(page.url())) {
    await interactiveLogin(page);
    if (!/\/manage-college/.test(page.url())) {
      await page.goto(`${appUrl}/manage-college`, { waitUntil: 'domcontentloaded' });
    }
  }

  await expect(page).toHaveURL(/\/manage-college/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Manage College' })).toBeVisible({ timeout: 15000 });
}

async function selectAnotherCollege(page: Page): Promise<{ before: string; after: string }> {
  const buttons = collegeButtons(page);
  const count = await buttons.count();
  if (count < 2) {
    throw new Error('Need at least two colleges to validate list selection behavior.');
  }

  const before = ((await page.locator('h2').first().textContent()) || '').trim();
  await buttons.nth(1).click();
  await expect.poll(async () => ((await page.locator('h2').first().textContent()) || '').trim()).not.toBe(before);
  const after = ((await page.locator('h2').first().textContent()) || '').trim();
  return { before, after };
}

async function selectCollegeWithExpandableAbout(page: Page): Promise<void> {
  const buttons = collegeButtons(page);
  const count = await buttons.count();

  for (let i = 0; i < count; i += 1) {
    await buttons.nth(i).click();
    const toggle = page.getByRole('button', { name: /see more|see less/i }).first();
    if (await toggle.isVisible().catch(() => false)) {
      return;
    }
  }

  throw new Error('No listed college exposed expandable About content in the live runtime.');
}

async function clickAddCollege(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByPlaceholder('Enter college name')).toBeVisible();
}

async function openCollegeTypeSelect(page: Page): Promise<void> {
  const trigger = page.locator('mat-select[formcontrolname=\"collegeType\"]').first();
  await expect(trigger).toBeVisible();
  await trigger.click();
}

async function chooseCollegeType(page: Page, label: string): Promise<void> {
  await openCollegeTypeSelect(page);
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function fillCollegeDescription(page: Page, text: string): Promise<void> {
  const editor = collegeDescriptionEditor(page);
  await expect(editor).toBeVisible();
  await editor.click();
  await editor.fill('');
  await editor.type(text);
}

async function createCollege(page: Page, suffix: string): Promise<void> {
  const beforeCount = await collegeButtons(page).count();
  await clickAddCollege(page);
  await page.getByPlaceholder('Enter college name').fill(`College ${suffix}`);
  await page.getByPlaceholder('Enter university name').fill(`University ${suffix}`);
  await chooseCollegeType(page, 'Private');

  const createResponsePromise = page.waitForResponse(
    response => response.url().includes('/colleges') && response.request().method() === 'POST',
    { timeout: 5000 },
  ).catch(() => null);

  await saveButton(page).click({ force: true });

  const createResponse = await createResponsePromise;
  if (createResponse && !createResponse.ok()) {
    let details = `${createResponse.status()} ${createResponse.statusText()}`;
    try {
      const body = await createResponse.text();
      if (body) {
        details = `${details} - ${body}`;
      }
    } catch {
      // Ignore response body parsing issues; status text is still useful.
    }
    throw new Error(`Create College request failed: ${details}`);
  }

  await expect(page.getByRole('heading', { name: 'Manage College' })).toBeVisible();
  await expect.poll(async () => collegeButtons(page).count(), {
    timeout: 15000,
    message: 'Waiting for created college to appear in Manage College list',
  }).toBeGreaterThan(beforeCount);
}

async function ensureCollegeCount(page: Page, minimum: number): Promise<void> {
  let count = await collegeButtons(page).count();
  let created = 0;

  while (count < minimum) {
    await createCollege(page, `${Date.now()}-${created}`);
    created += 1;
    count = await collegeButtons(page).count();
  }
}

test.describe('College sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await assertLocalServicesReady();
    ({ context, page } = await ensureAuthenticatedPage(browser));
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test.beforeEach(async () => {
    await openCollegePage(page);
  });

  test('COL-E2E-001 @stable @p0 @college Manage College loads with list and selected college detail', async () => {
    await ensureCollegeCount(page, 1);
    await expect(page.getByRole('heading', { name: 'Manage College' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.getByText(/College Id :/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('COL-E2E-002 @stable @p1 @college college cards show name, logo or initial, location, year, and type', async () => {
    await ensureCollegeCount(page, 1);
    const firstCard = collegeButtons(page).first();
    await expect(firstCard).toContainText('College Id :');
    await expect(firstCard.locator('img, div.rounded-full').first()).toBeVisible();
    await expect(firstCard).toContainText(/India|\d{4}|Private|Public|Deemed|Autonomous/);
  });

  test('COL-E2E-003 @stable @p1 @college user can search by college name', async () => {
    await ensureCollegeCount(page, 1);
    const search = page.getByPlaceholder('Search for college...');
    const initialCount = await collegeButtons(page).count();
    expect(initialCount).toBeGreaterThan(0);

    await search.fill('zzzz-unmatched-college');
    await expect(listPanel(page).getByText('No colleges found')).toBeVisible();

    await search.fill('');
    await expect.poll(async () => collegeButtons(page).count()).toBe(initialCount);
  });

  test('COL-E2E-004 @stable @p0 @college clicking a college loads details and changes selected item', async () => {
    await ensureCollegeCount(page, 2);
    const { before, after } = await selectAnotherCollege(page);
    expect(before).not.toBe(after);
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('COL-E2E-006 @stable @p0 @college Add opens Create College mode', async () => {
    await clickAddCollege(page);
    await expect(page.getByText('College Details').first()).toBeVisible();
    await expect(page.getByPlaceholder('Enter college name')).toBeVisible();
  });

  test('COL-E2E-007 @stable @p0 @college Edit opens Edit College mode with prefilled data', async () => {
    await ensureCollegeCount(page, 1);
    const selectedName = ((await page.locator('h2').first().textContent()) || '').trim();
    expect(selectedName).toBeTruthy();
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByPlaceholder('Enter college name')).toHaveValue(selectedName);
  });

  test('COL-E2E-008 @stable @p0 @college Name is mandatory while saving college', async () => {
    await clickAddCollege(page);
    await expect(saveButton(page)).toBeVisible();
    await saveButton(page).click({ force: true });
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('COL-E2E-009 @stable @p1 @college Preview opens the rendered college preview and Back returns to form', async () => {
    await ensureCollegeCount(page, 1);
    const selectedName = ((await page.locator('h2').first().textContent()) || '').trim();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByText('Preview Mode')).toBeVisible();
    await expect(page.getByRole('heading', { name: selectedName })).toBeVisible();
    await page.getByRole('button', { name: 'Back to Edit' }).click();
    await expect(page.getByPlaceholder('Enter college name')).toBeVisible();
  });

  test('COL-E2E-010 @stable @p1 @college Send to publish is enabled only when the college form is valid', async () => {
    await clickAddCollege(page);
    await expect(publishButton(page)).toBeDisabled();
    await page.getByPlaceholder('Enter college name').fill(`College ${Date.now()}`);
    await page.getByPlaceholder('Enter university name').fill('Demo University');
    await chooseCollegeType(page, 'Private');
    await fillCollegeDescription(page, 'College profile for publish validation.');
    await expect(publishButton(page)).toBeEnabled();
  });

  futureCollegeBlocker(
    'COL-E2E-005',
    'About College is collapsed by default and expands with See More',
    'This case needs a deterministic college record with long description content so the collapse/expand control is guaranteed to render in the live runtime.',
    'p1'
  );

  futureCollegeBlocker(
    'COL-E2E-011',
    'college can link local club chapters from pre-existing clubs and save',
    'Live Manage College form exposes Local Club Chapters, but this workbook case needs a deterministic save-safe college record to verify persisted club linkage.',
    'p1'
  );
  futureCollegeBlocker(
    'COL-E2E-012',
    'key contact roles can be assigned from existing users and saved',
    'Live Manage College form exposes key-contact selectors, but this workbook case needs a deterministic save-safe college record to verify persisted contact mapping.',
    'p1'
  );
  futureCollegeBlocker(
    'COL-E2E-013',
    'Student Onboarding page loads with filters, table, bulk upload, and Add action',
    'College Student Onboarding is described in the FS, but the current live admin runtime does not expose a separate student-onboarding page under Manage College.',
    'p0'
  );
  futureCollegeBlocker(
    'COL-E2E-014',
    'bulk student upload validates file structure and creates students',
    'Bulk student onboarding flow is documented in the FS, but the current live admin runtime does not expose that student-onboarding upload surface.',
    'p0'
  );
  futureCollegeBlocker(
    'COL-E2E-015',
    'college admin can search, edit, archive, and paginate student records',
    'Student management table actions are documented in the FS, but the current live admin runtime does not expose the student-onboarding management screen.',
    'p1'
  );
});
