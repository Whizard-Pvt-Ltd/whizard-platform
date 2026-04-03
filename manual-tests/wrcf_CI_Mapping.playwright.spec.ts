import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'wrcf-ci-mapping.json');

function column(page: Page, title: string): Locator {
  return page.locator('.column').filter({ has: page.locator('.column-title', { hasText: title }) });
}

function items(columnLocator: Locator): Locator {
  return columnLocator.locator('.item');
}

function proficiencyColumn(page: Page): Locator {
  return column(page, 'Proficiency Level');
}

function capabilityColumn(page: Page): Locator {
  return column(page, 'Capabilities');
}

function mappingButton(page: Page): Locator {
  return page.locator('.btn-badge');
}

function mappingBadge(page: Page): Locator {
  return mappingButton(page).locator('.badge');
}

function dialog(page: Page): Locator {
  return page.locator('.dialog-panel');
}

function pwoGroups(page: Page): Locator {
  return dialog(page).locator('.pwo-group');
}

function pwoHeader(page: Page): Locator {
  return pwoGroups(page).locator('.pwo-header');
}

function pwoCountBadge(page: Page): Locator {
  return pwoGroups(page).locator('.pwo-badge');
}

function ciRows(page: Page): Locator {
  return dialog(page).locator('.ci-item');
}

function pendingCiRows(page: Page): Locator {
  return ciRows(page).filter({ has: page.locator('.pending-badge') });
}

function dialogFilter(page: Page, index: number): Locator {
  return dialog(page).locator('.filter-select').nth(index);
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
  const sector = filters.nth(0);
  const industry = filters.nth(1);

  const chooseFirstAvailable = async (select: Locator, emptyPattern: RegExp): Promise<void> => {
    const options = await select.locator('option').evaluateAll(
      (nodes, emptyPatternSource) =>
        nodes
          .map(node => {
            const option = node as HTMLOptionElement;
            return {
              label: option.textContent?.trim() || '',
              value: option.value,
            };
          })
          .filter(option => option.value && option.label && !(new RegExp(emptyPatternSource, 'i')).test(option.label)),
      emptyPattern.source
    );

    if (!options.length) {
      throw new Error('No selectable filter options were available.');
    }

    await select.selectOption(options[0].value);
  };

  await expect.poll(
    async () =>
      await sector.locator('option').evaluateAll(nodes =>
        nodes.filter(node => {
          const option = node as HTMLOptionElement;
          return Boolean(option.value && option.textContent?.trim() && !/^select /i.test(option.textContent.trim()));
        }).length
      ),
    { timeout: 10000, message: 'Waiting for sector options on Manage Industry WRCF' }
  ).toBeGreaterThan(0);

  if (!(await sector.inputValue())) {
    await chooseFirstAvailable(sector, /^select /i);
  }

  await expect.poll(
    async () =>
      await industry.locator('option').evaluateAll(nodes =>
        nodes.filter(node => {
          const option = node as HTMLOptionElement;
          return Boolean(option.value && option.textContent?.trim() && !/^select /i.test(option.textContent.trim()));
        }).length
      ),
    { timeout: 10000, message: 'Waiting for industry options on Manage Industry WRCF' }
  ).toBeGreaterThan(0);

  if (!(await industry.inputValue())) {
    await chooseFirstAvailable(industry, /^select /i);
  }
}

async function clickFirstItem(page: Page, title: string): Promise<string> {
  const item = items(column(page, title)).first();
  await expect(item).toBeVisible();
  const text = (await item.textContent())?.trim();
  if (!text) {
    throw new Error(`No item available in ${title}.`);
  }
  await item.click();
  return text;
}

async function selectBasePath(page: Page): Promise<void> {
  await openWrcf(page);
  await selectIndustryContext(page);
  await clickFirstItem(page, 'Functional Group');
  await clickFirstItem(page, 'Primary Work Obj.');
  await clickFirstItem(page, 'Secondary Work Obj.');
  await clickFirstItem(page, 'Capabilities');
  await expect(items(proficiencyColumn(page)).first()).toBeVisible();
}

async function selectCapabilityByIndex(page: Page, index: number): Promise<string> {
  const item = items(capabilityColumn(page)).nth(index);
  await expect(item).toBeVisible();
  const text = (await item.textContent())?.trim();
  if (!text) {
    throw new Error(`No capability text available at index ${index}.`);
  }
  await item.click();
  return text;
}

async function findCapabilityWithState(
  page: Page,
  state: 'saved' | 'unmapped'
): Promise<{ capabilityIndex: number; capabilityName: string }> {
  const capabilityItems = items(capabilityColumn(page));
  const count = await capabilityItems.count();

  for (let index = 0; index < count; index += 1) {
    const capabilityName = await selectCapabilityByIndex(page, index);
    const matchingRows = state === 'saved' ? savedProficiencyRows(page) : unmappedProficiencyRows(page);
    if (await matchingRows.count()) {
      return { capabilityIndex: index, capabilityName };
    }
  }

  throw new Error(`No capability produced a ${state} proficiency state.`);
}

function savedProficiencyRows(page: Page): Locator {
  return items(proficiencyColumn(page)).filter({ has: page.locator('.checkbox-btn.saved') });
}

function checkedProficiencyRows(page: Page): Locator {
  return items(proficiencyColumn(page)).filter({ has: page.locator('.checkbox-btn.checked') });
}

function unmappedProficiencyRows(page: Page): Locator {
  return items(proficiencyColumn(page)).filter({ has: page.locator('.checkbox-btn:not(.saved):not(.checked)') });
}

async function pendingCount(page: Page): Promise<number> {
  return Number((await mappingBadge(page).textContent())?.trim() || '0');
}

async function toggleFirstUnmappedProficiency(page: Page): Promise<string> {
  const row = unmappedProficiencyRows(page).first();
  await expect(row).toBeVisible();
  const label = (await row.textContent())?.trim() || 'Unknown proficiency';
  await row.locator('.checkbox-btn').click();
  return label;
}

async function openMappingsDialog(page: Page): Promise<void> {
  await mappingButton(page).click();
  await expect(dialog(page)).toBeVisible();
}

async function dropdownOptions(select: Locator): Promise<string[]> {
  return select.locator('option').evaluateAll(options =>
    options
      .map(option => (option as HTMLOptionElement).textContent?.trim() || '')
      .filter(text => text && !/^all /i.test(text))
  );
}

function futureCiCase(id: string, title: string, reason: string, priority: 'p0' | 'p1' | 'p2' = 'p1'): void {
  test(`${id} @future @${priority} @ci-mapping ${title}`, async () => {
    throw new Error(reason);
  });
}

test.describe('CI Mapping sheet-aligned coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await selectBasePath(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('CIMAP-E2E-001 @stable @p0 @ci-mapping shows a saved proficiency with the green mapped indicator for the selected path', async () => {
    try {
      await findCapabilityWithState(page, 'saved');
    } catch {
      throw new Error('Needs at least one saved CI in the selected local hierarchy path.');
    }

    await expect(savedProficiencyRows(page).first().locator('.checkbox-btn')).toHaveClass(/saved/);
  });

  test('CIMAP-E2E-002 @stable @p0 @ci-mapping shows actionable radio buttons for unmapped proficiencies on the selected path', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
    } catch {
      throw new Error('Needs at least one unmapped proficiency in the selected local hierarchy path.');
    }

    await expect(unmappedProficiencyRows(page).first().locator('.checkbox-btn')).toBeVisible();
    await expect(unmappedProficiencyRows(page).first().locator('.checkbox-btn')).not.toHaveClass(/saved/);
  });

  test('CIMAP-E2E-003 @stable @p0 @ci-mapping selecting an unmapped proficiency increases the Mappings pending count immediately', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
    } catch {
      throw new Error('Needs at least one unmapped proficiency to stage a pending mapping.');
    }

    const before = await pendingCount(page);
    await toggleFirstUnmappedProficiency(page);
    await expect(mappingBadge(page)).toHaveText(String(before + 1));
    await expect(checkedProficiencyRows(page).first().locator('.checkbox-btn')).toHaveClass(/checked/);
  });

  test('CIMAP-E2E-004 @stable @p0 @ci-mapping clicking the same pending proficiency again removes it from the Mappings count', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
    } catch {
      throw new Error('Needs at least one unmapped proficiency to stage and remove a pending mapping.');
    }

    const before = await pendingCount(page);
    await toggleFirstUnmappedProficiency(page);
    await expect(mappingBadge(page)).toHaveText(String(before + 1));
    await checkedProficiencyRows(page).first().locator('.checkbox-btn').click();
    await expect(mappingBadge(page)).toHaveText(String(before));
  });

  test('CIMAP-E2E-005 @stable @p0 @ci-mapping can stage more than one pending CI combination and keeps the pending count cumulative', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
    } catch {
      throw new Error('Needs unmapped proficiencies to stage multiple pending mappings.');
    }

    const before = await pendingCount(page);
    await toggleFirstUnmappedProficiency(page);

    let staged = 1;
    const currentUnmapped = await unmappedProficiencyRows(page).count();
    if (currentUnmapped > 0) {
      await toggleFirstUnmappedProficiency(page);
      staged += 1;
    } else {
      const capabilityItems = items(capabilityColumn(page));
      const totalCapabilities = await capabilityItems.count();
      let foundSecond = false;

      for (let index = 0; index < totalCapabilities; index += 1) {
        await selectCapabilityByIndex(page, index);
        if (await unmappedProficiencyRows(page).count()) {
          await toggleFirstUnmappedProficiency(page);
          staged += 1;
          foundSecond = true;
          break;
        }
      }

      if (!foundSecond) {
        throw new Error('Needs at least two unmapped combinations in the local hierarchy path.');
      }
    }

    await expect(mappingBadge(page)).toHaveText(String(before + staged));
  });

  test('CIMAP-E2E-006 @stable @p0 @ci-mapping clicking an already mapped proficiency does not create a duplicate pending entry', async () => {
    try {
      await findCapabilityWithState(page, 'saved');
    } catch {
      throw new Error('Needs at least one saved CI in the selected local hierarchy path.');
    }

    const before = await pendingCount(page);
    const savedButton = savedProficiencyRows(page).first().locator('.checkbox-btn');
    await savedButton.click();
    await expect(mappingBadge(page)).toHaveText(String(before));
    await expect(page.locator('.toast-banner')).toContainText(/already exists/i);
  });

  futureCiCase('CIMAP-E2E-007', 'proficiency state belongs only to the currently selected FG PWO SWO Capability path', 'Needs at least two deterministic hierarchy paths with different saved CI states.');
  futureCiCase('CIMAP-E2E-008', 'proficiency mapping refreshes correctly when capability changes under the same SWO', 'Needs a deterministic SWO with different saved states across multiple capabilities.');
  futureCiCase('CIMAP-E2E-009', 'saving pending mappings resets the parent pending counter', 'Needs live save execution plus deterministic cleanup for created CI records.');
  futureCiCase('CIMAP-E2E-010', 'closing the popup without save discards parent pending mappings', 'Current UI keeps parent pending cache outside the popup; workbook expects discard-on-close behavior.');

  test('CIMAP-E2E-011 @stable @p1 @ci-mapping clicking Mappings opens the Manage CI Mapping popup', async () => {
    await openMappingsDialog(page);
    await expect(dialog(page).getByText('Manage CI Mappings', { exact: true })).toBeVisible();
  });

  test('CIMAP-E2E-012 @stable @p1 @ci-mapping popup defaults inherit the selected Industry Sector, Industry, and FG from Manage Industry WRCF', async () => {
    const parentFilters = page.locator('.filter-bar .filter-select');
    const parentSector = await parentFilters.nth(0).inputValue();
    const parentIndustry = await parentFilters.nth(1).inputValue();
    const selectedFg = await column(page, 'Functional Group').locator('.item.selected').first();
    const selectedFgValue = await selectedFg.textContent();

    await openMappingsDialog(page);
    await expect(dialogFilter(page, 0)).toHaveValue(parentSector);
    await expect(dialogFilter(page, 1)).toHaveValue(parentIndustry);
    await expect(dialogFilter(page, 2)).toHaveValue(/.+/);
    if (selectedFgValue?.trim()) {
      await expect(dialog(page)).toContainText(selectedFgValue.trim());
    }
  });

  test('CIMAP-E2E-013 @stable @p1 @ci-mapping popup filter values are shown in alphabetical order', async () => {
    await openMappingsDialog(page);
    await expect(dropdownOptions(dialogFilter(page, 0))).resolves.toEqual(
      [...await dropdownOptions(dialogFilter(page, 0))].sort((a, b) => a.localeCompare(b))
    );
    await expect(dropdownOptions(dialogFilter(page, 1))).resolves.toEqual(
      [...await dropdownOptions(dialogFilter(page, 1))].sort((a, b) => a.localeCompare(b))
    );
    await expect(dropdownOptions(dialogFilter(page, 2))).resolves.toEqual(
      [...await dropdownOptions(dialogFilter(page, 2))].sort((a, b) => a.localeCompare(b))
    );
  });

  test('CIMAP-E2E-014 @stable @p1 @ci-mapping popup content stays scoped to the inherited sector industry and FG context', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
      await toggleFirstUnmappedProficiency(page);
    } catch {
      throw new Error('Needs an unmapped proficiency to create a visible pending entry for scope validation.');
    }

    await openMappingsDialog(page);
    await expect(dialogFilter(page, 0)).toHaveValue(/.+/);
    await expect(dialogFilter(page, 1)).toHaveValue(/.+/);
    await expect(dialogFilter(page, 2)).toHaveValue(/.+/);
    await expect(pendingCiRows(page).first()).toBeVisible();
  });

  test('CIMAP-E2E-015 @stable @p1 @ci-mapping popup groups CI entries under PWO accordions', async () => {
    await openMappingsDialog(page);
    await expect(pwoGroups(page).first()).toBeVisible();
    await expect(pwoHeader(page).first()).toContainText(/^PWO:/);
  });

  futureCiCase('CIMAP-E2E-016', 'PWO accordions are ordered alphabetically', 'Current popup groups preserve API/cache order; workbook expects explicit alphabetical ordering.');

  test('CIMAP-E2E-017 @stable @p1 @ci-mapping each popup CI row shows SWO Capability and Proficiency in a readable line item', async () => {
    await openMappingsDialog(page);
    await expect(ciRows(page).first()).toContainText(/\+\s+.+\(.+\).*L\d/i);
  });

  test('CIMAP-E2E-018 @stable @p1 @ci-mapping new unsaved mappings are visually tagged as pending in the popup', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
      await toggleFirstUnmappedProficiency(page);
    } catch {
      throw new Error('Needs an unmapped proficiency to stage a pending CI.');
    }

    await openMappingsDialog(page);
    await expect(pendingCiRows(page).first()).toContainText(/pending/i);
  });

  test('CIMAP-E2E-019 @stable @p1 @ci-mapping popup shows only saved or pending CI rows instead of the full unmapped combination space', async () => {
    await openMappingsDialog(page);
    await expect(ciRows(page).first()).toBeVisible();
    await expect(dialog(page).getByText('No capability instances found.')).toHaveCount(0);
  });

  test('CIMAP-E2E-020 @stable @p1 @ci-mapping each PWO accordion badge matches the number of CI rows rendered in that group', async () => {
    await openMappingsDialog(page);
    const groups = await pwoGroups(page).count();
    expect(groups).toBeGreaterThan(0);

    for (let index = 0; index < groups; index += 1) {
      const group = pwoGroups(page).nth(index);
      const badgeCount = Number((await group.locator('.pwo-badge').textContent())?.trim() || '0');
      const rowCount = await group.locator('.ci-item').count();
      expect(badgeCount).toBe(rowCount);
    }
  });

  test('CIMAP-E2E-021 @stable @p1 @ci-mapping deleting a pending mapping removes it from the popup immediately', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
      await toggleFirstUnmappedProficiency(page);
    } catch {
      throw new Error('Needs an unmapped proficiency to stage a pending CI.');
    }

    await openMappingsDialog(page);
    const before = await pendingCiRows(page).count();
    if (before === 0) {
      throw new Error('Needs at least one pending CI row in the popup before delete/remove can be verified.');
    }
    await pendingCiRows(page).first().getByTitle('Remove pending').click();
    await expect(pendingCiRows(page)).toHaveCount(before - 1);
  });

  test('CIMAP-E2E-022 @stable @p1 @ci-mapping existing saved CI rows expose a delete action in the popup', async () => {
    await openMappingsDialog(page);
    const savedRows = ciRows(page).filter({ hasNot: page.locator('.pending-badge') });
    if ((await savedRows.count()) === 0) {
      throw new Error('Needs at least one existing saved CI row in the popup.');
    }
    await expect(savedRows.first().getByTitle('Delete')).toBeVisible();
  });

  futureCiCase('CIMAP-E2E-023', 'deleting an existing CI with linked skills shows a dependency warning', 'Needs seeded CI rows with downstream skill dependencies.');
  futureCiCase('CIMAP-E2E-024', 'existing CI without downstream dependency can be deleted successfully', 'Needs deterministic childless CI data and cleanup-safe delete coverage.');

  test('CIMAP-E2E-025 @stable @p1 @ci-mapping deleting a pending mapping shows no dependency warning', async () => {
    try {
      await findCapabilityWithState(page, 'unmapped');
      await toggleFirstUnmappedProficiency(page);
    } catch {
      throw new Error('Needs an unmapped proficiency to stage a pending CI.');
    }

    await openMappingsDialog(page);
    await pendingCiRows(page).first().getByTitle('Remove pending').click();
    await expect(page.locator('.error-banner')).toHaveCount(0);
  });

  futureCiCase('CIMAP-E2E-026', 'clicking outside the popup does not close it', 'Current popup backdrop click closes the dialog; workbook expects a non-dismissable outside-click behavior.');
  futureCiCase('CIMAP-E2E-027', 'close or cancel leaves no unsaved pending mappings behind', 'Current UI retains parent pending cache after dialog close or cancel.');
  futureCiCase('CIMAP-E2E-028', 'save persists all newly pending CI mappings', 'Needs live save execution plus deterministic cleanup for created CI records.');
  futureCiCase('CIMAP-E2E-029', 'save resets the pending counter on the parent Mappings button', 'Needs save coverage and deterministic cleanup for created CI records.');
  futureCiCase('CIMAP-E2E-030', 'duplicate CI combinations cannot be saved twice', 'Needs controlled duplicate-save setup and backend-visible validation path.');
  futureCiCase('CIMAP-E2E-031', 'popup filters show only sector industry and FG combinations that already have mapped or pending data', 'Current popup loads sector, industry, and FG options from master lists rather than mapped-only subsets.');
  futureCiCase('CIMAP-E2E-032', 'changing popup filters refreshes accordion content without stale rows', 'Needs deterministic multi-FG mapped data in the local environment.');
  futureCiCase('CIMAP-E2E-033', 'pending items from one FG do not appear after switching popup filters to another FG', 'Current popup groups all parent cache entries regardless of selected FG filter.');
  futureCiCase('CIMAP-E2E-034', 'partial save failure leaves the popup in a consistent state', 'Needs backend validation conflicts or mixed save success fixtures.');
  futureCiCase('CIMAP-E2E-035', 'saved mappings reopen as normal mapped entries rather than pending rows', 'Needs live save execution plus deterministic cleanup for created CI records.');
});
