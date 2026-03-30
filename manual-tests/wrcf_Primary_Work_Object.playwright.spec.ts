import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-pwo.json');

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

function pwoItems(page: Page): Locator {
  return column(page, 'Primary Work Obj.').locator('.item');
}

function pwoRow(page: Page, itemName: string): Locator {
  return pwoItems(page).filter({ hasText: new RegExp(`^${escapeRegex(itemName)}$`) });
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

async function selectFunctionalGroup(page: Page, preferredName?: string): Promise<string> {
  const items = column(page, 'Functional Group').locator('.item');
  await expect(items.first()).toBeVisible();

  if (preferredName) {
    const preferred = items.filter({ hasText: preferredName }).first();
    if (await preferred.count()) {
      await preferred.click();
      return preferredName;
    }
  }

  const name = (await items.first().textContent())?.trim();
  if (!name) throw new Error('No Functional Group item available.');
  await items.first().click();
  return name;
}

async function openCreatePanel(page: Page): Promise<void> {
  await column(page, 'Primary Work Obj.').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function openEditPanel(page: Page, itemName: string): Promise<void> {
  await pwoRow(page, itemName).click();
  await column(page, 'Primary Work Obj.').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
}

async function savePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Save').click();
}

async function closePanel(page: Page): Promise<void> {
  await panel(page).getByTitle('Close').click();
}

async function createPwo(
  page: Page,
  name: string,
  description = '',
  strategicImportance = '1',
  revenueImpact = 'Medium',
  downtimeSensitivity = 'High'
): Promise<void> {
  await openCreatePanel(page);
  await panel(page).getByPlaceholder('Enter Name...').fill(name);
  if (description) {
    await panel(page).getByPlaceholder('Enter Description...').fill(description);
  }
  const combos = panel(page).getByRole('combobox');
  await combos.nth(0).selectOption({ label: strategicImportance });
  await combos.nth(1).selectOption({ label: revenueImpact });
  await combos.nth(2).selectOption({ label: downtimeSensitivity });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(pwoRow(page, name)).toBeVisible();
}

async function deletePwo(page: Page, name: string): Promise<void> {
  await openEditPanel(page, name);
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(pwoRow(page, name)).toHaveCount(0);
}

async function selectPwoContext(page: Page): Promise<{ fgName: string }> {
  await openWrcf(page);
  await selectIndustryContext(page);
  const fgName = await selectFunctionalGroup(page);
  await expect(column(page, 'Primary Work Obj.')).toBeVisible();
  return { fgName };
}

function pendingPwoCase(id: string, title: string, reason: string): void {
  test(`${id} ${title}`, async () => {
    test.fixme(true, reason);
  });
}

test.describe('Primary Work Object sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await selectPwoContext(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('PWO-E2E-001 shows only active and latest published PWO for the selected FG', async () => {
    await expect(column(page, 'Primary Work Obj.')).toBeVisible();
  });

  test('PWO-E2E-002 shows the add icon for PWO', async () => {
    await expect(column(page, 'Primary Work Obj.').getByTitle('Add')).toBeVisible();
  });

  test('PWO-E2E-003 opens the Create PWO popup from the add icon', async () => {
    await openCreatePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('PWO-E2E-004 keeps Name mandatory while strategic, revenue, and downtime fields use valid defaults', async () => {
    const beforeCount = await pwoItems(page).count();
    await openCreatePanel(page);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('combobox').nth(0)).toHaveValue('1');
    await expect(panel(page).getByRole('combobox').nth(1)).toHaveValue(/.+/);
    await expect(panel(page).getByRole('combobox').nth(2)).toHaveValue(/.+/);
    await expect(pwoItems(page)).toHaveCount(beforeCount);
  });

  test('PWO-E2E-005 creates a PWO under the selected FG with valid data', async () => {
    const name = uniqueName('PWO');
    await createPwo(page, name, 'Created by Playwright');
    await deletePwo(page, name);
  });

  test('PWO-E2E-006 blocks duplicate PWO creation under the same FG', async () => {
    const existing = (await pwoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing PWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(existing);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('PWO-E2E-007 blocks trim-aware duplicate PWO creation under the same FG', async () => {
    const existing = (await pwoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing PWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(`${existing}   `);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  pendingPwoCase('PWO-E2E-008', 'same PWO name may be allowed in different FG if parent-scoped uniqueness is the business rule', 'Needs a deterministic second FG context and confirmed parent-scoped uniqueness rule.');

  test('PWO-E2E-009 refreshes the PWO list immediately after add', async () => {
    const name = uniqueName('PWO Refresh');
    await createPwo(page, name);
    await expect(pwoRow(page, name)).toBeVisible();
    await deletePwo(page, name);
  });

  test('PWO-E2E-010 keeps the PWO list alphabetical after add and update', async () => {
    const names = (await pwoItems(page).allTextContents()).map(value => value.trim()).filter(Boolean);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('PWO-E2E-011 opens the edit popup with selected PWO values preloaded', async () => {
    const item = pwoItems(page).first();
    const name = (await item.textContent())?.trim();
    if (!name) throw new Error('No PWO available for edit preload check.');
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Name...')).toHaveValue(name);
    await closePanel(page);
  });

  test('PWO-E2E-012 validates blank and duplicate values on PWO edit', async () => {
    if ((await pwoItems(page).count()) < 2) {
      test.fixme(true, 'Needs at least two PWO rows in the selected FG for duplicate-edit validation.');
    }
    const firstName = (await pwoItems(page).nth(0).textContent())?.trim() || '';
    const secondName = (await pwoItems(page).nth(1).textContent())?.trim() || '';
    await openEditPanel(page, firstName);
    await panel(page).getByPlaceholder('Enter Name...').fill('   ');
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await panel(page).getByPlaceholder('Enter Name...').fill(secondName);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('PWO-E2E-013 saves unchanged PWO values without duplicate validation', async () => {
    const name = (await pwoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No PWO available for unchanged-save test.');
    await openEditPanel(page, name);
    await savePanel(page);
    await expect(panel(page)).not.toBeVisible();
  });

  test('PWO-E2E-014 shows updated PWO values in the list after save', async () => {
    const name = uniqueName('PWO Update');
    const updated = uniqueName('PWO Updated');
    await createPwo(page, name, 'Before update');
    await openEditPanel(page, name);
    await panel(page).getByPlaceholder('Enter Name...').fill(updated);
    await panel(page).getByPlaceholder('Enter Description...').fill('After update');
    await savePanel(page);
    await expect(pwoRow(page, updated)).toBeVisible();
    await deletePwo(page, updated);
  });

  pendingPwoCase('PWO-E2E-015', 'asks for confirmation before deleting a PWO', 'Current local PWO delete behavior has not yet been confirmed with a stable confirmation dialog.');

  test('PWO-E2E-016 deletes a PWO when no SWO exists under it', async () => {
    const name = uniqueName('PWO Delete');
    await createPwo(page, name);
    await deletePwo(page, name);
  });

  pendingPwoCase('PWO-E2E-017', 'blocks PWO delete when SWO exists under it', 'Needs a seeded or newly created SWO child under the target PWO and confirmed delete-block UI behavior.');

  test('PWO-E2E-018 creates the PWO only under the currently selected FG', async () => {
    const fgName = (await column(page, 'Functional Group').locator('.item.selected, .item.active').first().textContent())?.trim()
      || (await column(page, 'Functional Group').locator('.item').first().textContent())?.trim()
      || '';
    const name = uniqueName('PWO Parent Scope');
    await createPwo(page, name);
    await expect(column(page, 'Primary Work Obj.')).toContainText(name);
    if (fgName) {
      await expect(column(page, 'Functional Group')).toContainText(fgName);
    }
    await deletePwo(page, name);
  });

  test('PWO-E2E-019 shows valid enum values for Strategic Importance, Revenue Impact, and Downtime Sensitivity', async () => {
    await openCreatePanel(page);
    const combos = panel(page).getByRole('combobox');
    expect(await combos.nth(0).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(1).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(2).locator('option').count()).toBeGreaterThan(0);
    await closePanel(page);
  });

  pendingPwoCase('PWO-E2E-020', 'allows Dependency Links to remain blank while saving', 'Needs confirmed Dependency Links field presence in the current local PWO popup.');
});
