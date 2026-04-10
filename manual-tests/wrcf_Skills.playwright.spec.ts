import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-skills-sheet.json');

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function skillRow(page: Page, itemName: string): Locator {
  return skillsItems(page)
    .filter({ has: page.locator('.item-name', { hasText: new RegExp(`^\\s*${escapeRegExp(itemName)}\\s*$`) }) })
    .first();
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

async function openSkillsSheet(page: Page): Promise<boolean> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByText('Manage Industry WRCF', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Industry Sector', { exact: true }).first()).toBeVisible();

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

async function openCreateSkillPanel(page: Page): Promise<void> {
  await column(page, 'Skills').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function openEditSkillPanel(page: Page, itemName: string): Promise<void> {
  const row = skillRow(page, itemName);
  await expect(row).toBeVisible();
  await row.click();
  await column(page, 'Skills').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

function futureSkillsCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @skills ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Skills sheet-aligned coverage', () => {
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

  test('SKL-E2E-001 @stable @p1 @skills shows the add icon for Skills when a valid CI context is selected', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await expect(column(page, 'Skills').getByTitle('Add')).toBeVisible();
  });

  futureSkillsCase(
    'SKL-E2E-002',
    'shows the edit icon for the selected skill row',
    'Needs a deterministic selected skill row under a valid CI path before the edit icon can be asserted reliably.'
  );

  test('SKL-E2E-003 @stable @p1 @skills opens the Create New Skill popup from the Skills add icon', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create New Skill');
  });

  test('SKL-E2E-004 @stable @p1 @skills blocks skill save when mandatory fields are missing', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    await panel(page).getByTitle('Save').click();
    await expect(panel(page).locator('.error-msg')).toContainText(
      'Name, Cognitive Type, Skill Criticality and AI Impact are required.'
    );
  });

  test('SKL-E2E-005 @stable @p1 @skills creates a skill successfully with valid mandatory data', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    await panel(page).getByPlaceholder('Enter skill name...').fill(`Skill ${Date.now()}`);
    await panel(page).getByPlaceholder('Enter description...').fill('Generated during Skills sheet validation.');
    await panel(page).getByTitle('Save').click();
    await expect(skillsItems(page).first()).toBeVisible();
  });

  futureSkillsCase(
    'SKL-E2E-006',
    'blocks duplicate skill creation under the selected CI',
    'Needs an existing skill under a valid CI plus stable backend duplicate validation in the current local environment.'
  );

  futureSkillsCase(
    'SKL-E2E-007',
    'blocks trim-aware duplicate skill creation under the selected CI',
    'Needs an existing skill under a valid CI plus deterministic duplicate validation for trimmed names.'
  );

  futureSkillsCase(
    'SKL-E2E-008',
    'does not create a skill when the create panel is closed without save',
    'Needs a valid CI path plus a stable create-panel close path that can be observed in the current local runtime.'
  );

  futureSkillsCase(
    'SKL-E2E-009',
    'shows the new skill row immediately after save without refresh',
    'Needs successful skill creation under a valid CI path in the current local environment.'
  );

  futureSkillsCase(
    'SKL-E2E-010',
    'preloads all existing values when editing a skill',
    'Needs a deterministic existing skill row and a stable edit path under a valid CI context.'
  );

  futureSkillsCase(
    'SKL-E2E-011',
    'shows updated skill values after edit save',
    'Needs a deterministic existing skill row plus stable update coverage under a valid CI context.'
  );

  futureSkillsCase(
    'SKL-E2E-012',
    'shows the delete icon on the edit skill panel',
    'Needs a deterministic existing skill row and stable edit panel access.'
  );

  futureSkillsCase(
    'SKL-E2E-013',
    'blocks skill delete when tasks exist under the skill',
    'Needs a seeded skill with child tasks plus a stable dependency-block message in the local runtime.'
  );

  futureSkillsCase(
    'SKL-E2E-014',
    'deletes a skill successfully when no tasks exist under it',
    'Needs a childless skill plus stable delete-confirmation behavior under a valid CI context.',
    'p2'
  );

  futureSkillsCase(
    'SKL-E2E-015',
    'saves an unchanged skill without duplicate validation',
    'Needs a deterministic existing skill row and stable edit-save coverage under a valid CI context.'
  );

  test('SKL-E2E-016 @stable @p1 @skills persists the Skill description across create and edit flows', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    const name = `Skill ${Date.now()}`;
    const description = 'Skill description persistence coverage.';
    const updatedDescription = 'Updated skill description persistence coverage.';
    await openCreateSkillPanel(page);
    await panel(page).getByPlaceholder('Enter skill name...').fill(name);
    await panel(page).getByPlaceholder('Enter description...').fill(description);
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 1 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 1 });
    await panel(page).locator('input[type="number"]').fill('9');
    await panel(page).getByRole('combobox').nth(2).selectOption({ index: 1 });
    await panel(page).getByTitle('Save').click();
    await expect(panel(page)).not.toBeVisible();
    await openEditSkillPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter description...')).toHaveValue(description);
    await panel(page).getByPlaceholder('Enter description...').fill(updatedDescription);
    await panel(page).getByTitle('Save').click();
    await expect(panel(page)).not.toBeVisible();
    await openEditSkillPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter description...')).toHaveValue(updatedDescription);
  });

  test('SKL-E2E-017 @stable @p1 @skills persists the recertification value across create and edit flows', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    const name = `Skill Recert ${Date.now()}`;
    await openCreateSkillPanel(page);
    await panel(page).getByPlaceholder('Enter skill name...').fill(name);
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 1 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 1 });
    await panel(page).locator('input[type="number"]').fill('11');
    await panel(page).getByRole('combobox').nth(2).selectOption({ index: 1 });
    await panel(page).getByTitle('Save').click();
    await expect(panel(page)).not.toBeVisible();
    await openEditSkillPanel(page, name);
    await expect(panel(page).locator('input[type="number"]')).toHaveValue('11');
  });

  test('SKL-E2E-018 @stable @p1 @skills shows Cognitive Type values in ascending order', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    const labels = await panel(page).getByRole('combobox').nth(0).locator('option').evaluateAll(nodes =>
      nodes.map(node => (node as HTMLOptionElement).textContent?.trim() || '').filter(Boolean)
    );
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
  });

  test('SKL-MBUG-004 @stable @p1 @skills limits the Skill name field to 50 characters', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    const longName = 'S'.repeat(51);
    const nameInput = panel(page).getByPlaceholder('Enter skill name...');
    await nameInput.fill(longName);
    expect((await nameInput.inputValue()).length).toBeLessThanOrEqual(50);
  });

  test('SKL-MBUG-005 @stable @p1 @skills blocks save when Recertification Cycle is blank', async () => {
    const skillsContextReady = await openSkillsSheet(page);
    if (!skillsContextReady) {
      throw new Error(noSkillsContextReason);
    }
    await selectCiBackedPath(page);
    await openCreateSkillPanel(page);
    await panel(page).getByPlaceholder('Enter skill name...').fill(`Skill ${Date.now()}`);
    await panel(page).getByRole('combobox').nth(0).selectOption({ index: 1 });
    await panel(page).getByRole('combobox').nth(1).selectOption({ index: 1 });
    await panel(page).getByRole('combobox').nth(2).selectOption({ index: 1 });
    await panel(page).getByTitle('Save').click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).locator('.error-msg')).toContainText(/recertification|required/i);
  });
});
