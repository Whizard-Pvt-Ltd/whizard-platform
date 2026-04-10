import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-companies-sheet.json');

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
  return page.locator('.w-\\[320px\\]').first();
}

function companyButtons(page: Page): Locator {
  return listPanel(page).locator('button');
}

function companyForm(page: Page): Locator {
  return page.locator('whizard-company-form');
}

function futureCompanyBlocker(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @companies ${title}`, async ({ page }) => {
    await openCompaniesPage(page);
    throw new Error(reason);
  });
}

async function openCompaniesPage(page: Page): Promise<void> {
  await page.goto(`${appUrl}/manage-company`, { waitUntil: 'domcontentloaded' });

  if (/\/login/.test(page.url())) {
    await interactiveLogin(page);
    if (!/\/manage-company/.test(page.url())) {
      await page.goto(`${appUrl}/manage-company`, { waitUntil: 'domcontentloaded' });
    }
  }

  await expect(page).toHaveURL(/\/manage-company/, { timeout: 15000 });
  await expect(listPanel(page)).toBeVisible({ timeout: 15000 });
  await expect(page.getByPlaceholder('Search company...')).toBeVisible({ timeout: 15000 });
  await expect
    .poll(
      async () => {
        if (await listPanel(page).getByText('No companies found').isVisible().catch(() => false)) {
          return 0;
        }
        return await companyButtons(page).count();
      },
      {
        timeout: 15000,
        message: 'Waiting for company list or empty-state to load on Manage Company',
      }
    )
    .toBeGreaterThanOrEqual(0);
}

async function clickSaveButton(page: Page): Promise<void> {
  const saveButton = companyForm(page).getByRole('button', { name: 'Save' }).first();
  await expect(saveButton).toBeVisible();
  await saveButton.click({ force: true });
}

test.describe('Companies sheet-aligned coverage', () => {
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
    await openCompaniesPage(page);
  });

  test('COMP-CUR-001 @stable @p0 @companies loads Manage Company with selected company details', async () => {
    await expect(listPanel(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.getByText(/Company Id :/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('COMP-CUR-002 @stable @p1 @companies filters the company list using search', async () => {
    const search = page.getByPlaceholder('Search company...');
    const initialCount = await companyButtons(page).count();
    expect(initialCount).toBeGreaterThan(0);

    await search.fill('zzzz-unmatched-company');
    await expect(listPanel(page).getByText('No companies found')).toBeVisible();

    await search.fill('');
    await expect.poll(async () => companyButtons(page).count()).toBe(initialCount);
  });

  test('COMP-CUR-003 @stable @p0 @companies opens create form and blocks save when Name is empty', async () => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(companyForm(page)).toBeVisible();
    await expect(companyForm(page).getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByText('Company Details').first()).toBeVisible();

    await clickSaveButton(page);
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('COMP-CUR-004 @stable @p1 @companies opens edit form with selected company prefilled', async () => {
    const selectedName = await page.locator('h2').first().textContent();
    expect(selectedName?.trim()).toBeTruthy();

    await page.getByRole('button', { name: 'Edit' }).click();
    const nameInput = page.getByPlaceholder('Enter company name');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(selectedName!.trim());
  });

  test('COMP-CUR-005 @stable @p1 @companies shows preview from edit form and returns back to list view', async () => {
    const selectedName = (await page.locator('h2').first().textContent())?.trim() || '';
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(companyForm(page)).toBeVisible();
    await companyForm(page).getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByText('Preview')).toBeVisible();
    await expect(page.getByRole('heading', { name: selectedName })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByText(/Company Id :/).first()).toBeVisible();
  });

  test('COMP-CUR-006 @stable @p1 @companies validates contact email format before save', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByPlaceholder('contact@company.com').fill('invalid-email');
    await clickSaveButton(page);
    await expect(page.getByText('Enter a valid email')).toBeVisible();
  });

  futureCompanyBlocker(
    'COMP-E2E-001',
    'company WRCF dashboard loads using the referenced industry template',
    'Current live UI at /manage-company is a CRUD management page and does not expose the company WRCF dashboard/template-linked landing surface described in the workbook.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-002',
    'dashboard shows Industry Version, Company Version, and Overrides count',
    'Current live Manage Company page does not expose a company-WRCF version summary area with Industry Version, Company Version, or Overrides count.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-003',
    'dashboard shows Structural Overrides, Capability Overrides, Role Overrides, and Upgrade Available sections',
    'Current live Manage Company page does not expose company-WRCF override sections or upgrade state sections.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-004',
    'Company Admin can perform override actions only',
    'This workbook permission case depends on a company-WRCF override surface and a dedicated Company Admin account matrix that are not represented in the current live Manage Company page/runtime.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-005',
    'Industry Architect has full edit access to master WRCF flows',
    'This workbook permission case targets industry-master WRCF flows rather than the current Manage Company CRUD page and needs dedicated RBAC accounts to verify.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-006',
    'Auditor can only view and export company WRCF',
    'Current live Manage Company page does not expose the company-WRCF export surface and this role-based case needs a dedicated Auditor account.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-007',
    'Employee can only view role capability requirements',
    'Current live runtime does not expose the company role requirement view described in the workbook and this case needs an Employee account.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-008',
    'company can save company-specific capability-instance overrides without duplicating full master data',
    'Current live Manage Company page does not expose company-specific capability-instance override editing or the hybrid master-plus-override save flow.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-009',
    'runtime view overlays company overrides on top of the industry master',
    'Current live Manage Company page does not expose the final merged company-WRCF runtime view described in the workbook.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-010',
    'company role adjustments show Industry Role Template and Company Role Variant',
    'Current live Manage Company page does not expose Company Role Adjustments or Industry Role Template vs Company Role Variant comparison.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-011',
    'comparison uses color coding for same, overridden, and removed items',
    'Current live Manage Company page does not expose the workbook role-comparison screen needed for this color-coding validation.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-012',
    'company can add a new internal role',
    'Current live Manage Company page does not expose the company role-variant creation surface described in the workbook.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-013',
    'company can adjust capability weights in the company role variant',
    'Current live Manage Company page does not expose company role-variant capability weight adjustment.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-014',
    'company can change certification threshold in the company role variant',
    'Current live Manage Company page does not expose company role-variant certification-threshold override editing.',
    'p1'
  );
  futureCompanyBlocker(
    'COMP-E2E-015',
    'company sees Upgrade Available when industry publishes a newer version',
    'Current live Manage Company page does not expose industry/company WRCF version comparison or Upgrade Available state.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-016',
    'upgrade flow shows diffs before applying update',
    'Current live Manage Company page does not expose the workbook Upgrade & Merge diff flow.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-017',
    'Accept All applies all industry updates and generates the next company version',
    'Current live Manage Company page does not expose the workbook Upgrade & Merge accept-all flow or company version generation.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-018',
    'Review Individually allows accepting some changes and keeping current for others',
    'Current live Manage Company page does not expose the workbook selective upgrade-merge decision flow.',
    'p0'
  );
  futureCompanyBlocker(
    'COMP-E2E-019',
    'company can defer an upgrade without changing the current company version',
    'Current live Manage Company page does not expose the workbook Defer Upgrade flow or company-WRCF version state.',
    'p1'
  );
});
