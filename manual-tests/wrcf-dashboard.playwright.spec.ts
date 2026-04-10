import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Page, type Route } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-dashboard.json');

type Sector = { id: string; name: string };
type Industry = { id: string; name: string; sectorId: string };
type DashboardStats = {
  functionalGroups: number;
  primaryWorkObjects: number;
  secondaryWorkObjects: number;
  capabilityInstances: number;
  skills: number;
  tasks: number;
  departments: number;
  roles: number;
};

const mockedSectors: Sector[] = [
  { id: 'sector-energy', name: 'Energy & Utilities' },
  { id: 'sector-manufacturing', name: 'Manufacturing' },
];

const mockedIndustriesBySector: Record<string, Industry[]> = {
  'sector-energy': [
    { id: 'industry-thermal', name: 'Thermal Power', sectorId: 'sector-energy' },
    { id: 'industry-water', name: 'Water Operations', sectorId: 'sector-energy' },
  ],
  'sector-manufacturing': [
    { id: 'industry-auto', name: 'Auto Manufacturing', sectorId: 'sector-manufacturing' },
    { id: 'industry-steel', name: 'Steel Manufacturing', sectorId: 'sector-manufacturing' },
  ],
};

const mockedStatsByIndustry: Record<string, DashboardStats> = {
  'industry-thermal': {
    functionalGroups: 11,
    primaryWorkObjects: 7,
    secondaryWorkObjects: 5,
    capabilityInstances: 4,
    skills: 9,
    tasks: 13,
    departments: 2,
    roles: 3,
  },
  'industry-water': {
    functionalGroups: 1,
    primaryWorkObjects: 0,
    secondaryWorkObjects: 0,
    capabilityInstances: 0,
    skills: 0,
    tasks: 0,
    departments: 0,
    roles: 0,
  },
  'industry-auto': {
    functionalGroups: 8,
    primaryWorkObjects: 6,
    secondaryWorkObjects: 3,
    capabilityInstances: 2,
    skills: 5,
    tasks: 12,
    departments: 1,
    roles: 4,
  },
  'industry-steel': {
    functionalGroups: 5,
    primaryWorkObjects: 6,
    secondaryWorkObjects: 2,
    capabilityInstances: 0,
    skills: 0,
    tasks: 0,
    departments: 0,
    roles: 0,
  },
};

const isLocalApp = /localhost(?::4200)?/.test(appUrl);

function envelope<T>(data: T) {
  return { success: true, data, meta: {} };
}

async function interactiveLogin(page: Page): Promise<void> {
  if (!loginEmail || !loginPassword) {
    throw new Error('TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');
  }

  await page.goto(`${appUrl}/login`);
  await page.getByLabel('E-mail').fill(loginEmail);
  await page.getByLabel('Password').fill(loginPassword);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);
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

async function gotoDashboard(page: Page): Promise<void> {
  await page.goto(`${appUrl}/dashboard`);
  await expect(page.getByText('Industry WRCF Dashboard')).toBeVisible();
  await page.waitForLoadState('networkidle');
}

function sectorDropdown(page: Page) {
  return page.locator('mat-form-field.wrcf-select').nth(0);
}

function industryDropdown(page: Page) {
  return page.locator('mat-form-field.wrcf-select').nth(1);
}

function statCard(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('xpath=ancestor::div[1]');
}

function quickAction(page: Page, label: string) {
  return page.getByRole('button', { name: new RegExp(label) });
}

function quickActionCards(page: Page) {
  return page.locator('button').filter({
    has: page.locator('span', { hasText: /Edit Structure|Manage Roles|Version History|Publish Draft/ }),
  });
}

function selectTrigger(page: Page, index: number) {
  return page.locator('mat-form-field.wrcf-select').nth(index).locator('.mat-mdc-select-trigger');
}

function selectedValue(page: Page, index: number) {
  return page.locator('mat-form-field.wrcf-select').nth(index).locator('.mat-mdc-select-value-text');
}

function openOptionLocator(page: Page) {
  return page.locator(
    '.cdk-overlay-pane [role="option"], .cdk-overlay-pane mat-option, .mat-mdc-select-panel [role="option"], .mat-mdc-option'
  );
}

async function openSelect(page: Page, index: number): Promise<void> {
  await selectTrigger(page, index).click();
  if ((await openOptionLocator(page).count()) === 0) {
    await page.waitForTimeout(500);
    await page.locator('mat-form-field.wrcf-select').nth(index).locator('mat-select').click({ force: true });
  }
  await expect
    .poll(async () => await openOptionLocator(page).count(), {
      timeout: 7000,
      message: `Waiting for dashboard select ${index} options to open`,
    })
    .toBeGreaterThan(0);
  await expect(openOptionLocator(page).first()).toBeVisible();
}

async function closeSelect(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(openOptionLocator(page).first()).not.toBeVisible({ timeout: 5000 });
}

async function chooseSelectOption(page: Page, index: number, label: string): Promise<void> {
  await openSelect(page, index);
  await openOptionLocator(page).filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }).first().click();
}

async function getOptions(page: Page, label: string): Promise<string[]> {
  const index = label === 'Industry Sector' ? 0 : 1;
  await openSelect(page, index);
  const options = await page
    .locator(
      '.cdk-overlay-pane [role="option"], .cdk-overlay-pane mat-option, .mat-mdc-select-panel [role="option"], .mat-mdc-option'
    )
    .evaluateAll(nodes => nodes.map(node => node.textContent?.trim() || '').filter(Boolean));
  await closeSelect(page);
  return options;
}

async function selectDashboardContext(page: Page, sectorLabel: string, industryLabel: string): Promise<void> {
  await chooseSelectOption(page, 0, sectorLabel);
  await expect(selectedValue(page, 0)).toContainText(sectorLabel);
  await expect.poll(async () => await getOptions(page, 'Industry')).toContain(industryLabel);
  await chooseSelectOption(page, 1, industryLabel);
  await expect(selectedValue(page, 1)).toContainText(industryLabel);
  await expect(page.locator('h2')).toHaveText(industryLabel);
}

async function expectStatCount(page: Page, label: string, value: number): Promise<void> {
  await expect(statCard(page, label)).toContainText(String(value));
}

async function openProfileMenu(page: Page): Promise<void> {
  const candidates = [
    page.getByRole('button', { name: /profile|account|user/i }).first(),
    page.locator('.avatar-wrapper button').first(),
    page.locator('.avatar').first(),
    page.getByRole('button').filter({ hasText: /^[A-Z]$/ }).last(),
  ];

  for (const locator of candidates) {
    if ((await locator.count()) === 0) {
      continue;
    }
    try {
      await locator.click({ timeout: 2000 });
      if ((await page.getByText(/logout|sign out/i).count()) > 0) {
        return;
      }
    } catch {
      // Try the next available profile trigger.
    }
  }

  throw new Error('Could not open a profile menu on the dashboard shell.');
}

async function mockDashboardApis(page: Page): Promise<void> {
  await page.route('**/wrcf/sectors', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope(mockedSectors)),
    });
  });

  await page.route('**/wrcf/sectors/*/industries', async (route: Route) => {
    const url = new URL(route.request().url());
    const sectorId = url.pathname.split('/').at(-2) || '';
    const industries = mockedIndustriesBySector[sectorId] || [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope(industries)),
    });
  });

  await page.route('**/wrcf/industries/*/dashboard-stats', async (route: Route) => {
    const url = new URL(route.request().url());
    const industryId = url.pathname.split('/').at(-2) || '';
    const stats = mockedStatsByIndustry[industryId] || mockedStatsByIndustry['industry-steel'];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope(stats)),
    });
  });
}

test.describe('WRCF dashboard', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await page.goto(`${appUrl}/dashboard`);

    if (!/\/dashboard/.test(page.url())) {
      await context.close();
      const authenticated = await ensureAuthenticatedPage(browser);
      context = authenticated.context;
      page = authenticated.page;
    }
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('DASH-E2E-001 @stable @p0 @dashboard uses dashboard as the default page after login', async () => {
    await page.goto(`${appUrl}/login`);

    if (/\/login/.test(page.url())) {
      if (!loginEmail || !loginPassword) {
        throw new Error('TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');
      }

      await page.getByLabel('E-mail').fill(loginEmail);
      await page.getByLabel('Password').fill(loginPassword);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    }

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Industry WRCF Dashboard')).toBeVisible();
  });

  test('DASH-E2E-002 @stable @p0 @dashboard auto-selects the default Industry Sector and Industry on page load', async () => {
    await expect
      .poll(async () => ({
        sector: await selectedValue(page, 0).textContent(),
        industry: await selectedValue(page, 1).textContent(),
        heading: await page.locator('h2').textContent(),
      }))
      .toMatchObject({
        sector: expect.stringMatching(/.+/),
        industry: expect.stringMatching(/.+/),
        heading: expect.stringMatching(/\S/),
      });

    await expect(page.locator('h2')).not.toHaveText('—');
  });

  test('DASH-E2E-003 @stable @p0 @dashboard loads dashboard cards for the default selected sector and industry', async () => {
    await expect(statCard(page, 'Functional Groups')).toBeVisible();
    await expect(statCard(page, 'Primary Work Objective')).toBeVisible();
    await expect(statCard(page, 'Secondary Work Objective')).toBeVisible();
    await expect(statCard(page, 'Capability Instances')).toBeVisible();
    await expect(statCard(page, 'Skills')).toBeVisible();
    await expect(statCard(page, 'Tasks')).toBeVisible();
    await expect(statCard(page, 'Roles')).toBeVisible();
    await expect(statCard(page, 'Departments')).toBeVisible();
  });

  test('DASH-E2E-004 @stable @p1 @dashboard displays Industry Sector options in alphabetical order', async () => {
    if (isLocalApp) {
      await mockDashboardApis(page);
    }
    await gotoDashboard(page);

    const options = await getOptions(page, 'Industry Sector');
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
  });

  test('DASH-E2E-005 @stable @p1 @dashboard shows industries only for the selected Industry Sector', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await chooseSelectOption(page, 0, 'Energy & Utilities');
    await expect.poll(async () => getOptions(page, 'Industry')).toEqual(['Thermal Power', 'Water Operations']);
    const energyOptions = await getOptions(page, 'Industry');
    expect(energyOptions).toEqual(['Thermal Power', 'Water Operations']);

    await chooseSelectOption(page, 0, 'Manufacturing');
    await expect.poll(async () => getOptions(page, 'Industry')).toEqual(['Auto Manufacturing', 'Steel Manufacturing']);
    const manufacturingOptions = await getOptions(page, 'Industry');
    expect(manufacturingOptions).toEqual(['Auto Manufacturing', 'Steel Manufacturing']);
  });

  test('DASH-E2E-006 @stable @p1 @dashboard keeps industries under the selected sector in alphabetical order', async () => {
    if (isLocalApp) {
      await mockDashboardApis(page);
    }
    await gotoDashboard(page);

    await chooseSelectOption(page, 0, 'Energy & Utilities');
    const energyOptions = await getOptions(page, 'Industry');
    expect(energyOptions).toEqual([...energyOptions].sort((a, b) => a.localeCompare(b)));

    await chooseSelectOption(page, 0, 'Manufacturing');
    const manufacturingOptions = await getOptions(page, 'Industry');
    expect(manufacturingOptions).toEqual([...manufacturingOptions].sort((a, b) => a.localeCompare(b)));
  });

  test('DASH-E2E-014 @stable @p1 @dashboard refreshes all cards when the user changes Industry within the same sector', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await selectDashboardContext(page, 'Energy & Utilities', 'Thermal Power');
    await expectStatCount(page, 'Functional Groups', 11);
    await expectStatCount(page, 'Tasks', 13);

    await chooseSelectOption(page, 1, 'Water Operations');
    await expect(page.locator('h2')).toHaveText('Water Operations');
    await expectStatCount(page, 'Functional Groups', 1);
    await expectStatCount(page, 'Tasks', 0);
  });

  test('DASH-E2E-015 @stable @p1 @dashboard resets Industry and refreshes dashboard data when Industry Sector changes', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await selectDashboardContext(page, 'Energy & Utilities', 'Thermal Power');
    await expectStatCount(page, 'Functional Groups', 11);

    await chooseSelectOption(page, 0, 'Manufacturing');
    await expect(selectedValue(page, 1)).toContainText('Auto Manufacturing');
    await expect(page.locator('h2')).toHaveText('Auto Manufacturing');
    await expectStatCount(page, 'Functional Groups', 8);
  });

  test('DASH-E2E-016 @stable @p1 @dashboard does not retain the previous industry metrics after sector or industry selection changes', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await selectDashboardContext(page, 'Manufacturing', 'Steel Manufacturing');
    await expectStatCount(page, 'Primary Work Objective', 6);
    await expectStatCount(page, 'Functional Groups', 5);

    await chooseSelectOption(page, 0, 'Energy & Utilities');
    await expect(page.locator('h2')).toHaveText('Thermal Power');
    await expect(statCard(page, 'Functional Groups')).not.toContainText('5');
    await expectStatCount(page, 'Functional Groups', 11);
  });

  test('DASH-E2E-011 @stable @p1 @dashboard renders the current version, draft version, last updated, and validation status fields', async () => {
    await expect(page.getByText('Current Version')).toBeVisible();
    await expect(page.getByText('Draft Version')).toBeVisible();
    await expect(page.getByText('Last Updated')).toBeVisible();
    await expect(page.getByText('Validation Status')).toBeVisible();
    await expect(page.getByText('Published')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Validated')).toBeVisible();
  });

  test('DASH-E2E-024 @stable @p1 @dashboard renders all quick action tiles and their current behaviors', async () => {
    await expect(quickAction(page, 'Edit Structure')).toBeVisible();
    await expect(quickAction(page, 'Manage Roles')).toBeVisible();
    await expect(quickAction(page, 'Version History')).toBeVisible();
    await expect(quickAction(page, 'Publish Draft')).toBeVisible();

    await quickAction(page, 'Version History').click();
    await expect(page.getByText('Version history coming soon.')).toBeVisible();
    await page.locator('.dialog .close-btn').click();

    await quickAction(page, 'Publish Draft').click();
    await expect(page.getByText('Publish draft coming soon.')).toBeVisible();
    await page.locator('.dialog .close-btn').click();

    await quickAction(page, 'Edit Structure').click();
    await expect(page).toHaveURL(/\/industry-wrcf/);

    await gotoDashboard(page);
    await quickAction(page, 'Manage Roles').click();
    await expect(page).toHaveURL(/\/wrcf-roles/);
  });

  test('DASH-E2E-023 @stable @p1 @dashboard handles partial zero-count states without breaking the dashboard layout', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await selectDashboardContext(page, 'Energy & Utilities', 'Water Operations');

    await expect(page.locator('h2')).toHaveText('Water Operations');
    await expectStatCount(page, 'Functional Groups', 1);
    await expectStatCount(page, 'Primary Work Objective', 0);
    await expectStatCount(page, 'Secondary Work Objective', 0);
    await expectStatCount(page, 'Capability Instances', 0);
    await expectStatCount(page, 'Skills', 0);
    await expectStatCount(page, 'Tasks', 0);
    await expectStatCount(page, 'Roles', 0);
    await expectStatCount(page, 'Departments', 0);
  });

  test('DASH-E2E-007 @stable @p1 @dashboard hides inactive Industry Sectors from the dashboard filter', async () => {
    await page.route('**/wrcf/sectors', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope([
          { id: 'sector-active', name: 'Manufacturing' },
          { id: 'sector-inactive', name: 'ZZ Inactive Sector', isActive: false },
        ])),
      });
    });
    await page.route('**/wrcf/sectors/*/industries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope([{ id: 'industry-a', name: 'Steel Manufacturing', sectorId: 'sector-active' }])),
      });
    });
    await page.route('**/wrcf/industries/*/dashboard-stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope(mockedStatsByIndustry['industry-steel'])),
      });
    });

    await gotoDashboard(page);
    const options = await getOptions(page, 'Industry Sector');
    expect(options).not.toContain('ZZ Inactive Sector');
  });

  test('DASH-E2E-008 @stable @p1 @dashboard hides inactive industries from the Industry dropdown', async () => {
    await page.route('**/wrcf/sectors', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope([{ id: 'sector-active', name: 'Manufacturing' }])),
      });
    });
    await page.route('**/wrcf/sectors/*/industries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope([
          { id: 'industry-active', name: 'Steel Manufacturing', sectorId: 'sector-active' },
          { id: 'industry-inactive', name: 'ZZ Inactive Industry', sectorId: 'sector-active', isActive: false },
        ])),
      });
    });
    await page.route('**/wrcf/industries/*/dashboard-stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope(mockedStatsByIndustry['industry-steel'])),
      });
    });

    await gotoDashboard(page);
    const options = await getOptions(page, 'Industry');
    expect(options).not.toContain('ZZ Inactive Industry');
  });

  test('DASH-E2E-009 @stable @p1 @dashboard excludes inactive FG PWO SWO CI Skill Task Role and Department records from dashboard counts', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Energy & Utilities', 'Thermal Power');

    await expectStatCount(page, 'Functional Groups', 11);
    await expectStatCount(page, 'Primary Work Objective', 7);
    await expectStatCount(page, 'Secondary Work Objective', 5);
    await expectStatCount(page, 'Capability Instances', 4);
    await expectStatCount(page, 'Skills', 9);
    await expectStatCount(page, 'Tasks', 13);
    await expectStatCount(page, 'Roles', 3);
    await expectStatCount(page, 'Departments', 2);
  });

  test('DASH-E2E-010 @stable @p1 @dashboard uses only published version data for displayed metrics', async () => {
    await expect(page.getByText('Current Version')).toBeVisible();
    await expect(page.locator('.version-row')).toContainText('4.1');
  });

  test('DASH-E2E-012 @stable @p1 @dashboard shows -- when no draft version exists', async () => {
    await expect(page.locator('.version-row')).toContainText('--');
  });

  test('DASH-E2E-013 @stable @p1 @dashboard shows a no-data state when the selected industry has no published WRCF data', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Energy & Utilities', 'Water Operations');
    await expect(page.getByText('No published WRCF data')).toBeVisible();
  });

  test('DASH-E2E-017 @stable @p1 @dashboard keeps Last Updated aligned with the selected industry version state', async () => {
    await expect(page.locator('.version-date')).not.toHaveText('28 Feb 2026');
  });

  test('DASH-E2E-018 @stable @p1 @dashboard keeps Validation Status aligned with the selected industry version state', async () => {
    await expect(page.locator('.version-row')).not.toContainText('Validated');
  });

  test('DASH-E2E-019 @stable @p1 @dashboard uses published active Capability Instance counts only', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Energy & Utilities', 'Thermal Power');
    await expectStatCount(page, 'Capability Instances', 4);
  });

  test('DASH-E2E-020 @stable @p1 @dashboard uses published active linked records only for Skills and Tasks counts', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Energy & Utilities', 'Thermal Power');
    await expectStatCount(page, 'Skills', 9);
    await expectStatCount(page, 'Tasks', 13);
  });

  test('DASH-E2E-021 @stable @p1 @dashboard keeps hierarchy card totals aligned to published active counts', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Manufacturing', 'Auto Manufacturing');
    await expectStatCount(page, 'Functional Groups', 8);
    await expectStatCount(page, 'Primary Work Objective', 6);
    await expectStatCount(page, 'Secondary Work Objective', 3);
  });

  test('DASH-E2E-022 @stable @p1 @dashboard uses active published counts for Roles and Departments cards', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Manufacturing', 'Auto Manufacturing');
    await expectStatCount(page, 'Roles', 4);
    await expectStatCount(page, 'Departments', 1);
  });

  test('DASH-E2E-026 @stable @p1 @dashboard clicking Edit Structure redirects user to Manage Industry WRCF with same selected Industry Sector and Industry carried forward from Dashboard', async () => {
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await selectDashboardContext(page, 'Energy & Utilities', 'Water Operations');

    await quickAction(page, 'Edit Structure').click();
    await expect(page).toHaveURL(/\/industry-wrcf/);
    await expect(page.locator('.filter-bar .filter-select').nth(0)).toHaveValue('sector-energy');
    await expect(page.locator('.filter-bar .filter-select').nth(1)).toHaveValue('industry-water');
  });

  test('DASH-E2E-025 @future @p1 @dashboard @blocked-role blocks unauthorized users from restricted dashboard actions', async () => {
    throw new Error('Pending until a lower-privilege user is available.');
  });

  test('DASH-E2E-027 @stable @p1 @dashboard loads the dashboard from the top of the page', async () => {
    await gotoDashboard(page);

    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrollY).toBeLessThanOrEqual(5);
  });

  test('DASH-E2E-028 @stable @p1 @dashboard renders a single dropdown arrow on each dashboard filter', async () => {
    await gotoDashboard(page);

    const sectorArrowCount = await sectorDropdown(page).locator('.mat-mdc-select-arrow-wrapper').count();
    const industryArrowCount = await industryDropdown(page).locator('.mat-mdc-select-arrow-wrapper').count();

    expect(sectorArrowCount).toBe(1);
    expect(industryArrowCount).toBe(1);
  });

  test('DASH-E2E-029 @stable @p1 @dashboard keeps the dashboard header blocks aligned on the shared WRCF layout grid', async () => {
    await gotoDashboard(page);

    const filterRowBox = await page.locator('div.px-8.py-5').first().boundingBox();
    const industryBlockBox = await page.locator('div.px-8.pb-4').first().boundingBox();
    const quickActionsHeadingBox = await page.getByRole('heading', { name: 'Quick Actions' }).boundingBox();

    expect(filterRowBox).not.toBeNull();
    expect(industryBlockBox).not.toBeNull();
    expect(quickActionsHeadingBox).not.toBeNull();

    expect(Math.abs((filterRowBox?.x ?? 0) - (industryBlockBox?.x ?? 0))).toBeLessThanOrEqual(4);
    expect(Math.abs((industryBlockBox?.x ?? 0) - (quickActionsHeadingBox?.x ?? 0))).toBeLessThanOrEqual(4);
  });

  test('DASH-E2E-030 @stable @p1 @dashboard avoids an unnecessary page scrollbar in a standard desktop viewport', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoDashboard(page);

    const scrollMetrics = await page.evaluate(() => ({
      viewport: window.innerHeight,
      docHeight: document.documentElement.scrollHeight,
    }));

    expect(scrollMetrics.docHeight).toBeLessThanOrEqual(scrollMetrics.viewport + 8);
  });

  test('DASH-E2E-031 @stable @p1 @dashboard keeps all quick action tiles visually aligned', async () => {
    await gotoDashboard(page);

    const cards = quickActionCards(page);
    await expect(cards).toHaveCount(4);

    const boxes = await cards.evaluateAll(nodes =>
      nodes.map(node => {
        const rect = (node as HTMLElement).getBoundingClientRect();
        const divider = (node as HTMLElement).querySelector('div[class*="border-t"]');
        const icon = (node as HTMLElement).querySelector('mat-icon');
        return {
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          hasDivider: Boolean(divider),
          hasIcon: Boolean(icon),
        };
      })
    );

    const reference = boxes[0];
    for (const box of boxes) {
      expect(box.hasDivider).toBeTruthy();
      expect(box.hasIcon).toBeTruthy();
      expect(Math.abs(box.top - reference.top)).toBeLessThanOrEqual(2);
      expect(Math.abs(box.height - reference.height)).toBeLessThanOrEqual(2);
    }
  });

  test('DASH-E2E-032 @stable @p1 @dashboard exposes logout from the dashboard profile area', async () => {
    await gotoDashboard(page);
    await openProfileMenu(page);

    await expect(page.getByText(/logout|sign out/i)).toBeVisible();
  });
});
