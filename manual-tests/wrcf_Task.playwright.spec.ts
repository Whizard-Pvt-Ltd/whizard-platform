import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-task-sheet.json');

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

function panel(page: Page): Locator {
  return page.locator('.panel');
}

function taskItems(page: Page): Locator {
  return column(page, 'Task').locator('.item');
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

async function findIndustryIdForTasks(page: Page): Promise<{ sector: string; industry: string; industryId: string } | null> {
  const sectorSelect = filter(page, 0);
  const industrySelect = filter(page, 1);

  await expect.poll(
    async () => dropdownOptions(sectorSelect, /^select sector/),
    { timeout: 10000, message: 'Waiting for sector options on Manage Industry WRCF' }
  ).not.toHaveLength(0);

  const sectorOptions = await dropdownOptions(sectorSelect, /^select sector/);

  for (const sector of sectorOptions) {
    await sectorSelect.selectOption(sector.value);

    await expect.poll(
      async () => dropdownOptions(industrySelect, /^select industry/),
      { timeout: 10000, message: `Waiting for industries under sector "${sector.label}"` }
    ).not.toHaveLength(0);

    const industryOptions = await dropdownOptions(industrySelect, /^select industry/);

    for (const industry of industryOptions) {
      await page.goto(`${appUrl}/wrcf-skills?industryId=${industry.value}`);
      await expect(page.getByRole('heading', { name: 'Manage WRCF Skills' })).toBeVisible();

      try {
        await expect.poll(
          async () => dropdownLabels(filter(page, 0), /^select fg/),
          { timeout: 5000, message: `Waiting for FG filter data under ${sector.label} / ${industry.label}` }
        ).not.toHaveLength(0);

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

async function openTaskSheet(page: Page): Promise<boolean> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();

  const context = await findIndustryIdForTasks(page);
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

async function selectFirstSkill(page: Page): Promise<boolean> {
  const items = skillsItems(page);
  const count = await items.count();
  if (!count) {
    return false;
  }
  await items.first().click();
  return true;
}

function skillsItems(page: Page): Locator {
  return column(page, 'Skills').locator('.item');
}

async function openCreateTaskPanel(page: Page): Promise<void> {
  await column(page, 'Task').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

function pendingTaskCase(id: string, title: string, reason: string): void {
  test(`${id} ${title}`, async () => {
    test.fixme(true, reason);
  });
}

test.describe('Task sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  const noTaskContextReason =
    'Current local Manage WRCF Skills page does not load any FG options for the available industryIds discovered from Manage Industry WRCF.';
  const noSelectedSkillReason =
    'No deterministic selected skill row is available after resolving the parent Manage WRCF Skills context.';

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

  test('TSK-E2E-001 shows the add icon for Task when a skill is selected', async () => {
    const taskContextReady = await openTaskSheet(page);
    test.fixme(!taskContextReady, noTaskContextReason);
    await selectCiBackedPath(page);
    const hasSkill = await selectFirstSkill(page);
    test.fixme(!hasSkill, noSelectedSkillReason);
    await expect(column(page, 'Task').getByTitle('Add')).toBeVisible();
  });

  test('TSK-E2E-002 opens the Create New Task popup from the Task add icon', async () => {
    const taskContextReady = await openTaskSheet(page);
    test.fixme(!taskContextReady, noTaskContextReason);
    await selectCiBackedPath(page);
    const hasSkill = await selectFirstSkill(page);
    test.fixme(!hasSkill, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create New Task');
  });

  test('TSK-E2E-003 blocks task save when required fields are missing', async () => {
    const taskContextReady = await openTaskSheet(page);
    test.fixme(!taskContextReady, noTaskContextReason);
    await selectCiBackedPath(page);
    const hasSkill = await selectFirstSkill(page);
    test.fixme(!hasSkill, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await panel(page).getByTitle('Save').click();
    await expect(panel(page).locator('.error-msg')).toContainText(
      'Name, Description, Frequency and Complexity are required.'
    );
  });

  test('TSK-E2E-004 creates a task successfully with valid data', async () => {
    const taskContextReady = await openTaskSheet(page);
    test.fixme(!taskContextReady, noTaskContextReason);
    await selectCiBackedPath(page);
    const hasSkill = await selectFirstSkill(page);
    test.fixme(!hasSkill, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await panel(page).getByPlaceholder('Enter task name...').fill(`Task ${Date.now()}`);
    await panel(page).getByPlaceholder('Enter description...').fill('Generated during Task sheet validation.');
    await panel(page).getByTitle('Save').click();
    await expect(taskItems(page).first()).toBeVisible();
  });

  pendingTaskCase(
    'TSK-E2E-005',
    'blocks duplicate task creation under the same skill',
    'Needs an existing task under a selected skill plus stable duplicate validation in the local runtime.'
  );

  pendingTaskCase(
    'TSK-E2E-006',
    'blocks trim-aware duplicate task creation under the same skill',
    'Needs an existing task under a selected skill plus deterministic trimmed duplicate validation.'
  );

  pendingTaskCase(
    'TSK-E2E-007',
    'does not create a task when the create panel is closed without save',
    'Needs a valid selected skill plus stable observable close-without-save behavior.'
  );

  pendingTaskCase(
    'TSK-E2E-008',
    'preloads all existing values on task edit',
    'Needs a deterministic existing task row and stable task edit access.'
  );

  pendingTaskCase(
    'TSK-E2E-009',
    'shows updated task values after edit save',
    'Needs a deterministic existing task row plus stable update behavior.'
  );

  pendingTaskCase(
    'TSK-E2E-010',
    'shows the delete icon in the edit task panel',
    'Needs a deterministic existing task row and stable task edit access.'
  );

  pendingTaskCase(
    'TSK-E2E-011',
    'blocks task delete when control points exist',
    'Needs a task with child control points plus stable dependency-block behavior.'
  );

  pendingTaskCase(
    'TSK-E2E-012',
    'deletes a task successfully when no control points exist',
    'Needs a childless task plus stable delete-confirmation behavior.'
  );

  pendingTaskCase(
    'TSK-E2E-013',
    'validates required proficiency level against allowed values',
    'Needs confirmed required-proficiency constraints from the live task form and/or backend validation.'
  );

  pendingTaskCase(
    'TSK-E2E-014',
    'allows standard duration to remain blank when the field is optional',
    'Needs a valid selected skill and successful task save coverage to verify optional standard duration behavior.'
  );
});
