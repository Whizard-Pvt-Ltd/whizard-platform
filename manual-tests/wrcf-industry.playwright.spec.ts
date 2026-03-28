import { expect, test, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;

const industryContext = {
  sectorName: 'Manufacturing',
  industryName: 'Steel Manufacturing',
};

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.floor(Math.random() * 1000)}`;
}

async function login(page: Page): Promise<void> {
  if (!loginEmail || !loginPassword) {
    throw new Error('TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');
  }

  await page.goto(`${appUrl}/login`);
  await page.getByLabel('E-mail').fill(loginEmail!);
  await page.getByLabel('Password').fill(loginPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function openWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();
}

async function selectIndustryContext(page: Page): Promise<void> {
  const comboboxes = page.getByRole('combobox');
  await comboboxes.nth(0).selectOption({ label: industryContext.sectorName });
  await comboboxes.nth(1).selectOption({ label: industryContext.industryName });
  await expect(column(page, 'Functional Group').getByText('No items')).not.toBeVisible();
}

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

function panel(page: Page): Locator {
  return page.locator('.panel');
}

async function openCreatePanel(page: Page, title: string): Promise<void> {
  await column(page, title).getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function closePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Close').click();
}

async function selectItemInColumn(page: Page, title: string, itemName: string): Promise<void> {
  await column(page, title).locator('.item').filter({ hasText: itemName }).click();
}

async function openEditForSelectedItem(page: Page, title: string): Promise<void> {
  await column(page, title).getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

async function createFunctionalGroupViaUi(page: Page, name: string, description = '', domainType = 'Operations'): Promise<void> {
  await openCreatePanel(page, 'Functional Group');
  await panel(page).getByPlaceholder('Enter Name...').fill(name);
  if (description) {
    await panel(page).getByPlaceholder('Enter Description...').fill(description);
  }
  await panel(page).getByRole('combobox').selectOption({ label: domainType });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Functional Group')).toContainText(name);
}

async function createPrimaryWorkObjectViaUi(page: Page, name: string, description = 'Created from Playwright'): Promise<void> {
  await openCreatePanel(page, 'Primary Work Obj.');
  await panel(page).getByPlaceholder('Enter Name...').fill(name);
  await panel(page).getByPlaceholder('Enter Description...').fill(description);
  await panel(page).getByRole('combobox').nth(0).selectOption({ label: '1' });
  await panel(page).getByRole('combobox').nth(1).selectOption({ label: 'Medium' });
  await panel(page).getByRole('combobox').nth(2).selectOption({ label: 'High' });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Primary Work Obj.')).toContainText(name);
}

async function createSecondaryWorkObjectViaUi(page: Page, name: string, description = 'Created from Playwright'): Promise<void> {
  await openCreatePanel(page, 'Secondary Work Obj.');
  await panel(page).getByPlaceholder('Enter Name...').fill(name);
  await panel(page).getByPlaceholder('Enter Description...').fill(description);
  await panel(page).getByRole('combobox').nth(0).selectOption({ label: 'Medium' });
  await panel(page).getByRole('combobox').nth(1).selectOption({ label: 'Medium' });
  await panel(page).getByRole('combobox').nth(2).selectOption({ label: 'Low' });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Secondary Work Obj.')).toContainText(name);
}

async function deleteEntityViaUi(page: Page, title: string, itemName: string): Promise<void> {
  await selectItemInColumn(page, title, itemName);
  await openEditForSelectedItem(page, title);
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, title)).not.toContainText(itemName);
}

test.describe('WRCF industry management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openWrcf(page);
  });

  test('loads industry context and current WRCF columns', async ({ page }) => {
    await selectIndustryContext(page);

    await expect(column(page, 'Functional Group')).toContainText('Coal Handling System');
    await expect(column(page, 'Capabilities')).toContainText('Fundamental Principles');
    await expect(column(page, 'Proficiency Level')).toContainText('L1 Plant Awareness');
  });

  test('does not save a functional group with a blank name', async ({ page }) => {
    await selectIndustryContext(page);
    const beforeCount = await column(page, 'Functional Group').locator('.item').count();

    await openCreatePanel(page, 'Functional Group');
    await savePanel(page);

    await expect(panel(page)).toBeVisible();
    await expect(column(page, 'Functional Group').locator('.item')).toHaveCount(beforeCount);
    await closePanel(page);
  });

  test('creates a functional group with mandatory name and optional blank description', async ({ page }) => {
    await selectIndustryContext(page);
    const name = uniqueName('FG');

    await createFunctionalGroupViaUi(page, name);
    await deleteEntityViaUi(page, 'Functional Group', name);
  });

  test('allows editing a functional group and saving without changing the name', async ({ page }) => {
    await selectIndustryContext(page);
    const name = uniqueName('FG Edit');
    await createFunctionalGroupViaUi(page, name, '', 'Maintenance');
    await selectItemInColumn(page, 'Functional Group', name);
    await openEditForSelectedItem(page, 'Functional Group');

    await panel(page).getByRole('combobox').selectOption({ label: 'Quality' });
    await savePanel(page);

    await expect(panel(page)).not.toBeVisible();
    await expect(column(page, 'Functional Group')).toContainText(name);
    await deleteEntityViaUi(page, 'Functional Group', name);
  });

  test('supports single quotes in functional group name and description through the UI', async ({ page }) => {
    await selectIndustryContext(page);
    const createName = uniqueName("Operator's Group");
    await createFunctionalGroupViaUi(page, createName, "Handles operator's workflow");

    await expect(column(page, 'Functional Group')).toContainText(createName);
    await deleteEntityViaUi(page, 'Functional Group', createName);
  });

  test('creates a primary work object under the selected functional group', async ({ page }) => {
    await selectIndustryContext(page);
    const fgName = uniqueName('FG PWO');
    const pwoName = uniqueName('PWO');

    await createFunctionalGroupViaUi(page, fgName);
    await selectItemInColumn(page, 'Functional Group', fgName);
    await createPrimaryWorkObjectViaUi(page, pwoName);
    await deleteEntityViaUi(page, 'Primary Work Obj.', pwoName);
    await deleteEntityViaUi(page, 'Functional Group', fgName);
  });

  test('creates a secondary work object under the selected primary work object', async ({ page }) => {
    await selectIndustryContext(page);
    const fgName = uniqueName('FG SWO');
    const pwoName = uniqueName('PWO Parent');
    const swoName = uniqueName('SWO');

    await createFunctionalGroupViaUi(page, fgName);
    await selectItemInColumn(page, 'Functional Group', fgName);
    await createPrimaryWorkObjectViaUi(page, pwoName);
    await selectItemInColumn(page, 'Primary Work Obj.', pwoName);
    await createSecondaryWorkObjectViaUi(page, swoName);
    await deleteEntityViaUi(page, 'Secondary Work Obj.', swoName);
    await deleteEntityViaUi(page, 'Primary Work Obj.', pwoName);
    await deleteEntityViaUi(page, 'Functional Group', fgName);
  });

  test('blocks duplicate functional group names on create', async () => {
    test.fixme(true, 'Expected business rule; duplicate blocking is not clearly implemented yet.');
  });

  test('blocks duplicate functional group rename on edit', async () => {
    test.fixme(true, 'Expected business rule; duplicate blocking is not clearly implemented yet.');
  });

  test('blocks whitespace-only duplicate names on create and edit', async () => {
    test.fixme(true, 'Expected business rule; whitespace-normalized duplicate blocking is not clearly implemented yet.');
  });

  test('prevents functional group creation before an industry is selected', async () => {
    test.fixme(true, 'Expected business rule; current UI still opens the Functional Group panel before industry selection.');
  });
});
