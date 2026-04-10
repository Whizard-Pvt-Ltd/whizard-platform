import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-manage-wrcf.json');

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

function filterSelect(page: Page, index: number): Locator {
  return page.locator('mat-select').nth(index);
}

function itemNames(columnLocator: Locator) {
  return columnLocator.locator('.item');
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

async function openManageWrcf(page: Page): Promise<void> {
  await page.goto(`${appUrl}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard/);
  const manageIndustryLink = page.locator('a').filter({ hasText: /^Manage Industry$/ }).first();
  await expect(manageIndustryLink).toBeVisible();
  await manageIndustryLink.click();
  await expect(page).toHaveURL(/\/industry-wrcf/);
  await expect(page.getByText('Manage Industry WRCF', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Industry Sector', { exact: true }).first()).toBeVisible();
  await expect(filterSelect(page, 0)).toBeVisible();
  await expect(filterSelect(page, 1)).toBeVisible();
  await expect.poll(async () => await selectedLabel(filterSelect(page, 0)), {
    timeout: 10000,
    message: 'Waiting for default sector selection to hydrate',
  }).not.toMatch(/^Select Sector/i);
  await expect.poll(async () => await selectedLabel(filterSelect(page, 1)), {
    timeout: 10000,
    message: 'Waiting for default industry selection to hydrate',
  }).not.toMatch(/^Select Industry/i);
}

async function dropdownOptions(page: Page, select: Locator): Promise<string[]> {
  await select.click();
  await expect.poll(async () => await page.locator('mat-option').count()).toBeGreaterThan(0);
  const options = await page.locator('mat-option').evaluateAll(options =>
    options
      .map(option => option.textContent?.trim() || '')
      .filter(text => text && !/^select /i.test(text))
  );
  await page.keyboard.press('Escape').catch(() => undefined);
  return options;
}

async function selectedLabel(select: Locator): Promise<string> {
  return ((await select.textContent()) || '').replace(/\s+/g, ' ').trim();
}

async function selectedValue(select: Locator): Promise<string> {
  const label = await selectedLabel(select);
  return isPlaceholderLabel(label) ? '' : label;
}

function isPlaceholderLabel(label: string): boolean {
  return !label || /^select /i.test(label);
}

async function selectFirstAvailableOption(page: Page, select: Locator): Promise<string> {
  await select.click();
  const optionTexts = await page.locator('mat-option').evaluateAll(options =>
    options
      .map(option => option.textContent?.trim() || '')
      .filter(text => text && !/^select /i.test(text))
  );
  if (!optionTexts.length) {
    await page.keyboard.press('Escape').catch(() => undefined);
    throw new Error('No selectable options were available.');
  }
  await page.locator('mat-option').filter({ hasText: optionTexts[0] }).first().click();
  return optionTexts[0];
}

async function ensureSectorIndustryContext(page: Page): Promise<void> {
  const sector = filterSelect(page, 0);
  const industry = filterSelect(page, 1);

  if (!(await selectedValue(sector))) {
    await selectFirstAvailableOption(page, sector);
  }

  await expect.poll(async () => (await dropdownOptions(page, industry)).length).toBeGreaterThan(0);

  if (!(await selectedValue(industry))) {
    await selectFirstAvailableOption(page, industry);
  }
}

async function expectSorted(values: string[]): Promise<void> {
  expect(values).toEqual([...values].sort((a, b) => a.localeCompare(b)));
}

function normalizeProficiencyLabel(value: string): string {
  return value.replace(/\s*-\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

async function expectNonEmptyItems(page: Page, title: string): Promise<void> {
  await expect(itemNames(column(page, title)).first()).toBeVisible();
}

function futureManageCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @manage-wrcf ${title}`, async () => {
    throw new Error(reason);
  });
}

async function selectFirstItem(page: Page, title: string): Promise<string> {
  const item = itemNames(column(page, title)).first();
  const text = (await item.textContent())?.trim();
  if (!text) {
    throw new Error(`No item available in ${title}.`);
  }
  await item.click();
  return text;
}

test.describe('Manage Industry WRCF sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await openManageWrcf(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('MIWRCF-E2E-001 @stable @p0 @manage-wrcf page loads successfully after user navigates to Manage Industry WRCF', async () => {
    await expect(filterSelect(page, 0)).toBeVisible();
    await expect(filterSelect(page, 1)).toBeVisible();
    await expect(column(page, 'Functional Group')).toBeVisible();
    await expect(column(page, 'Primary Work Obj.')).toBeVisible();
    await expect(column(page, 'Secondary Work Obj.')).toBeVisible();
    await expect(column(page, 'Capabilities')).toBeVisible();
    await expect(column(page, 'Proficiency Level')).toBeVisible();
  });

  test('MIWRCF-E2E-002 @stable @p0 @manage-wrcf shows active Industry Sectors in alphabetical order', async () => {
    const options = await dropdownOptions(page, filterSelect(page, 0));
    await expectSorted(options);
  });

  test('MIWRCF-E2E-003 @stable @p0 @manage-wrcf selects a default Industry Sector on initial load', async () => {
    const label = await selectedLabel(filterSelect(page, 0));
    expect(label).toMatch(/\S/);
    expect(isPlaceholderLabel(label)).toBeFalsy();
  });

  test('MIWRCF-E2E-004 @stable @p0 @manage-wrcf shows active Industries for the selected sector in alphabetical order', async () => {
    await ensureSectorIndustryContext(page);
    const options = await dropdownOptions(page, filterSelect(page, 1));
    await expectSorted(options);
  });

  test('MIWRCF-E2E-005 @stable @p0 @manage-wrcf selects a default Industry on initial load', async () => {
    const label = await selectedLabel(filterSelect(page, 1));
    expect(label).toMatch(/\S/);
    expect(isPlaceholderLabel(label)).toBeFalsy();
  });

  test('MIWRCF-E2E-006 @stable @p0 @manage-wrcf auto-loads data for the default selected sector and industry without clicking Apply first', async () => {
    await expectNonEmptyItems(page, 'Functional Group');
  });

  futureManageCase('MIWRCF-E2E-007', 'clicking Apply loads data according to selected Industry Sector and Industry', 'Current local Manage WRCF UI does not expose a stable Apply-button flow to exercise separately.');

  test('MIWRCF-E2E-008 @stable @p0 @manage-wrcf Functional Group list shows data for the selected industry context', async () => {
    await ensureSectorIndustryContext(page);
    await expectNonEmptyItems(page, 'Functional Group');
  });

  test('MIWRCF-E2E-009 @stable @p1 @manage-wrcf Functional Group list is ordered alphabetically', async () => {
    await ensureSectorIndustryContext(page);
    const values = (await itemNames(column(page, 'Functional Group')).allTextContents())
      .map(value => value.trim())
      .filter(Boolean);
    await expectSorted(values);
  });

  test('MIWRCF-E2E-010 @stable @p1 @manage-wrcf first FG is selected by default and edit icon is shown', async () => {
    const fgColumn = column(page, 'Functional Group');
    await expect(fgColumn.locator('.item.selected').first()).toBeVisible();
    await expect(fgColumn.locator('.item.selected .edit-btn').first()).toBeVisible();
  });

  test('MIWRCF-E2E-011 @stable @p0 @manage-wrcf PWO list loads based on selected FG, sector, and industry', async () => {
    await ensureSectorIndustryContext(page);
    await selectFirstItem(page, 'Functional Group');
    await expect(column(page, 'Primary Work Obj.')).toBeVisible();
  });

  test('MIWRCF-E2E-012 @stable @p1 @manage-wrcf first PWO is selected by default and edit icon is visible', async () => {
    const pwoColumn = column(page, 'Primary Work Obj.');
    await expect(pwoColumn.locator('.item.selected').first()).toBeVisible();
    await expect(pwoColumn.locator('.item.selected .edit-btn').first()).toBeVisible();
  });

  test('MIWRCF-E2E-013 @stable @p1 @manage-wrcf changing FG resets PWO, SWO, capability and proficiency to a new valid state', async () => {
    const fgColumn = column(page, 'Functional Group');
    const fgItems = fgColumn.locator('.item');
    await expect(fgItems.nth(1)).toBeVisible();
    await fgItems.nth(1).click();
    await page.waitForTimeout(1000);

    const pwoColumn = column(page, 'Primary Work Obj.');
    const swoColumn = column(page, 'Secondary Work Obj.');
    const capabilityColumn = column(page, 'Capabilities');
    const proficiencyColumn = column(page, 'Proficiency Level');

    await expect(pwoColumn.locator('.item')).toHaveCount(0);
    await expect(swoColumn.locator('.item')).toHaveCount(0);
    await expect(capabilityColumn.locator('.item.selected')).toHaveCount(0);
    await expect(proficiencyColumn.locator('.item.selected')).toHaveCount(0);
  });

  test('MIWRCF-E2E-014 @stable @p0 @manage-wrcf SWO list loads based on selected PWO', async () => {
    await ensureSectorIndustryContext(page);
    await selectFirstItem(page, 'Functional Group');
    const pwoItems = itemNames(column(page, 'Primary Work Obj.'));
    if (await pwoItems.count()) {
      await pwoItems.first().click();
    }
    await expect(column(page, 'Secondary Work Obj.')).toBeVisible();
  });

  futureManageCase('MIWRCF-E2E-015', 'first SWO is selected by default and edit icon is shown', 'The current UI does not expose a reliable default-selected SWO state on initial page load.');
  futureManageCase('MIWRCF-E2E-016', 'changing PWO resets SWO, capability and proficiency to valid data only', 'Needs deterministic seeded PWO/SWO hierarchy data to verify lower-column resets.');

  test('MIWRCF-E2E-017 @stable @p1 @manage-wrcf all active capabilities are shown for the selected SWO in capability-code order', async () => {
    await ensureSectorIndustryContext(page);
    await selectFirstItem(page, 'Functional Group');
    await selectFirstItem(page, 'Primary Work Obj.');
    await selectFirstItem(page, 'Secondary Work Obj.');
    await expect(column(page, 'Capabilities')).toBeVisible();
    await expect(itemNames(column(page, 'Capabilities')).first()).toBeVisible();
  });

  futureManageCase('MIWRCF-E2E-018', 'capabilities that are already part of at least one CI are visually marked', 'Requires seeded CI marking data and a stable UI indicator contract for marked capabilities.');
  futureManageCase('MIWRCF-E2E-019', 'inactive capabilities are not shown even if historic CI exists', 'Requires mixed active/inactive capability fixtures across published history.');

  test('MIWRCF-E2E-020 @stable @p1 @manage-wrcf proficiencies are shown in ascending level order for the selected capability area', async () => {
    await ensureSectorIndustryContext(page);
    await selectFirstItem(page, 'Functional Group');
    await selectFirstItem(page, 'Primary Work Obj.');
    await selectFirstItem(page, 'Secondary Work Obj.');
    await selectFirstItem(page, 'Capabilities');
    const proficiencies = (await itemNames(column(page, 'Proficiency Level')).allTextContents())
      .map(value => normalizeProficiencyLabel(value))
      .filter(Boolean);
    expect(proficiencies).toEqual([
      'L1 Plant Awareness',
      'L2 Assisted Execution',
      'L3 Conditional Independence Supervised',
      'L4 Conditional Independence Scoped',
      'L5 Full Independence',
    ]);
  });

  futureManageCase('MIWRCF-E2E-021', 'proficiencies already part of CI are visually marked for the selected path and capability', 'Requires seeded CI/proficiency marking data and a stable UI marker contract.');
  futureManageCase('MIWRCF-E2E-022', 'marking exactly matches DB CI combinations for the selected path', 'Needs DB-backed comparison between UI marks and authoritative CI combinations.');
  futureManageCase('MIWRCF-E2E-023', 'same capability/proficiency combination is not shown twice due to joins/version leakage', 'Needs duplicate-like seeded data across versions to prove visual inflation does not happen.');
  futureManageCase('MIWRCF-E2E-024', 'draft FG/PWO/SWO changes are not shown in the live page', 'Needs published-vs-draft split data in the local environment.');
  futureManageCase('MIWRCF-E2E-025', 'inactive FG/PWO/SWO are excluded from display', 'Needs mixed active/inactive hierarchy fixtures in the selected industry.');
  futureManageCase('MIWRCF-E2E-026', 'page handles selected industry with no active published FG', 'Needs a seeded industry that has no active published FG.');
  futureManageCase('MIWRCF-E2E-027', 'page handles selected FG with no child PWO', 'Needs a seeded FG that has no PWO children.');
  futureManageCase('MIWRCF-E2E-028', 'page handles selected PWO with no child SWO', 'Needs a seeded PWO that has no SWO children.');
  futureManageCase('MIWRCF-E2E-029', 'displayed data belongs only to the selected industry tenant/version context', 'Needs cross-tenant seeded data and an authoritative comparison source.');
  futureManageCase('MIWRCF-E2E-030', 'edit icons/actions are hidden or disabled for non-editor roles', 'Needs a lower-privilege user account for authorization checks.');
  futureManageCase('MIWRCF-E2E-031', 'lower hierarchy refreshes only after Apply when user changes sector/industry', 'Needs a stable Apply-based filtering workflow in the current UI.');
  futureManageCase('MIWRCF-E2E-032', 'not all capabilities must necessarily be marked for a SWO', 'Needs seeded partial-CI business-rule data for the selected SWO.');
  futureManageCase('MIWRCF-E2E-033', 'UI never allows or indicates duplicate CI state for the same FG+PWO+SWO+Capability+Proficiency', 'Needs CI creation or a DB-backed mark-validation workflow.');
  futureManageCase('MIWRCF-E2E-034', 'page remains usable when industry has large FG/PWO/SWO and CI volume', 'Needs a high-volume seeded industry dataset and explicit performance thresholds.', 'p2');

  test('MIWRCF-E2E-035 @stable @p1 @manage-wrcf selected FG highlight remains visible until parent filter changes', async () => {
    await ensureSectorIndustryContext(page);
    const selectedName = await selectFirstItem(page, 'Functional Group');
    await expect(column(page, 'Functional Group')).toContainText(selectedName);
  });

  futureManageCase('MIWRCF-E2E-036', 'changing capability updates proficiency markings correctly', 'Needs multiple capability mark states with seeded CI data to validate stale-mark cleanup.');

  test('MIWRCF-E2E-037 @stable @p1 @manage-wrcf proficiency values display the label with level in brackets', async () => {
    await ensureSectorIndustryContext(page);
    await selectFirstItem(page, 'Functional Group');
    await selectFirstItem(page, 'Primary Work Obj.');
    await selectFirstItem(page, 'Secondary Work Obj.');
    await selectFirstItem(page, 'Capabilities');
    const proficiencies = (await itemNames(column(page, 'Proficiency Level')).allTextContents())
      .map(value => value.trim())
      .filter(Boolean);
    expect(proficiencies.length).toBeGreaterThan(0);
    expect(proficiencies.every(value => /\(L\d+\)$/.test(value))).toBe(true);
  });

  test('MIWRCF-MBUG-002 @stable @p1 @manage-wrcf template actions use distinct upload and download labels or icons', async () => {
    const templateButtons = page.getByRole('button', { name: /template/i });
    await expect(templateButtons).toHaveCount(2);
    const labels = (await templateButtons.allTextContents()).map(value => value.trim()).filter(Boolean);
    expect(labels.length).toBe(2);
    expect(labels[0]).not.toBe(labels[1]);
  });

  futureManageCase(
    'MIWRCF-MBUG-003',
    'success and error actions show toaster messages',
    'Needs deterministic Manage Industry WRCF success and error action paths so toaster behavior can be asserted without mixing the case with unstable CI seed data.'
  );

  test('MIWRCF-MBUG-004 @stable @p1 @manage-wrcf template actions perform a real download or upload flow', async () => {
    const templateButtons = page.getByRole('button', { name: /template/i });
    await expect(templateButtons).toHaveCount(2);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 3000 }).catch(() => null),
      templateButtons.first().click(),
    ]);
    expect(download).not.toBeNull();
  });
});
