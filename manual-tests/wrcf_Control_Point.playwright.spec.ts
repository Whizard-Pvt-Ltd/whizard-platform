import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-control-point-sheet.json');

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

function skillsItems(page: Page): Locator {
  return column(page, 'Skills').locator('.item');
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

async function openIndustryWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByText('Manage Industry WRCF', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Industry Sector', { exact: true }).first()).toBeVisible();
}

async function ensureIndustryContext(page: Page): Promise<void> {
  const sectorSelect = filter(page, 0);
  const industrySelect = filter(page, 1);

  await expect.poll(
    async () => dropdownOptions(sectorSelect, /^select sector/),
    { timeout: 10000, message: 'Waiting for sector options on Manage Industry WRCF' }
  ).not.toHaveLength(0);

  const sectorOptions = await dropdownOptions(sectorSelect, /^select sector/);
  if (!(await sectorSelect.inputValue()) && sectorOptions.length) {
    await sectorSelect.selectOption(sectorOptions[0].value);
  }

  await expect.poll(
    async () => dropdownOptions(industrySelect, /^select industry/),
    { timeout: 10000, message: 'Waiting for industry options on Manage Industry WRCF' }
  ).not.toHaveLength(0);

  const industryOptions = await dropdownOptions(industrySelect, /^select industry/);
  if (!(await industrySelect.inputValue()) && industryOptions.length) {
    await industrySelect.selectOption(industryOptions[0].value);
  }

  await expect.poll(
    async () => column(page, 'Functional Group').locator('.item').count(),
    { timeout: 10000, message: 'Waiting for Functional Group rows on Manage Industry WRCF' }
  ).toBeGreaterThan(0);
}

async function openManageSkillsFromAddSkills(page: Page): Promise<void> {
  await openIndustryWrcf(page);
  await ensureIndustryContext(page);
  await page.getByRole('button', { name: /\+?\s*add skills/i }).click();
  await expect(page.getByRole('heading', { name: 'Manage WRCF Skills' })).toBeVisible();
  await expect(page).toHaveURL(/\/wrcf-skills/);
}

async function selectManageSkillsPath(page: Page): Promise<void> {
  await expect.poll(
    async () => dropdownLabels(filter(page, 0), /^select fg/),
    { timeout: 10000, message: 'Waiting for FG options on Manage WRCF Skills' }
  ).not.toHaveLength(0);
  if (!(await filter(page, 0).inputValue())) {
    await selectFirstOption(filter(page, 0), /^select fg/);
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 1), /^select pwo/),
    { timeout: 10000, message: 'Waiting for PWO options on Manage WRCF Skills' }
  ).not.toHaveLength(0);
  if (!(await filter(page, 1).inputValue())) {
    await selectFirstOption(filter(page, 1), /^select pwo/);
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 2), /^select swo/),
    { timeout: 10000, message: 'Waiting for SWO options on Manage WRCF Skills' }
  ).not.toHaveLength(0);
  if (!(await filter(page, 2).inputValue())) {
    await selectFirstOption(filter(page, 2), /^select swo/);
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 3), /^select capability/),
    { timeout: 10000, message: 'Waiting for capability options on Manage WRCF Skills' }
  ).not.toHaveLength(0);
  if (!(await filter(page, 3).inputValue())) {
    await selectFirstOption(filter(page, 3), /^select capability/);
  }

  await expect.poll(
    async () => dropdownLabels(filter(page, 4), /^select level/),
    { timeout: 10000, message: 'Waiting for proficiency options on Manage WRCF Skills' }
  ).not.toHaveLength(0);
  if (!(await filter(page, 4).inputValue())) {
    await selectFirstOption(filter(page, 4), /^select level/);
  }
}

async function openControlPointSheetFromManageSkills(page: Page): Promise<boolean> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await openManageSkillsFromAddSkills(page);
      await selectManageSkillsPath(page);
      return true;
    } catch (error) {
      lastError = error;
      await page.goto(`${appUrl}/industry-wrcf`).catch(() => undefined);
    }
  }

  if (lastError) {
    throw lastError;
  }
  return false;
}

async function selectFirstSkill(page: Page): Promise<boolean> {
  const items = skillsItems(page);
  if (!(await items.count())) {
    return false;
  }
  await items.first().click();
  return true;
}

async function selectFirstTask(page: Page): Promise<boolean> {
  const items = taskItems(page);
  if (!(await items.count())) {
    return false;
  }
  await items.first().click();
  return true;
}

async function waitForTaskRows(page: Page): Promise<boolean> {
  try {
    await expect.poll(
      async () => taskItems(page).count(),
      { timeout: 3000, message: 'Waiting for task rows under the selected skill' }
    ).toBeGreaterThan(0);
    return true;
  } catch {
    return false;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function taskRow(page: Page, name: string): Locator {
  return column(page, 'Task')
    .locator('.item')
    .filter({ has: page.locator('.item-name', { hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }) })
    .first();
}

function controlPointRow(page: Page, name: string): Locator {
  return column(page, 'Control Point')
    .locator('.item')
    .filter({ has: page.locator('.item-name', { hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }) })
    .first();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function openCreateSkillPanel(page: Page): Promise<void> {
  await column(page, 'Skills').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function createSkill(page: Page, name: string): Promise<void> {
  await openCreateSkillPanel(page);
  await panel(page).getByPlaceholder('Enter skill name...').fill(name);
  await panel(page).getByPlaceholder('Enter description...').fill('Generated during Control Point sheet validation.');
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
}

async function openCreateTaskPanel(page: Page): Promise<void> {
  await column(page, 'Task').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function createTask(page: Page, name: string): Promise<void> {
  await openCreateTaskPanel(page);
  await panel(page).getByPlaceholder('Enter task name...').fill(name);
  await panel(page).getByPlaceholder('Enter description...').fill('Generated during Control Point sheet validation.');
  await panel(page).getByRole('combobox').nth(0).selectOption({ index: 0 });
  await panel(page).getByRole('combobox').nth(1).selectOption({ index: 0 });
  await panel(page).getByPlaceholder('Optional').fill('30');
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(taskRow(page, name)).toBeVisible();
}

async function openCreateControlPointPanel(page: Page): Promise<void> {
  await column(page, 'Control Point').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function createControlPoint(
  page: Page,
  name: string,
  options?: { description?: string; kpiThreshold?: string }
): Promise<void> {
  await openCreateControlPointPanel(page);
  await panel(page).getByPlaceholder('Enter control point name...').fill(name);
  await panel(page).getByPlaceholder('Enter description...').fill(
    options?.description ?? 'Generated during Control Point sheet validation.'
  );
  if (options?.kpiThreshold) {
    await panel(page).getByPlaceholder('Optional').fill(options.kpiThreshold);
  }

  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(controlPointRow(page, name)).toBeVisible();
}

async function assertControlPointContextReady(page: Page, blocker: string): Promise<void> {
  const ready = await openControlPointSheetFromManageSkills(page);
  if (!ready) {
    throw new Error(blocker);
  }
}

async function assertSelectedSkill(page: Page, blocker: string): Promise<void> {
  let hasSkill = await selectFirstSkill(page);
  if (!hasSkill && (await column(page, 'Skills').getByTitle('Add').count()) > 0) {
    await createSkill(page, `Skill ${Date.now()}`);
    hasSkill = await selectFirstSkill(page);
  }
  if (!hasSkill) {
    throw new Error(blocker);
  }
}

async function assertSelectedTask(page: Page, skillBlocker: string, taskBlocker: string): Promise<void> {
  await assertSelectedSkill(page, skillBlocker);
  let hasTask = await waitForTaskRows(page);
  if (hasTask) {
    hasTask = await selectFirstTask(page);
  }
  if (!hasTask && (await column(page, 'Task').getByTitle('Add').count()) > 0) {
    await createTask(page, `Task ${Date.now()}`);
    hasTask = await selectFirstTask(page);
  }
  if (!hasTask) {
    throw new Error(taskBlocker);
  }
}

function futureControlPointCase(
  id: string,
  title: string,
  reason: string,
  priority: 'p0' | 'p1' | 'p2' = 'p1'
): void {
  test(`${id} @future @${priority} @control-point ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Control Point sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  const noControlPointContextReason =
    'Current local workflow cannot enter Manage WRCF Skills through + Add Skills and resolve the FG/PWO/SWO/Capability/Level selection path needed for Control Point coverage.';
  const noSelectedSkillReason =
    'No deterministic selected skill row is available after entering Manage WRCF Skills from + Add Skills, and the local runtime could not create one.';
  const noSelectedTaskReason =
    'No deterministic selected task row is available under the selected skill, and the local runtime could not create one.';
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

  test('CP-E2E-001 @stable @p1 @control-point uses Control Point terminology in the column and create panel', async () => {
    await assertControlPointContextReady(page, noControlPointContextReason);
    await assertSelectedTask(page, noSelectedSkillReason, noSelectedTaskReason);
    await expect(page.locator('.column-title', { hasText: 'Control Point' })).toBeVisible();
    await openCreateControlPointPanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create New Control Point');
  });

  test('CP-E2E-002 @stable @p1 @control-point shows the add icon for Control Point when a task is selected', async () => {
    await assertControlPointContextReady(page, noControlPointContextReason);
    await assertSelectedTask(page, noSelectedSkillReason, noSelectedTaskReason);
    await expect(column(page, 'Control Point').getByTitle('Add')).toBeVisible();
  });

  test('CP-E2E-003 @stable @p1 @control-point opens the Create New Control Point popup from the Control Point add icon', async () => {
    await assertControlPointContextReady(page, noControlPointContextReason);
    await assertSelectedTask(page, noSelectedSkillReason, noSelectedTaskReason);
    await openCreateControlPointPanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create New Control Point');
  });

  test('CP-E2E-004 @stable @p0 @control-point blocks save when required fields are missing', async () => {
    await assertControlPointContextReady(page, noControlPointContextReason);
    await assertSelectedTask(page, noSelectedSkillReason, noSelectedTaskReason);
    await openCreateControlPointPanel(page);
    await savePanel(page);
    await expect(panel(page).locator('.error-msg')).toContainText('Name, Risk Level and Failure Impact Type are required.');
  });

  test('CP-E2E-005 @stable @p0 @control-point creates a control point successfully with valid data', async () => {
    await assertControlPointContextReady(page, noControlPointContextReason);
    await assertSelectedTask(page, noSelectedSkillReason, noSelectedTaskReason);
    await createControlPoint(page, `Control Point ${Date.now()}`);
  });

  futureControlPointCase(
    'CP-E2E-006',
    'blocks duplicate control point creation under the same task',
    'Needs a deterministic existing control point row plus stable duplicate validation in the current local runtime.'
  );

  futureControlPointCase(
    'CP-E2E-007',
    'blocks trim-aware duplicate control point creation under the same task',
    'Needs a deterministic existing control point row plus stable duplicate validation for trimmed names.'
  );

  futureControlPointCase(
    'CP-E2E-008',
    'does not create a control point when the create panel is closed without save',
    'Needs a stable close-without-save path under a selected task to confirm list state remains unchanged.'
  );

  futureControlPointCase(
    'CP-E2E-009',
    'preloads all existing values on control point edit',
    'Needs a deterministic existing control point row plus verified field parity for edit-preload coverage.',
    'p0'
  );

  futureControlPointCase(
    'CP-E2E-010',
    'shows updated control point values after edit save',
    'Needs a deterministic existing control point row and stable update coverage under the selected task.',
    'p0'
  );

  futureControlPointCase(
    'CP-E2E-011',
    'shows the delete icon in the edit control point panel',
    'Needs a deterministic existing control point row and stable edit-panel access.'
  );

  futureControlPointCase(
    'CP-E2E-012',
    'deletes a control point successfully',
    'Needs a deterministic childless control point row plus stable delete confirmation under the selected task.'
  );

  futureControlPointCase(
    'CP-E2E-013',
    'allows save without KPI threshold when the field is optional',
    'Needs a dedicated boundary run because the current stable create case already overlaps with blank-KPI behavior.',
    'p2'
  );

  futureControlPointCase(
    'CP-E2E-014',
    'shows only valid enum values for Risk Level, Failure Impact Type, Escalation Required, and Evidence Type',
    'Needs source clarification because the UI marks Escalation Required and Evidence Type as required, but the current component model/enforcement does not fully expose their allowed values.',
    'p0'
  );

  futureControlPointCase(
    'CP-MBUG-001',
    'manual coverage gap remains blocked until the local Control Point workflow is fully reachable',
    noControlPointContextReason
  );

  futureControlPointCase(
    'CP-MBUG-002',
    'existing Control Points should expose an edit action',
    'Needs a deterministic existing Control Point row plus stable edit-action rendering in the current local workflow.'
  );
});
