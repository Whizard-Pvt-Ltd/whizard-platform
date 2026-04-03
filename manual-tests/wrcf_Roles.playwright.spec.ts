import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-roles-sheet.json');

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

function panel(page: Page): Locator {
  return page.locator('.panel');
}

function addSplit(page: Page): Locator {
  return page.locator('.add-split-btn').first();
}

function editSplit(page: Page): Locator {
  return page.locator('.add-split-btn').nth(1);
}

function dropdownItems(page: Page): Locator {
  return page.locator('.add-dropdown .add-dropdown-item');
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

async function openRolesPage(page: Page): Promise<void> {
  await page.goto(`${appUrl}/wrcf-roles`);
  await expect(page.getByRole('heading', { name: 'Manage WRCF Roles' })).toBeVisible();
}

async function ensureIndustryOptions(page: Page): Promise<Array<{ label: string; value: string }>> {
  const industrySelect = filter(page, 0);
  await expect.poll(
    async () => dropdownOptions(industrySelect, /^select industry/),
    { timeout: 10000, message: 'Waiting for industry options on Manage WRCF Roles' }
  ).not.toHaveLength(0);

  return dropdownOptions(industrySelect, /^select industry/);
}

async function ensureRolesContext(page: Page): Promise<void> {
  const industrySelect = filter(page, 0);
  const departmentSelect = filter(page, 1);
  const industries = await ensureIndustryOptions(page);

  for (const industry of industries) {
    if ((await industrySelect.inputValue()) !== industry.value) {
      await industrySelect.selectOption(industry.value);
    }

    await expect.poll(
      async () => dropdownOptions(departmentSelect, /^select department/),
      { timeout: 10000, message: `Waiting for department options after selecting industry ${industry.label}` }
    ).toBeDefined();

    const departmentOptions = await dropdownOptions(departmentSelect, /^select department/);

    if (departmentOptions.length > 0) {
      return;
    }
  }

  throw new Error('No Roles industry context produced any department options.');
}

async function createDepartment(page: Page, departmentName: string): Promise<string> {
  await addSplit(page).locator('.btn-action').click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).locator('.panel-title')).toHaveText('Create Department');
  await panel(page).getByPlaceholder('Enter department name...').fill(departmentName);
  await panel(page).getByTitle('Save').click();
  await expect(panel(page)).not.toBeVisible();
  return departmentName;
}

async function ensureDepartmentSelected(page: Page): Promise<void> {
  await ensureIndustryOptions(page);

  const industrySelect = filter(page, 0);
  const departmentSelect = filter(page, 1);
  let departments = await dropdownOptions(departmentSelect, /^select department/);
  let createdDepartmentName: string | null = null;

  if (departments.length === 0) {
    const industries = await ensureIndustryOptions(page);

    for (const industry of industries) {
      if ((await industrySelect.inputValue()) !== industry.value) {
        await industrySelect.selectOption(industry.value);
      }

      departments = await dropdownOptions(departmentSelect, /^select department/);
      if (departments.length > 0) {
        break;
      }
    }
  }

  if (departments.length === 0) {
    createdDepartmentName = await createDepartment(page, `Dept ${Date.now()}`);
    await expect.poll(
      async () => dropdownOptions(departmentSelect, /^select department/),
      { timeout: 10000, message: 'Waiting for department options after creating a department' }
    ).not.toHaveLength(0);
    departments = await dropdownOptions(departmentSelect, /^select department/);
  }

  if (createdDepartmentName) {
    await departmentSelect.selectOption({ label: createdDepartmentName });
  } else if (!(await departmentSelect.inputValue()) && departments.length > 0) {
    await departmentSelect.selectOption(departments[0].value);
  }

  await expect(departmentSelect).toHaveValue(/.+/);

  await expect.poll(
    async () => dropdownOptions(filter(page, 2), /^select role/),
    { timeout: 10000, message: 'Waiting for role options on Manage WRCF Roles' }
  ).toBeDefined();
}

async function openAddRolePanel(page: Page): Promise<void> {
  await addSplit(page).locator('.btn-action-caret').click();
  const addRole = page.locator('.add-dropdown-item', { hasText: 'Add Role' });
  await expect(addRole).toBeVisible();
  await expect(addRole).toBeEnabled();
  await addRole.click();
  await expect(panel(page)).toBeVisible();
}

async function openEditRolePanel(page: Page): Promise<void> {
  await editSplit(page).locator('.btn-action-caret').click();
  const editRole = page.locator('.add-dropdown-item', { hasText: 'Edit Role' });
  await expect(editRole).toBeVisible();
  await editRole.click();
  await expect(panel(page)).toBeVisible();
}

async function createRole(page: Page, roleName: string): Promise<void> {
  await openAddRolePanel(page);
  await panel(page).getByPlaceholder('Enter role name...').fill(roleName);
  await panel(page).getByRole('combobox').selectOption({ label: 'Associate' });
  await panel(page).getByTitle('Save').click();

  const panelError = panel(page).locator('.error-msg');
  let saveOutcome: 'closed' | 'error';

  try {
    saveOutcome = await Promise.race([
      panel(page).waitFor({ state: 'hidden', timeout: 10000 }).then(() => 'closed' as const),
      panelError.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'error' as const),
    ]);
  } catch {
    throw new Error('Role save did not complete within 10s; the create/edit panel stayed open and no validation message appeared.');
  }

  if (saveOutcome === 'error') {
    const message = (await panelError.textContent())?.trim() || 'Unknown role save error.';
    throw new Error(`Role save did not complete: ${message}`);
  }

  await expect(filter(page, 2)).toHaveValue(/.+/);
  const roleOptions = await dropdownOptions(filter(page, 2), /^select role/);
  expect(roleOptions.some(option => option.label === roleName)).toBe(true);
  await expect
    .poll(async () => (await filter(page, 2).locator('option:checked').textContent())?.trim())
    .toBe(roleName);
}

async function ensureRoleSelected(page: Page): Promise<void> {
  await ensureDepartmentSelected(page);

  const roleSelect = filter(page, 2);
  const roleOptions = await dropdownOptions(roleSelect, /^select role/);

  if (roleOptions.length === 0) {
    await createRole(page, `Role ${Date.now()}`);
    return;
  }

  if (!(await roleSelect.inputValue())) {
    await roleSelect.selectOption(roleOptions[0].value);
  }

  await expect(roleSelect).toHaveValue(/.+/);
}

function futureRoleCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @roles ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Roles sheet-aligned coverage', () => {
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
    await openRolesPage(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('ROLE-E2E-001 @stable @p0 @roles department options load for the selected industry context', async () => {
    await ensureRolesContext(page);
    const departmentOptions = await dropdownOptions(filter(page, 1), /^select department/);
    expect(departmentOptions.length).toBeGreaterThan(0);
  });

  futureRoleCase(
    'ROLE-E2E-002',
    'role options load for the selected department only',
    'Needs at least two departments with different role sets in the local environment so department-scoped role filtering can be compared.',
    'p0'
  );

  futureRoleCase(
    'ROLE-E2E-003',
    'role controls are unavailable until a department is selected',
    'Current page auto-selects the first available department when an industry is loaded, so the workbook precondition cannot be reproduced as a stable default state.',
    'p1'
  );

  test('ROLE-E2E-004 @stable @p1 @roles create action is available in role context for an authorized editor', async () => {
    await ensureDepartmentSelected(page);
    await addSplit(page).locator('.btn-action-caret').click();
    const addRole = page.locator('.add-dropdown-item', { hasText: 'Add Role' });
    await expect(addRole).toBeVisible();
    await expect(addRole).toBeEnabled();
  });

  test('ROLE-E2E-005 @stable @p1 @roles clicking Add opens the role create form', async () => {
    await ensureDepartmentSelected(page);
    await openAddRolePanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Create Role');
  });

  test('ROLE-E2E-006 @stable @p0 @roles a new role can be created under the selected department', async () => {
    await ensureDepartmentSelected(page);
    await createRole(page, `Role ${Date.now()}`);
  });

  test('ROLE-E2E-007 @stable @p1 @roles edit action is available for the selected role', async () => {
    await ensureRoleSelected(page);
    await editSplit(page).locator('.btn-action-caret').click();
    const editRole = page.locator('.add-dropdown-item', { hasText: 'Edit Role' });
    await expect(editRole).toBeVisible();
    await expect(editRole).toBeEnabled();
  });

  test('ROLE-E2E-008 @stable @p1 @roles clicking Edit opens the selected role details for update', async () => {
    await ensureRoleSelected(page);
    const selectedRoleText = await filter(page, 2).locator('option:checked').textContent();
    await openEditRolePanel(page);
    await expect(panel(page).locator('.panel-title')).toHaveText('Edit Role');
    await expect(panel(page).getByPlaceholder('Enter role name...')).toHaveValue((selectedRoleText || '').trim());
  });

  test('ROLE-E2E-009 @stable @p0 @roles edited role details are saved and reflected in current context', async () => {
    await ensureDepartmentSelected(page);
    const roleName = `Role ${Date.now()}`;
    await createRole(page, roleName);
    await openEditRolePanel(page);
    const updatedName = `${roleName} Updated`;
    await panel(page).getByPlaceholder('Enter role name...').fill(updatedName);
    await panel(page).getByTitle('Save').click();
    await expect(panel(page)).not.toBeVisible();
    await expect(filter(page, 2).locator('option', { hasText: updatedName })).toBeVisible();
  });

  test('ROLE-E2E-010 @stable @p2 @roles delete action is available through the role edit panel', async () => {
    await ensureRoleSelected(page);
    await openEditRolePanel(page);
    await expect(panel(page).getByTitle('Delete')).toBeVisible();
  });

  futureRoleCase(
    'ROLE-E2E-011',
    'role deletion is blocked when capability-instance mappings exist',
    'Needs a deterministic role with existing capability-instance mappings plus a stable dependency-block message in the current local runtime.',
    'p0'
  );

  futureRoleCase(
    'ROLE-E2E-012',
    'view-only users can inspect roles but cannot create edit or delete',
    'Needs a lower-privilege Viewer or Auditor account for RBAC coverage.',
    'p0'
  );
});
