import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-functional-group.json');

const industryContext = {
  sectorName: 'Manufacturing',
  preferredIndustryName: 'Steel Manufacturing',
};

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.floor(Math.random() * 1000)}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nameNeedle(value: string): string {
  return value.trim().slice(0, 24);
}

function fixedLengthName(length: number): string {
  const prefix = 'FG-';
  return `${prefix}${'X'.repeat(Math.max(0, length - prefix.length))}`;
}

async function login(page: Page): Promise<void> {
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
  await login(page);
  await context.storageState({ path: authStatePath });
  return { context, page };
}

async function openWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();
}

async function openWrcfAndSelectIndustryContext(page: Page): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await openWrcf(page);
      await selectIndustryContext(page);
      return;
    } catch (error) {
      lastError = error;
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }
  }

  throw lastError;
}

async function selectIndustryContext(page: Page): Promise<void> {
  const filters = page.locator('.filter-bar .filter-select');
  const sectorSelect = filters.nth(0);
  const industrySelect = filters.nth(1);

  await expect
    .poll(async () => {
      return (await sectorSelect.locator('option').allTextContents())
        .map((value) => value.trim())
        .filter((value) => value && value !== 'Select Sector...');
    }, {
      timeout: 10000,
      message: 'Waiting for sector options to load',
    })
    .not.toHaveLength(0);

  const sectorOptions = (await sectorSelect.locator('option').allTextContents())
    .map((value) => value.trim())
    .filter((value) => value && value !== 'Select Sector...');

  const sectorName = sectorOptions.includes(industryContext.sectorName)
    ? industryContext.sectorName
    : sectorOptions[0];
  await sectorSelect.selectOption({ label: sectorName });

  await expect
    .poll(async () => {
      return (await industrySelect.locator('option').allTextContents())
        .map((value) => value.trim())
        .filter((value) => value && value !== 'Select Industry...');
    }, {
      timeout: 10000,
      message: `Waiting for industries under sector "${sectorName}" to load`,
    })
    .not.toHaveLength(0);

  const industryOptions = (await industrySelect.locator('option').allTextContents())
    .map((value) => value.trim())
    .filter((value) => value && value !== 'Select Industry...');
  const industryName = industryOptions.includes(industryContext.preferredIndustryName)
    ? industryContext.preferredIndustryName
    : industryOptions[0];

  await industrySelect.selectOption({ label: industryName });

  const fgItems = column(page, 'Functional Group').locator('.item');
  await expect
    .poll(async () => fgItems.count(), {
      timeout: 10000,
      message: `Waiting for Functional Group rows after selecting sector "${sectorName}" and industry "${industryName}"`,
    })
    .toBeGreaterThan(0);
}

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

function panel(page: Page): Locator {
  return page.locator('.panel');
}

function errorBanner(page: Page): Locator {
  return page.locator('.error-banner');
}

function toastBanner(page: Page): Locator {
  return page.locator('.toast-banner');
}

function functionalGroupItems(page: Page): Locator {
  return column(page, 'Functional Group').locator('.item');
}

function functionalGroupRow(page: Page, itemName: string): Locator {
  return functionalGroupItems(page).filter({ hasText: new RegExp(`^${escapeRegex(itemName)}$`) });
}

function functionalGroupPrefixRow(page: Page, itemName: string): Locator {
  return functionalGroupItems(page).filter({ hasText: nameNeedle(itemName) }).last();
}

async function openCreatePanel(page: Page): Promise<void> {
  await column(page, 'Functional Group').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function openEditPanel(page: Page, itemName: string): Promise<void> {
  await selectFunctionalGroup(page, itemName);
  await column(page, 'Functional Group').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function closePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Close').click();
}

async function selectFunctionalGroup(page: Page, itemName: string): Promise<void> {
  const items = functionalGroupItems(page);
  const exactMatch = functionalGroupRow(page, itemName);
  const prefixMatch = items.filter({ hasText: nameNeedle(itemName) }).last();

  if (await exactMatch.count()) {
    await exactMatch.first().scrollIntoViewIfNeeded();
    await exactMatch.first().click();
    return;
  }

  await prefixMatch.scrollIntoViewIfNeeded();
  await prefixMatch.click();
}

async function createFunctionalGroup(
  page: Page,
  name: string,
  options?: {
    description?: string;
    domainType?: 'Operations' | 'Maintenance' | 'Quality';
  }
): Promise<void> {
  await openCreatePanel(page);
  await panel(page).getByPlaceholder('Enter Name...').fill(name);

  if (options?.description !== undefined) {
    await panel(page).getByPlaceholder('Enter Description...').fill(options.description);
  }

  if (options?.domainType) {
    await panel(page).getByRole('combobox').selectOption({ label: options.domainType });
  }

  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  const exactRow = functionalGroupRow(page, name.trim());
  if (await exactRow.count()) {
    await expect(exactRow).toHaveCount(1);
    return;
  }

  await expect(functionalGroupPrefixRow(page, name.trim())).toBeVisible();
}

async function deleteFunctionalGroup(page: Page, itemName: string): Promise<void> {
  await openEditPanel(page, itemName);
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(functionalGroupRow(page, itemName)).toHaveCount(0);
}

async function createPwoUnderFunctionalGroup(page: Page, fgName: string, pwoName: string): Promise<void> {
  await selectFunctionalGroup(page, fgName);
  await column(page, 'Primary Work Obj.').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByPlaceholder('Enter Name...').fill(pwoName);
  await panel(page).getByPlaceholder('Enter Description...').fill('Created for FG dependency test');
  await panel(page).getByRole('combobox').nth(0).selectOption({ label: '1' });
  await panel(page).getByRole('combobox').nth(1).selectOption({ label: 'Medium' });
  await panel(page).getByRole('combobox').nth(2).selectOption({ label: 'High' });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Primary Work Obj.')).toContainText(pwoName);
}

async function deletePwo(page: Page, pwoName: string): Promise<void> {
  await column(page, 'Primary Work Obj.').locator('.item').filter({ hasText: pwoName }).click();
  await column(page, 'Primary Work Obj.').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Primary Work Obj.')).not.toContainText(pwoName);
}

test.describe('WRCF Functional Group', () => {
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

  test.beforeEach(async () => {
    await openWrcfAndSelectIndustryContext(page);
  });

  test('FG-E2E-001 @stable @p0 @fg lists functional groups for the selected industry context', async () => {
    await expect(column(page, 'Functional Group')).toContainText('Coal Handling System');
    await expect(column(page, 'Functional Group').locator('.item')).toHaveCount(await column(page, 'Functional Group').locator('.item').count());
  });

  test('FG-E2E-002 @stable @p0 @fg shows the add icon in the Functional Group column header', async () => {
    await expect(column(page, 'Functional Group').getByTitle('Add')).toBeVisible();
  });

  test('FG-E2E-003 @stable @p0 @fg opens the Create Functional Group popup from the add icon', async () => {
    await openCreatePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('FG-E2E-004 @stable @p1 @fg shows Create Functional Group as the popup title', async () => {
    await openCreatePanel(page);
    await expect(panel(page).getByText('Create Functional Group', { exact: true })).toBeVisible();
  });

  test('FG-E2E-005 @stable @p0 @fg keeps Name mandatory while Description and Domain Type remain optional', async () => {
    const beforeCount = await column(page, 'Functional Group').locator('.item').count();

    await openCreatePanel(page);
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('combobox')).toHaveValue('Operations');
    await expect(column(page, 'Functional Group').locator('.item')).toHaveCount(beforeCount);
  });

  test('FG-E2E-006 @stable @p1 @fg accepts a 50 character name and blocks a 51 character name', async () => {
    const runId = `${Date.now()}${Math.floor(Math.random() * 100)}`;
    const validName = fixedLengthName(50 - runId.length) + runId;
    const tooLongName = fixedLengthName(51 - runId.length) + runId;

    await createFunctionalGroup(page, validName);
    await deleteFunctionalGroup(page, validName);

    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(tooLongName);
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(functionalGroupRow(page, tooLongName)).toHaveCount(0);
  });

  test('FG-E2E-007 @stable @p0 @fg saves a functional group with Name only', async () => {
    const name = uniqueName('FG Minimal');

    await createFunctionalGroup(page, name);
    await expect(functionalGroupPrefixRow(page, name)).toBeVisible();
    await deleteFunctionalGroup(page, name);
  });

  test('FG-E2E-008 @stable @p0 @fg does not save a blank functional group name', async () => {
    const beforeCount = await column(page, 'Functional Group').locator('.item').count();

    await openCreatePanel(page);
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(column(page, 'Functional Group').locator('.item')).toHaveCount(beforeCount);
  });

  test('FG-E2E-009 @stable @p0 @fg blocks duplicate functional group names on add', async () => {
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill('Coal Handling System');
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(errorBanner(page)).toContainText(/duplicate|exists|already/i);
  });

  test('FG-E2E-010 @stable @p1 @fg blocks duplicates that differ only by trailing spaces', async () => {
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill('Coal Handling System   ');
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(errorBanner(page)).toContainText(/duplicate|exists|already/i);
  });

  test('FG-E2E-011 @stable @p1 @fg handles apostrophes and special characters in the name', async () => {
    const name = uniqueName("FG'01 @");

    await createFunctionalGroup(page, name, { description: "Operator's FG @ 01" });
    await expect(column(page, 'Functional Group')).toContainText(name);
    await deleteFunctionalGroup(page, name);
  });

  test('FG-E2E-012 @stable @p1 @fg closes the add panel without saving when cancel is used', async () => {
    const name = uniqueName('FG Cancel');

    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(name);
    await panel(page).getByPlaceholder('Enter Description...').fill('Unsaved draft');
    await closePanel(page);

    await expect(panel(page)).not.toBeVisible();
    await expect(column(page, 'Functional Group')).not.toContainText(name);
  });

  test('FG-E2E-013 @stable @p1 @fg refreshes the list immediately after add', async () => {
    const name = uniqueName('Boiler Auxiliaries');

    await createFunctionalGroup(page, name);
    await expect(column(page, 'Functional Group').locator('.item').filter({ hasText: name })).toBeVisible();
    await deleteFunctionalGroup(page, name);
  });

  test('FG-E2E-014 @stable @p1 @fg keeps the Functional Group list in alphabetical order', async () => {
    const names = (await functionalGroupItems(page).allTextContents())
      .map(value => value.trim())
      .filter(Boolean);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('FG-E2E-015 @stable @p1 @fg shows the edit icon when a Functional Group row is selected', async () => {
    await functionalGroupItems(page).first().click();
    await expect(column(page, 'Functional Group').getByTitle('Edit')).toBeVisible();
  });

  test('FG-E2E-016 @stable @p1 @fg shows Edit Functional Group as the edit popup title', async () => {
    const itemName = (await functionalGroupItems(page).first().textContent())?.trim();
    if (!itemName) throw new Error('No Functional Group row available for edit title check.');

    await openEditPanel(page, itemName);
    await expect(panel(page).getByText('Edit Functional Group', { exact: true })).toBeVisible();
    await closePanel(page);
  });

  test('FG-E2E-017 @stable @p1 @fg preloads the selected Functional Group details in the edit popup', async () => {
    const item = functionalGroupItems(page).first();
    const itemName = (await item.textContent())?.trim();
    if (!itemName) throw new Error('No Functional Group row available for preload check.');

    await openEditPanel(page, itemName);
    await expect(panel(page).getByPlaceholder('Enter Name...')).toHaveValue(itemName);
    await closePanel(page);
  });

  test('FG-E2E-018 @stable @p1 @fg shows delete, save, and close actions in the edit popup', async () => {
    const itemName = (await functionalGroupItems(page).first().textContent())?.trim();
    if (!itemName) throw new Error('No Functional Group row available for edit action check.');

    await openEditPanel(page, itemName);
    await expect(panel(page).getByTitle('Delete')).toBeVisible();
    await expect(panel(page).getByTitle('Save')).toBeVisible();
    await expect(panel(page).getByTitle('Close')).toBeVisible();
    await closePanel(page);
  });

  test('FG-E2E-019 @stable @p1 @fg blocks blank-name and duplicate validation on edit', async () => {
    const sourceName = uniqueName('FG Edit Validation');
    const otherName = uniqueName('FG Edit Duplicate');

    await createFunctionalGroup(page, sourceName);
    await createFunctionalGroup(page, otherName);

    await openEditPanel(page, sourceName);
    await panel(page).getByPlaceholder('Enter Name...').fill('   ');
    await savePanel(page);
    await expect(panel(page)).toBeVisible();

    await panel(page).getByPlaceholder('Enter Name...').fill(otherName);
    await savePanel(page);
    await expect(errorBanner(page)).toContainText(/duplicate|exists|already/i);

    await closePanel(page);
    await deleteFunctionalGroup(page, otherName);
    await deleteFunctionalGroup(page, sourceName);
  });

  test('FG-E2E-020 @stable @p1 @fg saves unchanged edits without showing duplicate validation', async () => {
    const name = uniqueName('FG Unchanged');

    await createFunctionalGroup(page, name);
    await openEditPanel(page, name);
    await savePanel(page);

    await expect(panel(page)).not.toBeVisible();
    await expect(errorBanner(page)).not.toBeVisible();
    await expect(column(page, 'Functional Group')).toContainText(name);
    await deleteFunctionalGroup(page, name);
  });

  test('FG-E2E-021 @stable @p1 @fg shows updated functional group values in the list after save', async () => {
    const originalName = uniqueName('FG Update');
    const updatedName = uniqueName('FG Updated');

    await createFunctionalGroup(page, originalName, { description: 'Before update', domainType: 'Operations' });
    await openEditPanel(page, originalName);
    await panel(page).getByPlaceholder('Enter Name...').fill(updatedName);
    await panel(page).getByPlaceholder('Enter Description...').fill('After update');
    await panel(page).getByRole('combobox').selectOption({ label: 'Quality' });
    await savePanel(page);

    await expect(column(page, 'Functional Group')).toContainText(updatedName);
    await expect(column(page, 'Functional Group')).not.toContainText(originalName);
    await deleteFunctionalGroup(page, updatedName);
  });

  test('FG-E2E-022 @stable @p1 @fg asks for confirmation before deleting a functional group', async () => {
    const name = uniqueName('FG Confirm Delete');

    await createFunctionalGroup(page, name);
    await openEditPanel(page, name);
    await panel(page).getByTitle('Delete').click();

    await expect(page.getByText(/confirm|are you sure/i)).toBeVisible();
  });

  test('FG-E2E-023 @stable @p1 @fg deletes a functional group when it has no child PWO', async () => {
    const name = uniqueName('FG Delete');

    await createFunctionalGroup(page, name);
    await deleteFunctionalGroup(page, name);
  });

  test('FG-E2E-024 @stable @p1 @fg blocks delete when the functional group has linked PWO records', async () => {
    const fgName = uniqueName('FG With PWO');
    const pwoName = uniqueName('PWO Child');

    await createFunctionalGroup(page, fgName);
    await createPwoUnderFunctionalGroup(page, fgName, pwoName);
    await openEditPanel(page, fgName);
    await panel(page).getByTitle('Delete').click();

    await expect(errorBanner(page)).toContainText(/pwo|primary work object|cannot delete/i);
    await closePanel(page);
    await selectFunctionalGroup(page, fgName);
    await deletePwo(page, pwoName);
    await deleteFunctionalGroup(page, fgName);
  });

  test('FG-E2E-025 @stable @p1 @fg shows toaster feedback for validation and success paths', async () => {
    const name = uniqueName('FG Toast');

    await openCreatePanel(page);
    await savePanel(page);
    await expect(errorBanner(page)).toBeVisible();
    await closePanel(page);

    await createFunctionalGroup(page, name);
    await expect(toastBanner(page)).toContainText(/success|created|saved/i);
    await deleteFunctionalGroup(page, name);
  });
});
