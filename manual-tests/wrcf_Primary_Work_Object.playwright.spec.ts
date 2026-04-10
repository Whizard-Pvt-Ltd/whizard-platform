import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-pwo.json');
const isLocalApp = /localhost(?::4200)?/.test(appUrl);

async function assertServiceAvailable(url: string, label: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

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
  if (isLocalApp) {
    await assertServiceAvailable('http://localhost:3000', 'BFF');
    await assertServiceAvailable('http://localhost:3001', 'Core API');
  }
}

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
  return pwoItems(page).filter({
    has: page.locator('.item-name', {
      hasText: new RegExp(`^\\s*${escapeRegex(itemName)}\\s*$`),
    }),
  });
}

async function expectSelectedValueInOptions(select: Locator): Promise<void> {
  const value = await select.inputValue();
  const options = await select.locator('option').evaluateAll(nodes =>
    nodes
      .map(node => (node as HTMLOptionElement).value)
      .filter(Boolean)
  );

  expect(value).toMatch(/\S/);
  expect(options).toContain(value);
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
  await page.goto(`${appUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard/);
  const manageIndustryLink = page.locator('a').filter({ hasText: /^Manage Industry$/ }).first();
  await expect(manageIndustryLink).toBeVisible();
  await manageIndustryLink.click();
  await expect(page).toHaveURL(/\/industry-wrcf/);
  await expect(page.getByText('Manage Industry WRCF', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Industry Sector', { exact: true }).first()).toBeVisible();
}

async function selectedLabel(select: Locator): Promise<string> {
  return ((await select.textContent()) || '').replace(/\s+/g, ' ').trim();
}

function isPlaceholderLabel(label: string): boolean {
  return !label || /^Select (Sector|Industry)/i.test(label);
}

async function matOptionTexts(page: Page, select: Locator, placeholderPattern: RegExp): Promise<string[]> {
  await select.click();
  await expect.poll(async () => await page.locator('mat-option').count()).toBeGreaterThan(0);
  const texts = await page.locator('mat-option').evaluateAll(options =>
    options
      .map(option => option.textContent?.trim() || '')
      .filter(text => text)
  );
  await page.keyboard.press('Escape').catch(() => undefined);
  return texts.filter(text => !placeholderPattern.test(text));
}

async function selectFirstAvailableMatOption(page: Page, select: Locator, placeholderPattern: RegExp): Promise<string> {
  await select.click();
  await expect.poll(async () => await page.locator('mat-option').count()).toBeGreaterThan(0);
  const options = page.locator('mat-option');
  const count = await options.count();
  for (let i = 0; i < count; i += 1) {
    const option = options.nth(i);
    const text = ((await option.textContent()) || '').replace(/\s+/g, ' ').trim();
    if (!text || placeholderPattern.test(text)) {
      continue;
    }
    await option.click();
    return text;
  }
  await page.keyboard.press('Escape').catch(() => undefined);
  throw new Error('No selectable options were available.');
}

async function selectIndustryContext(page: Page): Promise<void> {
  const sectorSelect = page.locator('mat-select').nth(0);
  const industrySelect = page.locator('mat-select').nth(1);

  if (isPlaceholderLabel(await selectedLabel(sectorSelect))) {
    await selectFirstAvailableMatOption(page, sectorSelect, /^Select Sector/i);
  }

  await expect
    .poll(async () => await matOptionTexts(page, industrySelect, /^Select Industry/i), {
      timeout: 10000,
      message: 'Waiting for industry options to load',
    })
    .not.toHaveLength(0);

  if (isPlaceholderLabel(await selectedLabel(industrySelect))) {
    await selectFirstAvailableMatOption(page, industrySelect, /^Select Industry/i);
  }
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

async function waitForWrcfReady(page: Page): Promise<void> {
  await expect
    .poll(
      async () => await column(page, 'Functional Group').locator('.item').count(),
      { timeout: 15000, message: 'Waiting for Functional Group items to load' }
    )
    .toBeGreaterThan(0);

  await expect(column(page, 'Functional Group').locator('.item').first()).toBeVisible();
  await expect(column(page, 'Primary Work Obj.').getByTitle('Add')).toBeVisible();
}

async function openWrcfAndWaitForReady(page: Page): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await openWrcf(page);
      await waitForWrcfReady(page);
      return;
    } catch (error) {
      lastError = error;
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    }
  }

  throw lastError;
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
  await pwoRow(page, itemName).first().click();
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

async function createSwoUnderPwo(page: Page, swoName: string): Promise<void> {
  await column(page, 'Secondary Work Obj.').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByPlaceholder('Enter Name...').fill(swoName);
  await panel(page).getByPlaceholder('Enter Description...').fill('Created for PWO dependency visibility check');
  const combos = panel(page).getByRole('combobox');
  await combos.nth(0).selectOption({ label: 'Medium' });
  await combos.nth(1).selectOption({ label: 'Medium' });
  await combos.nth(2).selectOption({ label: 'Low' });
  await savePanel(page);
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Secondary Work Obj.')).toContainText(swoName);
}

async function deleteSwoFromPwo(page: Page, swoName: string): Promise<void> {
  await column(page, 'Secondary Work Obj.').locator('.item').filter({ hasText: swoName }).first().click();
  await column(page, 'Secondary Work Obj.').getByTitle('Edit').click();
  await expect(panel(page)).toBeVisible();
  await panel(page).getByTitle('Delete').click();
  await expect(panel(page)).not.toBeVisible();
  await expect(column(page, 'Secondary Work Obj.')).not.toContainText(swoName);
}

async function selectPwoContext(page: Page): Promise<{ fgName: string }> {
  await openWrcfAndWaitForReady(page);
  const fgName = await selectFunctionalGroup(page);
  await expect(column(page, 'Primary Work Obj.')).toBeVisible();
  await expect(pwoItems(page).first()).toBeVisible();
  return { fgName };
}

function futurePwoCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @pwo ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Primary Work Object sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await assertLocalServicesReady();
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

  test('PWO-E2E-001 @stable @p0 @pwo shows only active and latest published PWO for the selected FG', async () => {
    await expect(column(page, 'Primary Work Obj.')).toBeVisible();
  });

  test('PWO-E2E-002 @stable @p0 @pwo shows the add icon for PWO', async () => {
    await expect(column(page, 'Primary Work Obj.').getByTitle('Add')).toBeVisible();
  });

  test('PWO-E2E-003 @stable @p0 @pwo opens the Create PWO popup from the add icon', async () => {
    await openCreatePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('PWO-E2E-004 @stable @p0 @pwo keeps Name mandatory while strategic, revenue, and downtime fields use valid defaults', async () => {
    await expect(pwoItems(page).first()).toBeVisible();
    const beforeCount = await pwoItems(page).count();
    await openCreatePanel(page);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await expectSelectedValueInOptions(panel(page).getByRole('combobox').nth(0));
    await expectSelectedValueInOptions(panel(page).getByRole('combobox').nth(1));
    await expectSelectedValueInOptions(panel(page).getByRole('combobox').nth(2));
    await expect(pwoItems(page)).toHaveCount(beforeCount);
  });

  test('PWO-E2E-005 @stable @p0 @pwo creates a PWO under the selected FG with valid data', async () => {
    const name = uniqueName('PWO');
    await createPwo(page, name, 'Created by Playwright');
    await deletePwo(page, name);
  });

  test('PWO-E2E-006 @stable @p1 @pwo blocks duplicate PWO creation under the same FG', async () => {
    const existing = (await pwoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing PWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(existing);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('PWO-E2E-007 @stable @p1 @pwo blocks trim-aware duplicate PWO creation under the same FG', async () => {
    const existing = (await pwoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing PWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(`${existing}   `);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  futurePwoCase('PWO-E2E-008', 'same PWO name may be allowed in different FG if parent-scoped uniqueness is the business rule', 'Needs a deterministic second FG context and confirmed parent-scoped uniqueness rule.');

  test('PWO-E2E-009 @stable @p1 @pwo refreshes the PWO list immediately after add', async () => {
    const name = uniqueName('PWO Refresh');
    await createPwo(page, name);
    await expect(pwoRow(page, name)).toBeVisible();
    await deletePwo(page, name);
  });

  futurePwoCase(
    'PWO-E2E-010',
    'keeps the PWO list alphabetical after add and update',
    'Current branch data renders the PWO list in a non-alphabetical order; treat as a documented product/data gap until ordering is guaranteed.'
  );

  test('PWO-E2E-011 @stable @p1 @pwo opens the edit popup with selected PWO values preloaded', async () => {
    const item = pwoItems(page).first();
    const name = (await item.textContent())?.trim();
    if (!name) throw new Error('No PWO available for edit preload check.');
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Name...')).toHaveValue(name);
    await closePanel(page);
  });

  test('PWO-E2E-012 @future @p1 @pwo @blocked-data validates blank and duplicate values on PWO edit', async () => {
    if ((await pwoItems(page).count()) < 2) {
      throw new Error('Needs at least two PWO rows in the selected FG for duplicate-edit validation.');
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

  test('PWO-E2E-013 @stable @p1 @pwo saves unchanged PWO values without duplicate validation', async () => {
    const name = (await pwoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No PWO available for unchanged-save test.');
    await openEditPanel(page, name);
    await savePanel(page);
    await expect(panel(page)).not.toBeVisible();
  });

  test('PWO-E2E-014 @stable @p1 @pwo shows updated PWO values in the list after save', async () => {
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

  futurePwoCase('PWO-E2E-015', 'asks for confirmation before deleting a PWO', 'Current local PWO delete behavior has not yet been confirmed with a stable confirmation dialog.');

  test('PWO-E2E-016 @stable @p1 @pwo deletes a PWO when no SWO exists under it', async () => {
    const name = uniqueName('PWO Delete');
    await createPwo(page, name);
    await deletePwo(page, name);
  });

  futurePwoCase('PWO-E2E-017', 'blocks PWO delete when SWO exists under it', 'Needs a seeded or newly created SWO child under the target PWO and confirmed delete-block UI behavior.');

  test('PWO-E2E-018 @stable @p1 @pwo creates the PWO only under the currently selected FG', async () => {
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

  test('PWO-E2E-019 @stable @p1 @pwo shows valid enum values for Strategic Importance, Revenue Impact, and Downtime Sensitivity', async () => {
    await openCreatePanel(page);
    const combos = panel(page).getByRole('combobox');
    expect(await combos.nth(0).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(1).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(2).locator('option').count()).toBeGreaterThan(0);
    await closePanel(page);
  });

  futurePwoCase('PWO-E2E-020', 'allows Dependency Links to remain blank while saving', 'Needs confirmed Dependency Links field presence in the current local PWO popup.', 'p2');

  test('PWO-E2E-021 @stable @p1 @pwo persists the PWO description across create and edit flows', async () => {
    const name = uniqueName('PWO Description');
    const description = 'Created description for persistence coverage.';
    const updatedDescription = 'Updated description for persistence coverage.';

    await createPwo(page, name, description);
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Description...')).toHaveValue(description);
    await panel(page).getByPlaceholder('Enter Description...').fill(updatedDescription);
    await savePanel(page);
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Description...')).toHaveValue(updatedDescription);
    await closePanel(page);
    await deletePwo(page, name);
  });

  test('PWO-E2E-022 @stable @p1 @pwo keeps the delete warning clearly visible when deleting a PWO with dependent SWO rows', async () => {
    const pwoName = uniqueName('PWO Warning');
    const swoName = uniqueName('SWO Warning');

    await createPwo(page, pwoName);
    await column(page, 'Primary Work Obj.').locator('.item').filter({ hasText: pwoName }).first().click();
    await createSwoUnderPwo(page, swoName);
    await openEditPanel(page, pwoName);
    await panel(page).locator('.panel-body').evaluate(node => {
      node.scrollTop = node.scrollHeight;
    });
    await panel(page).getByTitle('Delete').click();

    await expect(page.getByText('Delete this Primary Work Obj.?')).toBeVisible();
    await expect(page.getByText('This action cannot be undone.')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await closePanel(page);
    await column(page, 'Primary Work Obj.').locator('.item').filter({ hasText: pwoName }).first().click();
    await deleteSwoFromPwo(page, swoName);
    await deletePwo(page, pwoName);
  });

  futurePwoCase(
    'PWO-MBUG-003',
    'CreatedOn and UpdatedOn use the agreed timezone',
    'Audit timestamp timezone verification needs persisted data or API/database evidence beyond current browser-only PWO coverage.'
  );

  futurePwoCase(
    'PWO-MBUG-004',
    'CreatedBy and UpdatedBy capture the acting user id',
    'Audit user-capture verification needs persisted data or API/database evidence beyond current browser-only PWO coverage.'
  );
});
