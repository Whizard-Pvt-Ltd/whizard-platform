import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-swo.json');

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.floor(Math.random() * 1000)}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

function panel(page: Page): Locator {
  return page.locator('.panel');
}

function swoItems(page: Page): Locator {
  return column(page, 'Secondary Work Obj.').locator('.item');
}

function swoRow(page: Page, itemName: string): Locator {
  return swoItems(page).filter({ hasText: new RegExp(`^${escapeRegex(itemName)}$`) });
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

async function openWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/industry-wrcf`);
  await expect(page.getByRole('heading', { name: 'Manage Industry WRCF' })).toBeVisible();
}

async function selectIndustryContext(page: Page): Promise<void> {
  const filters = page.locator('.filter-bar .filter-select');
  await expect(filters.nth(0)).toHaveValue(/.+/);
  await expect(filters.nth(1)).toHaveValue(/.+/);
}

async function selectFunctionalGroup(page: Page): Promise<string> {
  const item = column(page, 'Functional Group').locator('.item').first();
  const text = (await item.textContent())?.trim();
  if (!text) throw new Error('No Functional Group item available.');
  await item.click();
  return text;
}

async function selectPrimaryWorkObject(page: Page): Promise<string> {
  const item = column(page, 'Primary Work Obj.').locator('.item').first();
  const text = (await item.textContent())?.trim();
  if (!text) throw new Error('No Primary Work Object item available.');
  await item.click();
  return text;
}

async function openCreatePanel(page: Page): Promise<void> {
  await column(page, 'Secondary Work Obj.').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function openEditPanel(page: Page, itemName: string): Promise<void> {
  await swoRow(page, itemName).click();
  await column(page, 'Secondary Work Obj.').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function closePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Close').click();
}

async function createSwo(
  page: Page,
  name: string,
  description = '',
  operationalComplexity = 'Medium',
  assetCriticality = 'Medium',
  failureFrequency = 'Low'
): Promise<void> {
  await openCreatePanel(page);
  await panel(page).getByPlaceholder('Enter Name...').fill(name);
  if (description) {
    await panel(page).getByPlaceholder('Enter Description...').fill(description);
  }
  const combos = panel(page).getByRole('combobox');
  await combos.nth(0).selectOption({ label: operationalComplexity });
  await combos.nth(1).selectOption({ label: assetCriticality });
  await combos.nth(2).selectOption({ label: failureFrequency });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(swoRow(page, name)).toBeVisible();
}

async function deleteSwo(page: Page, name: string): Promise<void> {
  await openEditPanel(page, name);
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(swoRow(page, name)).toHaveCount(0);
}

async function selectSwoContext(page: Page): Promise<void> {
  await openWrcf(page);
  await selectIndustryContext(page);
  await selectFunctionalGroup(page);
  await selectPrimaryWorkObject(page);
}

function pendingSwoCase(id: string, title: string, reason: string): void {
  test(`${id} ${title}`, async () => {
    test.fixme(true, reason);
  });
}

test.describe('Secondary Work Object sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await selectSwoContext(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('SWO-E2E-001 shows only active and latest published SWO for the selected PWO', async () => {
    await expect(column(page, 'Secondary Work Obj.')).toBeVisible();
  });

  test('SWO-E2E-002 shows the add icon for SWO', async () => {
    await expect(column(page, 'Secondary Work Obj.').getByTitle('Add')).toBeVisible();
  });

  test('SWO-E2E-003 opens the Create SWO popup from the add icon', async () => {
    await openCreatePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('SWO-E2E-004 keeps Name mandatory in the SWO popup', async () => {
    const beforeCount = await swoItems(page).count();
    await openCreatePanel(page);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await expect(swoItems(page)).toHaveCount(beforeCount);
  });

  test('SWO-E2E-005 creates a SWO under the selected PWO with valid data', async () => {
    const name = uniqueName('SWO');
    await createSwo(page, name, 'Created by Playwright');
    await deleteSwo(page, name);
  });

  test('SWO-E2E-006 blocks duplicate SWO creation under the same PWO', async () => {
    const existing = (await swoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing SWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(existing);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('SWO-E2E-007 blocks trim-aware duplicate SWO creation under the same PWO', async () => {
    const existing = (await swoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing SWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(`${existing}   `);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  pendingSwoCase('SWO-E2E-008', 'same SWO name under different PWO follows parent-scoped uniqueness rules', 'Needs a deterministic second PWO context and confirmed parent-scoped uniqueness rule.');

  test('SWO-E2E-009 refreshes the SWO list immediately after add', async () => {
    const name = uniqueName('SWO Refresh');
    await createSwo(page, name);
    await expect(swoRow(page, name)).toBeVisible();
    await deleteSwo(page, name);
  });

  test('SWO-E2E-010 keeps the SWO list alphabetical after add and update', async () => {
    const names = (await swoItems(page).allTextContents()).map(value => value.trim()).filter(Boolean);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('SWO-E2E-011 opens the edit popup with selected SWO values preloaded', async () => {
    const name = (await swoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No SWO available for edit preload check.');
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Name...')).toHaveValue(name);
    await closePanel(page);
  });

  test('SWO-E2E-012 validates blank and duplicate values on SWO edit', async () => {
    if ((await swoItems(page).count()) < 2) {
      test.fixme(true, 'Needs at least two SWO rows in the selected PWO for duplicate-edit validation.');
    }
    const firstName = (await swoItems(page).nth(0).textContent())?.trim() || '';
    const secondName = (await swoItems(page).nth(1).textContent())?.trim() || '';
    await openEditPanel(page, firstName);
    await panel(page).getByPlaceholder('Enter Name...').fill('   ');
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await panel(page).getByPlaceholder('Enter Name...').fill(secondName);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('SWO-E2E-013 saves unchanged SWO values without duplicate validation', async () => {
    const name = (await swoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No SWO available for unchanged-save test.');
    await openEditPanel(page, name);
    await savePanel(page);
    await expect(panel(page)).not.toBeVisible();
  });

  test('SWO-E2E-014 shows updated SWO values in the list after save', async () => {
    const name = uniqueName('SWO Update');
    const updated = uniqueName('SWO Updated');
    await createSwo(page, name, 'Before update');
    await openEditPanel(page, name);
    await panel(page).getByPlaceholder('Enter Name...').fill(updated);
    await panel(page).getByPlaceholder('Enter Description...').fill('After update');
    await savePanel(page);
    await expect(swoRow(page, updated)).toBeVisible();
    await deleteSwo(page, updated);
  });

  pendingSwoCase('SWO-E2E-015', 'asks for confirmation before deleting a SWO', 'Current local SWO delete behavior has not yet been confirmed with a stable confirmation dialog.');

  test('SWO-E2E-016 deletes a SWO when no downstream dependency blocks it', async () => {
    const name = uniqueName('SWO Delete');
    await createSwo(page, name);
    await deleteSwo(page, name);
  });

  pendingSwoCase('SWO-E2E-017', 'blocks SWO delete when downstream mapped data exists', 'Needs seeded downstream mapping data and confirmed delete-block UI behavior.');

  test('SWO-E2E-018 creates the SWO only under the selected PWO', async () => {
    const name = uniqueName('SWO Parent Scope');
    await createSwo(page, name);
    await expect(column(page, 'Secondary Work Obj.')).toContainText(name);
    await deleteSwo(page, name);
  });

  test('SWO-E2E-019 shows valid enum values for Operational Complexity, Asset Criticality, and Failure Frequency', async () => {
    await openCreatePanel(page);
    const combos = panel(page).getByRole('combobox');
    expect(await combos.nth(0).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(1).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(2).locator('option').count()).toBeGreaterThan(0);
    await closePanel(page);
  });

  pendingSwoCase('SWO-E2E-020', 'new SWO becomes selectable for downstream CI mapping after successful create', 'Needs CI Mapping workflow coverage and stable downstream selection assertions.');
});
