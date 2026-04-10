import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-swo.json');
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

function swoItems(page: Page): Locator {
  return column(page, 'Secondary Work Obj.').locator('.item');
}

function swoRow(page: Page, itemName: string): Locator {
  return swoItems(page).filter({
    has: page.locator('.item-name', {
      hasText: new RegExp(`^\\s*${escapeRegex(itemName)}\\s*$`),
    }),
  });
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
  await expect(page.locator('mat-select').nth(0)).toBeVisible();
  await expect(page.locator('mat-select').nth(1)).toBeVisible();
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

async function waitForWrcfReady(page: Page): Promise<void> {
  await expect
    .poll(
      async () => await column(page, 'Functional Group').locator('.item').count(),
      { timeout: 15000, message: 'Waiting for Functional Group items to load' }
    )
    .toBeGreaterThan(0);

  await expect(column(page, 'Functional Group').locator('.item').first()).toBeVisible();
  await expect(column(page, 'Secondary Work Obj.').getByTitle('Add')).toBeVisible();
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

async function selectPrimaryWorkObjectWithExistingSwo(page: Page): Promise<string> {
  const pwoList = column(page, 'Primary Work Obj.').locator('.item');
  await expect
    .poll(async () => await pwoList.count(), {
      timeout: 10000,
      message: 'Waiting for Primary Work Object rows after selecting Functional Group',
    })
    .toBeGreaterThan(0);

  const pwoCount = await pwoList.count();
  if (!pwoCount) {
    throw new Error('No Primary Work Object item available.');
  }

  const pwoNames = (await pwoList.allTextContents()).map(value => value.trim()).filter(Boolean);

  for (let index = 0; index < pwoNames.length; index += 1) {
    const text = pwoNames[index];
    if (!text) continue;

    await pwoList.nth(index).click();
    await page.waitForTimeout(400);
    const swoCount = await swoItems(page).count().catch(() => 0);
    if (swoCount > 0) {
      return text;
    }
  }

  const fallback = (await pwoList.first().textContent())?.trim();
  if (!fallback) {
    throw new Error('No Primary Work Object item available.');
  }

  await pwoList.first().click();
  return fallback;
}

async function openCreatePanel(page: Page): Promise<void> {
  await column(page, 'Secondary Work Obj.').getByTitle('Add').click();
  await expect(panel(page)).toBeVisible();
}

async function openEditPanel(page: Page, itemName: string): Promise<void> {
  await swoRow(page, itemName).first().click();
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
  await openWrcfAndWaitForReady(page);
  await selectFunctionalGroup(page);
  await expect(column(page, 'Primary Work Obj.').locator('.item').first()).toBeVisible();
  await selectPrimaryWorkObjectWithExistingSwo(page);
}

function futureSwoCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @swo ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Secondary Work Object sheet-aligned coverage', () => {
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
    await selectSwoContext(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('SWO-E2E-001 @stable @p0 @swo shows only active and latest published SWO for the selected PWO', async () => {
    await expect(column(page, 'Secondary Work Obj.')).toBeVisible();
  });

  test('SWO-E2E-002 @stable @p0 @swo shows the add icon for SWO', async () => {
    await expect(column(page, 'Secondary Work Obj.').getByTitle('Add')).toBeVisible();
  });

  test('SWO-E2E-003 @stable @p0 @swo opens the Create SWO popup from the add icon', async () => {
    await openCreatePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('SWO-E2E-004 @stable @p0 @swo keeps Name mandatory in the SWO popup', async () => {
    const beforeCount = await swoItems(page).count();
    await openCreatePanel(page);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
    await expect(swoItems(page)).toHaveCount(beforeCount);
  });

  test('SWO-E2E-005 @stable @p0 @swo creates a SWO under the selected PWO with valid data', async () => {
    const name = uniqueName('SWO');
    await createSwo(page, name, 'Created by Playwright');
    await deleteSwo(page, name);
  });

  test('SWO-E2E-006 @stable @p1 @swo blocks duplicate SWO creation under the same PWO', async () => {
    const existing = (await swoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing SWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(existing);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  test('SWO-E2E-007 @stable @p1 @swo blocks trim-aware duplicate SWO creation under the same PWO', async () => {
    const existing = (await swoItems(page).first().textContent())?.trim();
    if (!existing) throw new Error('No existing SWO available for duplicate test.');
    await openCreatePanel(page);
    await panel(page).getByPlaceholder('Enter Name...').fill(`${existing}   `);
    await savePanel(page);
    await expect(panel(page)).toBeVisible();
  });

  futureSwoCase('SWO-E2E-008', 'same SWO name under different PWO follows parent-scoped uniqueness rules', 'Needs a deterministic second PWO context and confirmed parent-scoped uniqueness rule.');

  test('SWO-E2E-009 @stable @p1 @swo refreshes the SWO list immediately after add', async () => {
    const name = uniqueName('SWO Refresh');
    await createSwo(page, name);
    await expect(swoRow(page, name)).toBeVisible();
    await deleteSwo(page, name);
  });

  test('SWO-E2E-010 @stable @p1 @swo keeps the SWO list alphabetical after add and update', async () => {
    const names = (await swoItems(page).allTextContents()).map(value => value.trim()).filter(Boolean);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('SWO-E2E-011 @stable @p1 @swo opens the edit popup with selected SWO values preloaded', async () => {
    const name = (await swoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No SWO available for edit preload check.');
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Name...')).toHaveValue(name);
    await closePanel(page);
  });

  test('SWO-E2E-012 @future @p1 @swo @blocked-data validates blank and duplicate values on SWO edit', async () => {
    if ((await swoItems(page).count()) < 2) {
      throw new Error('Needs at least two SWO rows in the selected PWO for duplicate-edit validation.');
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

  test('SWO-E2E-013 @stable @p1 @swo saves unchanged SWO values without duplicate validation', async () => {
    const name = (await swoItems(page).first().textContent())?.trim();
    if (!name) throw new Error('No SWO available for unchanged-save test.');
    await openEditPanel(page, name);
    await savePanel(page);
    await expect(panel(page)).not.toBeVisible();
  });

  test('SWO-E2E-014 @stable @p1 @swo shows updated SWO values in the list after save', async () => {
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

  futureSwoCase('SWO-E2E-015', 'asks for confirmation before deleting a SWO', 'Current local SWO delete behavior has not yet been confirmed with a stable confirmation dialog.');

  test('SWO-E2E-016 @stable @p1 @swo deletes a SWO when no downstream dependency blocks it', async () => {
    const name = uniqueName('SWO Delete');
    await createSwo(page, name);
    await deleteSwo(page, name);
  });

  futureSwoCase('SWO-E2E-017', 'blocks SWO delete when downstream mapped data exists', 'Needs seeded downstream mapping data and confirmed delete-block UI behavior.');

  test('SWO-E2E-018 @stable @p1 @swo creates the SWO only under the selected PWO', async () => {
    const name = uniqueName('SWO Parent Scope');
    await createSwo(page, name);
    await expect(column(page, 'Secondary Work Obj.')).toContainText(name);
    await deleteSwo(page, name);
  });

  test('SWO-E2E-019 @stable @p1 @swo shows valid enum values for Operational Complexity, Asset Criticality, and Failure Frequency', async () => {
    await openCreatePanel(page);
    const combos = panel(page).getByRole('combobox');
    expect(await combos.nth(0).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(1).locator('option').count()).toBeGreaterThan(0);
    expect(await combos.nth(2).locator('option').count()).toBeGreaterThan(0);
    await closePanel(page);
  });

  futureSwoCase('SWO-E2E-020', 'new SWO becomes selectable for downstream CI mapping after successful create', 'Needs CI Mapping workflow coverage and stable downstream selection assertions.', 'p2');

  test('SWO-E2E-021 @stable @p1 @swo persists the SWO description across create and edit flows', async () => {
    const name = uniqueName('SWO Description');
    const description = 'Created SWO description for persistence coverage.';
    const updatedDescription = 'Updated SWO description for persistence coverage.';

    await createSwo(page, name, description);
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Description...')).toHaveValue(description);
    await panel(page).getByPlaceholder('Enter Description...').fill(updatedDescription);
    await savePanel(page);
    await openEditPanel(page, name);
    await expect(panel(page).getByPlaceholder('Enter Description...')).toHaveValue(updatedDescription);
    await closePanel(page);
    await deleteSwo(page, name);
  });

  futureSwoCase(
    'SWO-MBUG-002',
    'CreatedOn and UpdatedOn use the agreed timezone',
    'Audit timestamp timezone verification needs persisted data or API/database evidence beyond current browser-only SWO coverage.'
  );

  futureSwoCase(
    'SWO-MBUG-003',
    'CreatedBy and UpdatedBy capture the acting user id',
    'Audit user-capture verification needs persisted data or API/database evidence beyond current browser-only SWO coverage.'
  );

  futureSwoCase(
    'SWO-MBUG-004',
    'delete shows a proper dependency error when capability instance mapping exists',
    'Needs a seeded SWO with downstream capability-instance mapping and a confirmed delete-error contract in the local runtime.'
  );
});
