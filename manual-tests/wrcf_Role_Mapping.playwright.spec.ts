import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-role-mapping.json');

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

function mappingsButton(page: Page): Locator {
  return page.getByRole('button', { name: /Mappings/ });
}

function dialog(page: Page): Locator {
  return page.locator('.dialog-panel');
}

function pwoHeaders(page: Page): Locator {
  return dialog(page).locator('.pwo-header');
}

function pwoBadges(page: Page): Locator {
  return dialog(page).locator('.pwo-badge');
}

function mappingRows(page: Page): Locator {
  return dialog(page).locator('.ci-item');
}

function removeButtons(page: Page): Locator {
  return dialog(page).locator('.trash-btn');
}

function saveButtons(page: Page): Locator {
  return dialog(page).locator('.btn-save');
}

function emptyState(page: Page): Locator {
  return dialog(page).locator('.empty-msg');
}

function column(page: Page, title: string): Locator {
  return page.locator('.workspace .columns-grid > *').filter({ hasText: title });
}

function columnItems(columnLocator: Locator): Locator {
  return columnLocator.locator('li, .item, [class*="item"]');
}

function pwoColumn(page: Page): Locator {
  return column(page, 'Primary Work Obj.');
}

function swoColumn(page: Page): Locator {
  return column(page, 'Secondary Work Obj.');
}

function capabilityColumn(page: Page): Locator {
  return column(page, 'Capabilities');
}

function proficiencyColumn(page: Page): Locator {
  return column(page, 'Proficiency Level');
}

function addSplit(page: Page): Locator {
  return page.locator('.add-split-btn').first();
}

function panel(page: Page): Locator {
  return page.locator('.panel');
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
}

function futureRoleMappingCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @role-mapping ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('Role Mapping sheet-aligned coverage', () => {
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

  futureRoleMappingCase(
    'RMAP-E2E-001',
    'mapping area loads PWO SWO Capability and Proficiency columns for the selected role',
    'Role-scoped hierarchy now waits for explicit role selection, but the current local runtime still blocks role creation/save, so the selected-role prerequisite cannot be established deterministically.',
    'p0'
  );

  test('RMAP-E2E-002 @stable @p1 @role-mapping mapping action remains unavailable until a role is selected', async () => {
    await ensureDepartmentSelected(page);
    await expect.poll(async () => await filter(page, 2).inputValue()).toMatch(/^(|null)$/);
    await expect(mappingsButton(page)).toBeDisabled();
    await expect(dialog(page)).not.toBeVisible();
  });

  futureRoleMappingCase(
    'RMAP-E2E-003',
    'mapping options are restricted to the selected role context inherited from department functional groups',
    'Needs a working selected-role path first; current local runtime still blocks role creation/save before role-scoped mapping restriction can be validated.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-004',
    'capability instance mappings are grouped by PWO',
    'The dialog groups pending mappings by PWO, but a deterministic selected role plus pending role-mapping entries are required before the workbook grouping scenario can be executed.',
    'p1'
  );

  futureRoleMappingCase(
    'RMAP-E2E-005',
    'previously saved role mappings are displayed for the selected role',
    'Needs a deterministic seeded role with existing saved role-capability-instance mappings in the current local environment.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-006',
    'tick/select action adds a capability instance for pending assignment',
    'Needs a deterministic selected role plus an unmapped capability-instance row; current runtime blocks role creation/selection before pending mapping can be staged.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-007',
    'save persists selected role-to-capability-instance mappings',
    'Needs a deterministic selected role plus pending mapping rows; current runtime blocks role creation/selection before save coverage can be exercised.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-008',
    'saved mappings remain visible after refresh or reopen',
    'Needs a stable end-to-end role mapping save path plus seeded role data for reopen verification.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-009',
    'delete/remove action is available for an existing role mapping',
    'Needs a deterministic selected role with existing saved mappings so a mapped row can be opened and removed.',
    'p1'
  );

  futureRoleMappingCase(
    'RMAP-E2E-010',
    'deleting a mapped capability instance removes it from the role after save',
    'Needs a deterministic selected role with an existing saved mapping and a working remove-plus-save flow.',
    'p1'
  );

  futureRoleMappingCase(
    'RMAP-E2E-011',
    'duplicate role-to-capability-instance mapping is prevented',
    'Needs a deterministic selected role with an already-saved mapping plus a stable re-add path to confirm duplicate prevention.',
    'p1'
  );

  futureRoleMappingCase(
    'RMAP-E2E-012',
    'only instantiated capability instances are available for role mapping',
    'Needs a deterministic selected role plus controlled capability-instance seed data to compare instantiated versus non-instantiated combinations.',
    'p0'
  );

  futureRoleMappingCase(
    'RMAP-E2E-013',
    'new role mappings default mandatory to true',
    'Needs a working saved role-mapping create path plus a way to inspect the persisted mandatory flag after save.',
    'p2'
  );

  futureRoleMappingCase(
    'RMAP-E2E-014',
    'new role mappings default weight to 1',
    'Needs a working saved role-mapping create path plus a way to inspect the persisted weight value after save.',
    'p2'
  );

  futureRoleMappingCase(
    'RMAP-E2E-015',
    'view-only users can view mappings but cannot add or delete them',
    'Needs a lower-privilege Viewer or Auditor account for RBAC mapping coverage.',
    'p0'
  );
});
