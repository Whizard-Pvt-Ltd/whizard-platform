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

function taskNames(page: Page): Locator {
  return column(page, 'Task').locator('.item-name');
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

function fgItems(page: Page): Locator {
  return column(page, 'Functional Group').locator('.item');
}

function mappingsDialog(page: Page): Locator {
  return page.locator('.dialog-panel');
}

function proficiencyItems(page: Page): Locator {
  return column(page, 'Proficiency Level').locator('.item');
}

function savedProficiencyRows(page: Page): Locator {
  return proficiencyItems(page).filter({ has: page.locator('.checkbox-btn.saved') });
}

function unmappedProficiencyRows(page: Page): Locator {
  return proficiencyItems(page).filter({ has: page.locator('.checkbox-btn:not(.saved):not(.checked)') });
}

async function openIndustryWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();
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
    async () => fgItems(page).count(),
    { timeout: 10000, message: 'Waiting for Functional Group rows on Manage Industry WRCF' }
  ).toBeGreaterThan(0);
}

async function clickFirstHierarchyItem(page: Page, title: string): Promise<void> {
  const item = column(page, title).locator('.item').first();
  await expect(item).toBeVisible();
  await item.click();
}

async function ensureSelectedCiOnIndustryWrcf(page: Page): Promise<void> {
  await openIndustryWrcf(page);
  await ensureIndustryContext(page);
  await clickFirstHierarchyItem(page, 'Functional Group');
  await clickFirstHierarchyItem(page, 'Primary Work Obj.');
  await clickFirstHierarchyItem(page, 'Secondary Work Obj.');
  await clickFirstHierarchyItem(page, 'Capabilities');
  await expect(proficiencyItems(page).first()).toBeVisible();

  if ((await savedProficiencyRows(page).count()) > 0) {
    return;
  }

  const unmapped = unmappedProficiencyRows(page).first();
  await expect(unmapped).toBeVisible();
  await unmapped.locator('.checkbox-btn').click();
  await openMappingsDialog(page);
  await mappingsDialog(page).locator('.btn-save').click();
  await expect(mappingsDialog(page)).not.toBeVisible();
  await expect(savedProficiencyRows(page).first()).toBeVisible();
}

async function enterManageSkillsFromSelectedCi(page: Page): Promise<boolean> {
  await ensureSelectedCiOnIndustryWrcf(page);
  await openMappingsDialog(page);
  const skillPlus = page.getByRole('button', { name: 'Skill+' }).first();
  if ((await page.getByRole('button', { name: 'Skill+' }).count()) === 0) {
    await closeMappingsDialog(page);
    return false;
  }
  await skillPlus.click();
  await expect(page.getByRole('heading', { name: 'Manage WRCF Skills' })).toBeVisible();
  await expect(page).toHaveURL(/capabilityInstanceId=/);
  return true;
}

async function openMappingsDialog(page: Page): Promise<void> {
  await page.getByRole('button', { name: /mappings/i }).click();
  await expect(page.getByRole('heading', { name: 'Manage CI Mappings' })).toBeVisible();
}

async function closeMappingsDialog(page: Page): Promise<void> {
  await page.locator('.dialog-panel .close-btn').click();
  await expect(page.getByRole('heading', { name: 'Manage CI Mappings' })).not.toBeVisible();
}

async function openTaskSheetFromSelectedCi(page: Page): Promise<boolean> {
  return enterManageSkillsFromSelectedCi(page);
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function taskRow(page: Page, name: string): Locator {
  return column(page, 'Task')
    .locator('.item')
    .filter({ has: page.locator('.item-name', { hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }) })
    .first();
}

async function openEditTaskPanel(page: Page, itemName: string): Promise<void> {
  const row = taskRow(page, itemName);
  await expect(row).toBeVisible();
  await row.click();
  await column(page, 'Task').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

async function closePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Close').click();
  await expect(panel(page)).not.toBeVisible();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function createTask(
  page: Page,
  name: string,
  options?: { description?: string; standardDuration?: string; requiredProficiencyValue?: string }
): Promise<void> {
  await openCreateTaskPanel(page);
  await panel(page).getByPlaceholder('Enter task name...').fill(name);
  await panel(page)
    .getByPlaceholder('Enter description...')
    .fill(options?.description ?? 'Generated during Task sheet validation.');
  await panel(page).getByRole('combobox').nth(0).selectOption({ index: 0 });
  await panel(page).getByRole('combobox').nth(1).selectOption({ index: 0 });
  await panel(page).getByPlaceholder('Optional').fill(options?.standardDuration ?? '30');
  if (options?.requiredProficiencyValue) {
    await panel(page).getByRole('combobox').nth(2).selectOption(options.requiredProficiencyValue);
  }
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(taskRow(page, name)).toBeVisible();
}

async function createSkill(page: Page, name: string): Promise<void> {
  await column(page, 'Skills').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByPlaceholder('Enter skill name...').fill(name);
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(skillsItems(page).first()).toBeVisible();
}

async function assertTaskContextReady(page: Page, runtimeBlocker: string): Promise<void> {
  const taskContextReady = await openTaskSheetFromSelectedCi(page);
  if (!taskContextReady) {
    throw new Error(runtimeBlocker);
  }
}

async function assertSelectedSkill(page: Page, skillBlocker: string): Promise<void> {
  let hasSkill = await selectFirstSkill(page);
  if (!hasSkill && (await column(page, 'Skills').getByTitle('Add').count()) > 0) {
    await createSkill(page, `Skill ${Date.now()}`);
    hasSkill = await selectFirstSkill(page);
  }
  if (!hasSkill) {
    throw new Error(skillBlocker);
  }
}

async function firstExistingTaskName(page: Page, blocker: string): Promise<string> {
  const count = await taskItems(page).count();
  if (!count) {
    throw new Error(blocker);
  }
  const text = (await taskNames(page).first().textContent())?.trim();
  if (!text) {
    throw new Error(blocker);
  }
  return text;
}

async function openCreateTaskPanel(page: Page): Promise<void> {
  await column(page, 'Task').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

test.describe('Task sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  const noTaskContextReason =
    'Current local workflow cannot create or reuse a selected capability instance and enter Manage WRCF Skills through Skill+ from Manage CI Mappings.';
  const noSelectedSkillReason =
    'No deterministic selected skill row is available after entering Manage WRCF Skills from the selected capability instance, and the local runtime could not create one.';
  const noExistingTaskReason =
    'No deterministic existing task row is available under the selected skill for edit/delete coverage.';
  const noDuplicateTaskReason =
    'No deterministic existing task row is available under the selected skill for duplicate validation.';

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

  test('TSK-E2E-001 @stable @p0 @task shows the add icon for Task when a skill is selected', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await expect(column(page, 'Task').getByTitle('Add')).toBeVisible();
  });

  test('TSK-E2E-002 @stable @p0 @task opens the Create New Task popup from the Task add icon', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create New Task');
  });

  test('TSK-E2E-003 @stable @p0 @task blocks task save when required fields are missing', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await savePanel(page);
    await expect(panel(page).locator('.error-msg')).toContainText(
      'Name, Description, Frequency, Complexity and Standard Duration are required.'
    );
  });

  test('TSK-E2E-004 @stable @p0 @task creates a task successfully with valid data', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await createTask(page, `Task ${Date.now()}`);
  });

  test('TSK-E2E-005 @future @p1 @task @blocked-data blocks duplicate task creation under the same skill', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noDuplicateTaskReason);
    await openCreateTaskPanel(page);
    await panel(page).getByPlaceholder('Enter task name...').fill(existingTask);
    await panel(page).getByPlaceholder('Enter description...').fill('Duplicate task validation.');
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 0 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 0 });
    await panel(page).getByPlaceholder('Optional').fill('30');
    await savePanel(page);
    await expect(panel(page).locator('.error-msg')).not.toHaveText('');
  });

  test('TSK-E2E-006 @future @p1 @task @blocked-data blocks trim-aware duplicate task creation under the same skill', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noDuplicateTaskReason);
    await openCreateTaskPanel(page);
    await panel(page).getByPlaceholder('Enter task name...').fill(`${existingTask}   `);
    await panel(page).getByPlaceholder('Enter description...').fill('Trim-aware duplicate task validation.');
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 0 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 0 });
    await panel(page).getByPlaceholder('Optional').fill('30');
    await savePanel(page);
    await expect(panel(page).locator('.error-msg')).not.toHaveText('');
  });

  test('TSK-E2E-007 @future @p2 @task does not create a task when the create panel is closed without save', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const beforeCount = await taskItems(page).count();
    await openCreateTaskPanel(page);
    await panel(page).getByPlaceholder('Enter task name...').fill(`Task Unsaved ${Date.now()}`);
    await closePanel(page);
    await expect(taskItems(page)).toHaveCount(beforeCount);
  });

  test('TSK-E2E-008 @future @p1 @task @blocked-data preloads all existing values on task edit', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noExistingTaskReason);
    await openEditTaskPanel(page, existingTask);
    await expect(panel(page).getByPlaceholder('Enter task name...')).toHaveValue(existingTask);
    await expect(panel(page).getByPlaceholder('Enter description...')).not.toHaveValue('');
    await expect(panel(page).getByRole('combobox').nth(0)).not.toHaveValue('');
    await expect(panel(page).getByRole('combobox').nth(1)).not.toHaveValue('');
  });

  test('TSK-E2E-009 @future @p1 @task @blocked-data shows updated task values after edit save', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noExistingTaskReason);
    const updatedTask = `${existingTask} Updated`;
    await openEditTaskPanel(page, existingTask);
    await panel(page).getByPlaceholder('Enter task name...').fill(updatedTask);
    await panel(page).getByPlaceholder('Enter description...').fill('Updated task description.');
    await savePanel(page);
    await expect(taskRow(page, updatedTask)).toBeVisible();
  });

  test('TSK-E2E-010 @future @p1 @task @blocked-data shows the delete icon in the edit task panel', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noExistingTaskReason);
    await openEditTaskPanel(page, existingTask);
    await expect(panel(page).getByTitle('Delete')).toBeVisible();
  });

  test('TSK-E2E-011 @future @p1 @task @blocked-data blocks task delete when control points exist', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const existingTask = await firstExistingTaskName(page, noExistingTaskReason);
    await openEditTaskPanel(page, existingTask);
    await panel(page).getByTitle('Delete').click();
    await expect(panel(page).locator('.error-msg')).not.toHaveText('');
  });

  test('TSK-E2E-012 @future @p1 @task @blocked-data deletes a task successfully when no control points exist', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    const taskName = `Task Delete ${Date.now()}`;
    await createTask(page, taskName);
    await openEditTaskPanel(page, taskName);
    await panel(page).getByTitle('Delete').click();
    await expect(taskRow(page, taskName)).toHaveCount(0);
  });

  test('TSK-E2E-013 @future @p2 @task validates required proficiency level against allowed values', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    const proficiencySelect = panel(page).getByRole('combobox').nth(2);
    const options = await proficiencySelect.locator('option').evaluateAll(options =>
      options.map(option => ({
        label: (option as HTMLOptionElement).textContent?.trim() || '',
        value: (option as HTMLOptionElement).value || '',
      }))
    );
    expect(options[0]?.label).toMatch(/select level/i);
    expect(options.slice(1).every(option => Boolean(option.label && option.value))).toBe(true);
  });

  test('TSK-E2E-014 @future @p2 @task allows standard duration to remain blank when the field is optional', async () => {
    await assertTaskContextReady(page, noTaskContextReason);
    await assertSelectedSkill(page, noSelectedSkillReason);
    await openCreateTaskPanel(page);
    await panel(page).getByPlaceholder('Enter task name...').fill(`Task Optional ${Date.now()}`);
    await panel(page).getByPlaceholder('Enter description...').fill('Optional standard duration coverage.');
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 0 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 0 });
    await panel(page).getByPlaceholder('Optional').fill('');
    await savePanel(page);
    await expect(panel(page)).not.toBeVisible();
  });
});
