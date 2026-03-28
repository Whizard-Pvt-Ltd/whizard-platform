import { expect, test, type Page, type Route } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;

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

function envelope<T>(data: T) {
  return { success: true, data, meta: {} };
}

async function login(page: Page): Promise<void> {
  if (!loginEmail || !loginPassword) {
    throw new Error('TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(`${appUrl}/login`);
    await page.getByLabel('E-mail').fill(loginEmail);
    await page.getByLabel('Password').fill(loginPassword);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    try {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
      return;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }
}

async function gotoDashboard(page: Page): Promise<void> {
  await page.goto(`${appUrl}/dashboard`);
  await expect(page.getByText('Industry WRCF Dashboard')).toBeVisible();
}

function sectorDropdown(page: Page) {
  return page.locator('.filters-bar select').nth(0);
}

function industryDropdown(page: Page) {
  return page.locator('.filters-bar select').nth(1);
}

function statCard(page: Page, label: string) {
  return page.locator('.stat-card').filter({ hasText: label });
}

function quickAction(page: Page, label: string) {
  return page.locator('.action-card').filter({ hasText: label });
}

async function getOptions(page: Page, label: string): Promise<string[]> {
  const dropdown = label === 'Industry Sector' ? sectorDropdown(page) : industryDropdown(page);
  return dropdown.locator('option').evaluateAll(
    options => options.map(option => (option as HTMLOptionElement).textContent?.trim() || '').filter(Boolean)
  );
}

async function expectStatCount(page: Page, label: string, value: number): Promise<void> {
  await expect(statCard(page, label)).toContainText(String(value));
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
  test('uses dashboard as the default page after login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Industry WRCF Dashboard')).toBeVisible();
  });

  test('auto-selects the default Industry Sector and Industry on page load', async ({ page }) => {
    await login(page);
    await expect(sectorDropdown(page)).toHaveValue(/.+/);
    await expect(industryDropdown(page)).toHaveValue(/.+/);
    await expect(page.locator('.industry-name')).not.toHaveText('—');
  });

  test('loads dashboard cards for the default selected sector and industry', async ({ page }) => {
    await login(page);
    await expect(statCard(page, 'Functional Groups')).toBeVisible();
    await expect(statCard(page, 'Primary Work Objective')).toBeVisible();
    await expect(statCard(page, 'Secondary Work Objective')).toBeVisible();
    await expect(statCard(page, 'Capability Instances')).toBeVisible();
    await expect(statCard(page, 'Skills')).toBeVisible();
    await expect(statCard(page, 'Tasks')).toBeVisible();
    await expect(statCard(page, 'Roles')).toBeVisible();
    await expect(statCard(page, 'Departments')).toBeVisible();
  });

  test('displays Industry Sector options in alphabetical order', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    const options = await getOptions(page, 'Industry Sector');
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
  });

  test('shows industries only for the selected Industry Sector and keeps them alphabetically ordered', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await sectorDropdown(page).selectOption('sector-energy');
    await expect.poll(async () => getOptions(page, 'Industry')).toEqual(['Thermal Power', 'Water Operations']);
    const energyOptions = await getOptions(page, 'Industry');
    expect(energyOptions).toEqual(['Thermal Power', 'Water Operations']);
    expect(energyOptions).toEqual([...energyOptions].sort((a, b) => a.localeCompare(b)));

    await sectorDropdown(page).selectOption('sector-manufacturing');
    await expect.poll(async () => getOptions(page, 'Industry')).toEqual(['Auto Manufacturing', 'Steel Manufacturing']);
    const manufacturingOptions = await getOptions(page, 'Industry');
    expect(manufacturingOptions).toEqual(['Auto Manufacturing', 'Steel Manufacturing']);
    expect(manufacturingOptions).toEqual([...manufacturingOptions].sort((a, b) => a.localeCompare(b)));
  });

  test('refreshes all cards when the user changes Industry within the same sector', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-thermal');
    await expectStatCount(page, 'Functional Groups', 11);
    await expectStatCount(page, 'Tasks', 13);

    await industryDropdown(page).selectOption('industry-water');
    await expect(page.locator('.industry-name')).toHaveText('Water Operations');
    await expectStatCount(page, 'Functional Groups', 1);
    await expectStatCount(page, 'Tasks', 0);
  });

  test('resets Industry and refreshes dashboard data when Industry Sector changes', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await sectorDropdown(page).selectOption('sector-energy');
    await expect(industryDropdown(page)).toHaveValue('industry-thermal');
    await expect(page.locator('.industry-name')).toHaveText('Thermal Power');
    await expectStatCount(page, 'Functional Groups', 11);

    await sectorDropdown(page).selectOption('sector-manufacturing');
    await expect(industryDropdown(page)).toHaveValue('industry-auto');
    await expect(page.locator('.industry-name')).toHaveText('Auto Manufacturing');
    await expectStatCount(page, 'Functional Groups', 8);
  });

  test('does not retain the previous industry metrics after sector or industry selection changes', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await sectorDropdown(page).selectOption('sector-manufacturing');
    await industryDropdown(page).selectOption('industry-steel');
    await expectStatCount(page, 'Primary Work Objective', 6);
    await expectStatCount(page, 'Functional Groups', 5);

    await sectorDropdown(page).selectOption('sector-energy');
    await expect(page.locator('.industry-name')).toHaveText('Thermal Power');
    await expect(statCard(page, 'Functional Groups')).not.toContainText('5');
    await expectStatCount(page, 'Functional Groups', 11);
  });

  test('renders the current version, draft version, last updated, and validation status fields', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Current Version')).toBeVisible();
    await expect(page.getByText('Draft Version')).toBeVisible();
    await expect(page.getByText('Last Updated')).toBeVisible();
    await expect(page.getByText('Validation Status')).toBeVisible();
    await expect(page.getByText('Published')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Validated')).toBeVisible();
  });

  test('renders all quick action tiles and their current behaviors', async ({ page }) => {
    await login(page);

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

  test('handles partial zero-count states without breaking the dashboard layout', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);

    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-water');

    await expect(page.locator('.industry-name')).toHaveText('Water Operations');
    await expectStatCount(page, 'Functional Groups', 1);
    await expectStatCount(page, 'Primary Work Objective', 0);
    await expectStatCount(page, 'Secondary Work Objective', 0);
    await expectStatCount(page, 'Capability Instances', 0);
    await expectStatCount(page, 'Skills', 0);
    await expectStatCount(page, 'Tasks', 0);
    await expectStatCount(page, 'Roles', 0);
    await expectStatCount(page, 'Departments', 0);
  });

  test('hides inactive Industry Sectors from the dashboard filter', async ({ page }) => {
    test.fail(true, 'Current dashboard does not filter inactive sectors in the UI model.');

    await login(page);
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

  test('hides inactive industries from the Industry dropdown', async ({ page }) => {
    test.fail(true, 'Current dashboard does not filter inactive industries in the UI model.');

    await login(page);
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

  test('excludes inactive FG PWO SWO CI Skill Task Role and Department records from dashboard counts', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-thermal');

    await expectStatCount(page, 'Functional Groups', 11);
    await expectStatCount(page, 'Primary Work Objective', 7);
    await expectStatCount(page, 'Secondary Work Objective', 5);
    await expectStatCount(page, 'Capability Instances', 4);
    await expectStatCount(page, 'Skills', 9);
    await expectStatCount(page, 'Tasks', 13);
    await expectStatCount(page, 'Roles', 3);
    await expectStatCount(page, 'Departments', 2);
  });

  test('uses only published version data for displayed metrics', async ({ page }) => {
    test.fail(true, 'Current dashboard metrics are not version-aware in the UI.');
    await login(page);
    await expect(page.getByText('Current Version')).toBeVisible();
    await expect(page.locator('.version-row')).toContainText('4.1');
  });

  test('shows -- when no draft version exists', async ({ page }) => {
    test.fail(true, 'Draft version display is currently hardcoded.');
    await login(page);
    await expect(page.locator('.version-row')).toContainText('--');
  });

  test('shows a no-data state when the selected industry has no published WRCF data', async ({ page }) => {
    test.fail(true, 'Current dashboard uses zero cards instead of a dedicated no-data state.');
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-water');
    await expect(page.getByText('No published WRCF data')).toBeVisible();
  });

  test('keeps Last Updated aligned with the selected industry version state', async ({ page }) => {
    test.fail(true, 'Last Updated is currently hardcoded in the dashboard template.');
    await login(page);
    await expect(page.locator('.version-date')).not.toHaveText('28 Feb 2026');
  });

  test('keeps Validation Status aligned with the selected industry version state', async ({ page }) => {
    test.fail(true, 'Validation Status is currently hardcoded in the dashboard template.');
    await login(page);
    await expect(page.locator('.version-row')).not.toContainText('Validated');
  });

  test('uses published active Capability Instance counts only', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-thermal');
    await expectStatCount(page, 'Capability Instances', 4);
  });

  test('uses published active linked records only for Skills and Tasks counts', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-thermal');
    await expectStatCount(page, 'Skills', 9);
    await expectStatCount(page, 'Tasks', 13);
  });

  test('keeps hierarchy card totals aligned to published active counts', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-manufacturing');
    await industryDropdown(page).selectOption('industry-auto');
    await expectStatCount(page, 'Functional Groups', 8);
    await expectStatCount(page, 'Primary Work Objective', 6);
    await expectStatCount(page, 'Secondary Work Objective', 3);
  });

  test('uses active published counts for Roles and Departments cards', async ({ page }) => {
    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-manufacturing');
    await industryDropdown(page).selectOption('industry-auto');
    await expectStatCount(page, 'Roles', 4);
    await expectStatCount(page, 'Departments', 1);
  });

  test('clicking Edit Structure redirects user to Manage Industry WRCF with same selected Industry Sector and Industry carried forward from Dashboard', async ({ page }) => {
    test.fail(true, 'Dashboard navigation currently does not carry the selected sector and industry into Manage Industry WRCF.');

    await login(page);
    await mockDashboardApis(page);
    await gotoDashboard(page);
    await sectorDropdown(page).selectOption('sector-energy');
    await industryDropdown(page).selectOption('industry-water');

    await quickAction(page, 'Edit Structure').click();
    await expect(page).toHaveURL(/\/industry-wrcf/);
    await expect(page.locator('.filter-bar .filter-select').nth(0)).toHaveValue('sector-energy');
    await expect(page.locator('.filter-bar .filter-select').nth(1)).toHaveValue('industry-water');
  });
});
