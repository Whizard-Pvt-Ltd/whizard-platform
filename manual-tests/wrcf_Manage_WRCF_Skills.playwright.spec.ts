import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-manage-skills.json');

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

function filter(page: Page, index: number): Locator {
  return page.locator('.filter-bar .filter-select').nth(index);
}

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

async function dropdownLabels(select: Locator, placeholderPattern: RegExp): Promise<string[]> {
  return select.locator('option').evaluateAll(
    (options, patternSource) =>
      options
        .map(option => (option as HTMLOptionElement).textContent?.trim() || '')
        .filter(text => text && !(new RegExp(patternSource, 'i')).test(text)),
    placeholderPattern.source
  );
}

async function dropdownOptions(
  select: Locator,
  placeholderPattern: RegExp
): Promise<Array<{ label: string; value: string }>> {
  return select.locator('option').evaluateAll(
    (options, patternSource) =>
      options
        .map(option => ({
          label: (option as HTMLOptionElement).textContent?.trim() || '',
          value: (option as HTMLOptionElement).value || '',
        }))
        .filter(option => option.label && option.value && !(new RegExp(patternSource, 'i')).test(option.label)),
    placeholderPattern.source
  );
}

async function selectFirstOption(select: Locator, placeholderPattern: RegExp): Promise<string> {
  const options = await dropdownLabels(select, placeholderPattern);
  if (!options.length) {
    throw new Error(`No selectable options found for ${placeholderPattern}.`);
  }
  await select.selectOption({ label: options[0] });
  return options[0];
}

async function findIndustryIdForSkills(page: Page): Promise<{ sector: string; industry: string; industryId: string } | null> {
  const sectorSelect = filter(page, 0);
  const industrySelect = filter(page, 1);
  const sectorOptions = await dropdownOptions(sectorSelect, /^select sector/);

  for (const sector of sectorOptions) {
    await sectorSelect.selectOption(sector.value);

    await expect.poll(
      async () => dropdownOptions(industrySelect, /^select industry/),
      { timeout: 10000, message: `Waiting for industries under sector "${sector}"` }
    ).not.toHaveLength(0);

    const industryOptions = await dropdownOptions(industrySelect, /^select industry/);

    for (const industry of industryOptions) {
      await page.goto(`${appUrl}/wrcf-skills?industryId=${industry.value}`);
      await expect(page.getByRole('heading', { name: 'Manage WRCF Skills' })).toBeVisible();

      try {
        await expect
          .poll(
            async () => dropdownLabels(filter(page, 0), /^select fg/),
            { timeout: 5000, message: `Waiting for FG filter data under ${sector.label} / ${industry.label}` }
          )
          .not.toHaveLength(0);

        return { sector: sector.label, industry: industry.label, industryId: industry.value };
      } catch {
        await page.goto(`${appUrl}/industry-wrcf`);
        await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();
        const sectorsAfterFallback = await dropdownOptions(sectorSelect, /^select sector/);
        if (!sectorsAfterFallback.length) {
          return null;
        }
        await sectorSelect.selectOption(sector.value);
      }
    }
  }

  return null;
}

async function openSkillsPage(page: Page): Promise<boolean> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();

  await expect.poll(
    async () => dropdownLabels(filter(page, 0), /^select sector/),
    { timeout: 10000, message: 'Waiting for sector options on Manage Industry WRCF' }
  ).not.toHaveLength(0);

  const context = await findIndustryIdForSkills(page);
  if (!context) {
    return false;
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 0), /^select fg/),
    { timeout: 10000, message: 'Waiting for FG options on Manage WRCF Skills' }
  ).not.toHaveLength(0);

  return true;
}

async function selectCiBackedPath(page: Page): Promise<void> {
  await expect.poll(
    async () => dropdownLabels(filter(page, 0), /^select fg/),
    { timeout: 10000, message: 'Waiting for FG options to load' }
  ).not.toHaveLength(0);

  if (!(await filter(page, 0).inputValue())) {
    await selectFirstOption(filter(page, 0), /^select fg/);
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 1), /^select pwo/),
    { timeout: 10000, message: 'Waiting for PWO options to load' }
  ).not.toHaveLength(0);
  await selectFirstOption(filter(page, 1), /^select pwo/);

  await expect.poll(
    async () => dropdownLabels(filter(page, 2), /^select swo/),
    { timeout: 10000, message: 'Waiting for SWO options to load' }
  ).not.toHaveLength(0);
  await selectFirstOption(filter(page, 2), /^select swo/);

  await expect.poll(
    async () => dropdownLabels(filter(page, 3), /^select capability/),
    { timeout: 10000, message: 'Waiting for capability options to load' }
  ).not.toHaveLength(0);
  await selectFirstOption(filter(page, 3), /^select capability/);

  await expect.poll(
    async () => dropdownLabels(filter(page, 4), /^select level/),
    { timeout: 10000, message: 'Waiting for proficiency options to load' }
  ).not.toHaveLength(0);
  await selectFirstOption(filter(page, 4), /^select level/);
}

async function expectSorted(values: string[]): Promise<void> {
  expect(values).toEqual([...values].sort((a, b) => a.localeCompare(b)));
}

function futureManageSkillsCase(
  id: string,
  title: string,
  reason: string,
  priority: 'p0' | 'p1' | 'p2' = 'p1'
): void {
  test(`${id} @future @${priority} @manage-skills ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Manage WRCF Skills sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;
  const noSkillsContextReason =
    'Current local Manage WRCF Skills page does not load any FG options for the available industryIds discovered from Manage Industry WRCF.';

  test.beforeAll(async ({ browser }) => {
    await assertLocalServicesReady();
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await context.close();
  });

  futureManageSkillsCase(
    'WSKILL-E2E-001',
    'redirected Manage WRCF Skills inherits the selected FG PWO SWO Capability and Proficiency',
    'Current Industry WRCF + Add Skills navigation only passes industryId, not the full CI filter path.'
  );

  futureManageSkillsCase(
    'WSKILL-E2E-002',
    'opening Manage WRCF Skills directly selects the first valid values automatically',
    'Current page loads FG options but leaves the 5 CI filters unselected until the user chooses them.'
  );

  test('WSKILL-E2E-003 @stable @p0 @manage-skills filter dropdowns expose only CI-backed options for the current selection chain', async () => {
    const skillsContextReady = await openSkillsPage(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await expect(filter(page, 0)).toBeVisible();
    await selectCiBackedPath(page);
    expect(await dropdownLabels(filter(page, 3), /^select capability/)).not.toHaveLength(0);
    expect(await dropdownLabels(filter(page, 4), /^select level/)).not.toHaveLength(0);
  });

  test('WSKILL-E2E-004 @stable @p0 @manage-skills filter values are shown in ascending order for each active dropdown', async () => {
    const skillsContextReady = await openSkillsPage(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    const fgLabels = await dropdownLabels(filter(page, 0), /^select fg/);
    await expectSorted(fgLabels);

    await selectFirstOption(filter(page, 0), /^select fg/);
    await expect.poll(
      async () => dropdownLabels(filter(page, 1), /^select pwo/),
      { timeout: 10000, message: 'Waiting for PWO options to load' }
    ).not.toHaveLength(0);
    await expectSorted(await dropdownLabels(filter(page, 1), /^select pwo/));

    await selectFirstOption(filter(page, 1), /^select pwo/);
    await expect.poll(
      async () => dropdownLabels(filter(page, 2), /^select swo/),
      { timeout: 10000, message: 'Waiting for SWO options to load' }
    ).not.toHaveLength(0);
    await expectSorted(await dropdownLabels(filter(page, 2), /^select swo/));
  });

  futureManageSkillsCase(
    'WSKILL-E2E-005',
    'first load applies filters automatically and loads skills without manual selection',
    'Current page requires explicit 5-filter selection unless a ciId query param is provided.'
  );

  test('WSKILL-E2E-006 @stable @p0 @manage-skills skills column resolves for the selected Capability Instance path', async () => {
    const skillsContextReady = await openSkillsPage(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await expect(column(page, 'Skills')).toBeVisible();
  });

  futureManageSkillsCase(
    'WSKILL-E2E-007',
    'task list shows only records for the selected skill',
    'Needs a deterministic CI path with at least two seeded skills and task data for both.'
  );

  futureManageSkillsCase(
    'WSKILL-E2E-008',
    'control point list shows only records for the selected task',
    'Needs a deterministic task with seeded control points plus a second task for comparison.'
  );

  futureManageSkillsCase(
    'WSKILL-E2E-009',
    'edit icon appears only for the selected skill task and control point rows',
    'Needs stable seeded rows in all three columns for edit-icon visibility checks.'
  );

  test('WSKILL-E2E-010 @stable @p0 @manage-skills changing the top CI filters clears stale downstream list state', async () => {
    const skillsContextReady = await openSkillsPage(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await expect(column(page, 'Skills')).toBeVisible();
    await filter(page, 0).selectOption({ index: 0 });
    await expect(filter(page, 1)).toHaveValue('');
    await expect(filter(page, 2)).toHaveValue('');
    await expect(filter(page, 3)).toHaveValue('');
    await expect(filter(page, 4)).toHaveValue('');
    await expect(column(page, 'Skills').locator('.item')).toHaveCount(0);
  });
});
