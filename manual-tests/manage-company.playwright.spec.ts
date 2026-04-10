import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

const appUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;
const authDir = path.join(process.cwd(), 'manual-tests', '.auth');
const authStatePath = path.join(authDir, 'manage-company.json');

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

function listPanel(page: Page): Locator {
  return page.locator('.w-\\[320px\\]').first();
}

function companyButtons(page: Page): Locator {
  return listPanel(page).locator('button');
}

function companyForm(page: Page): Locator {
  return page.locator('whizard-company-form');
}

function quillEditor(page: Page, placeholder: string): Locator {
  return companyForm(page).locator(`whizard-quill-editor [aria-label="${placeholder}"]`);
}

function brochureSection(page: Page): Locator {
  return companyForm(page).locator('section').filter({ has: page.getByText('Brochure', { exact: true }) });
}

function uploadedBrochureTiles(page: Page): Locator {
  return brochureSection(page).locator('.relative.aspect-video');
}

function uploaderInput(page: Page, label: string): Locator {
  return companyForm(page).locator(`whizard-media-uploader:has-text("${label}") input[type="file"]`);
}

function createTempFile(name: string, content: Buffer | string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'manage-company-'));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function createSizedFile(name: string, sizeBytes: number): string {
  return createTempFile(name, Buffer.alloc(sizeBytes, 0x41));
}

function createTinyPng(name = 'tiny.png'): string {
  return createTempFile(
    name,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnSx8sAAAAASUVORK5CYII=',
      'base64'
    )
  );
}

function createTinyPdf(name = 'tiny.pdf'): string {
  return createTempFile(name, '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');
}

function createTinyMp4(name = 'tiny.mp4'): string {
  return createTempFile(name, Buffer.from('00000020667479706d703432000000006d70343269736f6d', 'hex'));
}

function buildMockCompany(name: string) {
  return {
    success: true,
    data: {
      id: `cmp-${Date.now()}`,
      tenantId: 'tenant-1',
      companyCode: `CMP-${Math.floor(Math.random() * 100000)}`,
      name,
      industryName: null,
      cityName: null,
      companyType: null,
      establishedYear: null,
      status: 0,
      logoUrl: null,
      industryId: null,
      cityId: null,
      description: null,
      whatWeOffer: null,
      awardsRecognition: null,
      keyProductsServices: null,
      recruitmentHighlights: null,
      placementStats: null,
      inquiryEmail: null,
      clubs: [],
      contacts: [],
      mediaItems: [],
    },
  };
}

function selectFieldByLabel(page: Page, label: string): Locator {
  return companyForm(page)
    .locator(`label:text-is("${label}")`)
    .locator('xpath=following-sibling::mat-form-field')
    .first();
}

async function openMatSelectByLabel(page: Page, label: string): Promise<void> {
  await selectFieldByLabel(page, label).locator('mat-select').click({ force: true });
}

async function selectFirstOptionByLabel(page: Page, label: string): Promise<void> {
  await openMatSelectByLabel(page, label);
  await expect(page.locator('mat-option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('.cdk-overlay-backdrop')).toHaveCount(0);
}

async function fillMandatoryDetails(page: Page, name: string): Promise<void> {
  await companyForm(page).getByPlaceholder('Enter company name').fill(name);
  await selectFirstOptionByLabel(page, 'Industry Type');
  await selectFirstOptionByLabel(page, 'Location');
  await selectFirstOptionByLabel(page, 'Type');
  await companyForm(page).getByPlaceholder('e.g. 1994').fill('2020');
  await selectFirstOptionByLabel(page, 'Associated Parent Club');
  await selectFirstOptionByLabel(page, 'Associated Club');
  await quillEditor(page, 'Describe the company...').click();
  await page.keyboard.insertText('Mandatory company details');
  await quillEditor(page, 'Describe what the company offers...').click();
  await page.keyboard.insertText('Mandatory company offer');
  await quillEditor(page, 'Describe products and services...').click();
  await page.keyboard.insertText('Mandatory products and services');
  await companyForm(page).getByPlaceholder('contact@company.com').fill('valid@company.com');
}

async function uploadRequiredMediaDraft(page: Page): Promise<void> {
  const logoPath = createTinyPng('logo.png');
  const brochurePath = createTinyPdf('brochure.pdf');
  const promoPath = createTinyMp4('promo.mp4');
  const galleryPath = createTinyPng('gallery.png');
  const testimonialPath = createTinyMp4('testimonial.mp4');
  await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
  await uploaderInput(page, 'Upload Logo').setInputFiles(logoPath);
  await uploaderInput(page, 'Upload Brochure Here').setInputFiles(brochurePath);
  await uploaderInput(page, 'Upload Videos Here').nth(0).setInputFiles(promoPath);
  await uploaderInput(page, 'Upload Images Here').setInputFiles(galleryPath);
  await uploaderInput(page, 'Upload Videos Here').nth(1).setInputFiles(testimonialPath);
}

async function openManageCompany(page: Page): Promise<void> {
  await page.goto(`${appUrl}/manage-company`, { waitUntil: 'domcontentloaded' });

  if (/\/login/.test(page.url())) {
    await interactiveLogin(page);
    if (!/\/manage-company/.test(page.url())) {
      await page.goto(`${appUrl}/manage-company`, { waitUntil: 'domcontentloaded' });
    }
  }

  await expect(page).toHaveURL(/\/manage-company/, { timeout: 15000 });
  await expect(listPanel(page)).toBeVisible({ timeout: 15000 });
  await expect(page.getByPlaceholder('Search company...')).toBeVisible({ timeout: 15000 });
  await expect
    .poll(
      async () => {
        if (await listPanel(page).getByText('No companies found').isVisible().catch(() => false)) {
          return 0;
        }
        return await companyButtons(page).count();
      },
      {
        timeout: 15000,
        message: 'Waiting for company list or empty-state to load',
      }
    )
    .toBeGreaterThanOrEqual(0);
}

async function openCreateForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(companyForm(page)).toBeVisible();
  await expect(companyForm(page).getByPlaceholder('Enter company name')).toBeVisible();
}

async function clickFormSave(page: Page): Promise<void> {
  const saveButton = companyForm(page).getByRole('button', { name: 'Save' }).first();
  await expect(saveButton).toBeVisible();
  await saveButton.click({ force: true });
}

async function clickFormPreview(page: Page): Promise<void> {
  const previewButton = companyForm(page).getByRole('button', { name: 'Preview' }).first();
  await expect(previewButton).toBeVisible();
  await previewButton.click({ force: true });
}

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.floor(Math.random() * 1000)}`;
}

test.describe('Manage Company current-runtime coverage', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const authenticated = await ensureAuthenticatedPage(browser);
    await authenticated.context.close();
  });

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: authStatePath });
    page = await context.newPage();
    await openManageCompany(page);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('MNG-COM-001 @stable @p0 @manage-company Manage Company listing loads', async () => {
    await expect(listPanel(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.getByPlaceholder('Search company...')).toBeVisible();
  });

  test('MNG-COM-002 @stable @p1 @manage-company Search filters company list', async () => {
    await expect
      .poll(
        async () => {
          const count = await companyButtons(page).count();
          const emptyVisible = await listPanel(page).getByText('No companies found').isVisible().catch(() => false);
          return count > 0 || emptyVisible;
        },
        {
          timeout: 15000,
          message: 'Waiting for company rows or the empty-state message',
        }
      )
      .toBeTruthy();

    const count = await companyButtons(page).count();
    if (count > 0) {
      const search = page.getByPlaceholder('Search company...');
      await expect(companyButtons(page).first()).toBeVisible();
      await expect(page.getByText(/Company Id :/).first()).toBeVisible();
      await search.fill('zzzz-unmatched-company');
      await expect(listPanel(page).getByText('No companies found')).toBeVisible();
      await search.fill('');
      await expect.poll(async () => companyButtons(page).count()).toBe(count);
    } else {
      await expect(listPanel(page).getByText('No companies found')).toBeVisible();
    }
  });

  test('MNG-COM-003 @stable @p0 @manage-company Open Create Company form from Add', async () => {
    await openCreateForm(page);
    await expect(companyForm(page).getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(companyForm(page).getByRole('button', { name: 'Preview' })).toBeVisible();
    await expect(page.getByText('Company Details').first()).toBeVisible();
  });

  test('MNG-COM-009 @stable @p0 @manage-company Block save when any mandatory detail field is missing', async () => {
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(uniqueName('Missing Detail Company'));
    await clickFormSave(page);
    await expect
      .poll(() => createCalls, { timeout: 2000, message: 'Save should stay blocked when mandatory details are missing' })
      .toBe(0);
  });

  test('MNG-COM-011 @stable @p1 @manage-company Block preview or publish until requirements are met', async () => {
    await openCreateForm(page);
    await fillMandatoryDetails(page, uniqueName('Partial Publish Company'));
    await expect(companyForm(page).getByRole('button', { name: 'Send to publish' })).toBeDisabled();
  });

  test('MNG-COM-012 @stable @p1 @manage-company Validate contact email format', async () => {
    await openCreateForm(page);
    await page.getByPlaceholder('contact@company.com').fill('invalid-email');
    await clickFormSave(page);
    await expect(page.getByText('Enter a valid email')).toBeVisible();
  });

  test('MNG-COM-024 @stable @p1 @manage-company Tab switching retains form state', async () => {
    await openCreateForm(page);
    const nameInput = companyForm(page).getByPlaceholder('Enter company name');
    await nameInput.fill('Draft Company State');
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await companyForm(page).getByRole('button', { name: 'Details' }).click();
    await expect(nameInput).toHaveValue('Draft Company State');
  });

  test('MNG-COM-005 @stable @p1 @manage-company Preview before save', async () => {
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(uniqueName('Preview Company'));
    await clickFormPreview(page);
    await expect(page.locator('whizard-company-preview')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' }).first()).toBeVisible();
  });

  test('MNG-COM-004 @stable @p1 @manage-company Create fill details and upload required media', async () => {
    await openCreateForm(page);
    await fillMandatoryDetails(page, uniqueName('Draft Media Company'));
    await uploadRequiredMediaDraft(page);
    await expect(companyForm(page).locator('img')).toHaveCount(2);
    await expect(uploadedBrochureTiles(page)).toHaveCount(1);
    await expect(companyForm(page).getByText('1 video(s)')).toBeVisible();
    await companyForm(page).getByRole('button', { name: 'Details' }).click();
    await expect(companyForm(page).getByPlaceholder('Enter company name')).not.toHaveValue('');
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await expect(companyForm(page).locator('img')).toHaveCount(2);
    await expect(uploadedBrochureTiles(page)).toHaveCount(1);
    await expect(companyForm(page).getByText('1 video(s)')).toBeVisible();
  });

  test('MNG-COM-006 @stable @p0 @manage-company Save a valid company', async () => {
    const name = uniqueName('Saved Company');
    await openCreateForm(page);
    await fillMandatoryDetails(page, name);
    await uploadRequiredMediaDraft(page);
    await clickFormSave(page);
    await expect(companyForm(page)).not.toBeVisible();
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('MNG-COM-007 @stable @p1 @manage-company New company appears in listing after save', async () => {
    const name = uniqueName('Listed Company');
    await openCreateForm(page);
    await fillMandatoryDetails(page, name);
    await uploadRequiredMediaDraft(page);
    await clickFormSave(page);
    await expect(companyForm(page)).not.toBeVisible();
    await expect(listPanel(page)).toContainText(name);
  });

  test('MNG-COM-008 @stable @p1 @manage-company Send to publish for completed company', async () => {
    const name = uniqueName('Publish Company');
    await openCreateForm(page);
    await fillMandatoryDetails(page, name);
    await uploadRequiredMediaDraft(page);
    const publishButton = companyForm(page).getByRole('button', { name: 'Send to publish' }).first();
    await expect(publishButton).toBeEnabled();
    await publishButton.click({ force: true });
    await expect(companyForm(page)).not.toBeVisible();
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test('MNG-COM-013 @stable @p1 @manage-company Validate established year future value', async () => {
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(uniqueName('Future Year Company'));
    await companyForm(page).getByPlaceholder('e.g. 1994').fill('2099');
    await clickFormSave(page);
    await expect
      .poll(() => createCalls, { timeout: 2000, message: 'Create request should stay blocked for future year values' })
      .toBe(0);
  });

  test('MNG-COM-019 @stable @p2 @manage-company Company name supports min max length constraints', async () => {
    const maxName = 'C'.repeat(255);
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildMockCompany(maxName)),
        });
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    const nameInput = companyForm(page).getByPlaceholder('Enter company name');
    await nameInput.fill(maxName);
    await expect(nameInput).toHaveValue(maxName);
    await clickFormSave(page);
    await expect.poll(() => createCalls).toBe(1);
  });

  test('MNG-COM-023 @stable @p2 @manage-company Search supports long text and no match', async () => {
    const search = page.getByPlaceholder('Search company...');
    await search.fill('x'.repeat(200));
    await expect(listPanel(page)).toBeVisible();
    await search.fill('zzzz-no-match-company');
    await expect(listPanel(page).getByText('No companies found')).toBeVisible();
  });

  test('MNG-COM-010 @stable @p0 @manage-company Block save when mandatory media is missing', async () => {
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(uniqueName('No Media Company'));
    await clickFormSave(page);
    await expect
      .poll(() => createCalls, { timeout: 2000, message: 'Save should stay blocked when required media is missing' })
      .toBe(0);
  });

  test('MNG-COM-014 @stable @p1 @manage-company Reject unsupported file types on upload', async () => {
    const invalidFile = createTempFile('invalid.txt', 'plain text is not supported here');
    await openCreateForm(page);
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await uploaderInput(page, 'Upload Brochure Here').setInputFiles(invalidFile);
    await expect(uploadedBrochureTiles(page)).toHaveCount(0);
  });

  test('MNG-COM-015 @stable @p1 @manage-company Reject files exceeding size limit', async () => {
    const oversizedFile = createSizedFile('too-large.pdf', 2 * 1024 * 1024 + 1);
    await openCreateForm(page);
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await uploaderInput(page, 'Upload Brochure Here').setInputFiles(oversizedFile);
    await expect(companyForm(page)).toContainText('exceeds 2MB limit');
  });

  test('MNG-COM-016 @stable @p1 @manage-company Handle API save failure gracefully', async () => {
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'forced create failure' }),
        });
        return;
      }
      await route.continue();
    });
    const name = uniqueName('Graceful Save Failure');
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(name);
    await clickFormSave(page);
    await expect(page.getByText('Failed to create company.')).toBeVisible();
    await expect(companyForm(page).getByPlaceholder('Enter company name')).toHaveValue(name);
  });

  test('MNG-COM-017 @stable @p1 @manage-company Handle media upload failure gracefully', async () => {
    const brochurePath = createTinyPdf('upload-failure.pdf');
    await page.route('**/companies/media-assets/upload', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'forced upload failure' }),
      });
    });
    const name = uniqueName('Graceful Upload Failure');
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(name);
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await uploaderInput(page, 'Upload Brochure Here').setInputFiles(brochurePath);
    await expect(page.getByText('Failed to upload media asset.')).toBeVisible();
    await companyForm(page).getByRole('button', { name: 'Details' }).click();
    await expect(companyForm(page).getByPlaceholder('Enter company name')).toHaveValue(name);
  });

  test('MNG-COM-018 @stable @p1 @manage-company Prevent duplicate creation on repeated Save click', async () => {
    const name = uniqueName('Single Submit Company');
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildMockCompany(name)),
        });
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(name);
    const saveButton = companyForm(page).getByRole('button', { name: 'Save' }).first();
    await saveButton.click({ force: true });
    await saveButton.click({ force: true });
    await expect.poll(() => createCalls, { timeout: 3000 }).toBe(1);
  });

  test('MNG-COM-020 @stable @p1 @manage-company Reject company name beyond max length', async () => {
    const overLimitName = 'D'.repeat(256);
    let createCalls = 0;
    await page.route('**/companies', async route => {
      if (route.request().method() === 'POST') {
        createCalls += 1;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(overLimitName);
    await clickFormSave(page);
    await expect
      .poll(() => createCalls, { timeout: 2000, message: 'Save should stay blocked for names beyond max length' })
      .toBe(0);
  });

  test('MNG-COM-021 @stable @p1 @manage-company Description fields reject content beyond max length', async () => {
    const overLimitDescription = 'Q'.repeat(5001);
    await openCreateForm(page);
    await companyForm(page).getByPlaceholder('Enter company name').fill(uniqueName('Description Limit Company'));
    const descriptionEditor = companyForm(page).locator('whizard-quill-editor .ql-editor').first();
    await descriptionEditor.click();
    await page.keyboard.insertText(overLimitDescription);
    await expect
      .poll(async () => (await descriptionEditor.textContent())?.trim().length ?? 0, {
        timeout: 5000,
        message: 'Description should stay within the allowed max length',
      })
      .toBeLessThanOrEqual(5000);
  });

  test('MNG-COM-022 @stable @p1 @manage-company File upload at size limit accepted and above limit rejected', async () => {
    const atLimitFile = createSizedFile('at-limit.pdf', 2 * 1024 * 1024);
    const aboveLimitFile = createSizedFile('above-limit.pdf', 2 * 1024 * 1024 + 1);
    await openCreateForm(page);
    await companyForm(page).getByRole('button', { name: 'Images / Videos' }).click();
    await uploaderInput(page, 'Upload Brochure Here').setInputFiles(atLimitFile);
    await expect(uploadedBrochureTiles(page)).toHaveCount(1);
    await uploaderInput(page, 'Upload Brochure Here').setInputFiles(aboveLimitFile);
    await expect(companyForm(page)).toContainText('exceeds 2MB limit');
  });
});
