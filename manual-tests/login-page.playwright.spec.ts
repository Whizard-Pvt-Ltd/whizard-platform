import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:4200';

test.describe('SignIn sheet-aligned login coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('LOGIN-E2E-001 @stable @p1 @signin login page loads with the expected auth controls', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Whizard Logo' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('LOGIN-E2E-002 @stable @p1 @signin create now link redirects to the signup page', async ({ page }) => {
    const createAccountLink = page.getByRole('link', { name: 'Create now' });
    await expect(createAccountLink).toBeVisible();
    await expect(createAccountLink).toHaveAttribute('href', /signup/);
    await createAccountLink.click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: 'Create Account', level: 1 })).toBeVisible();
  });

  test('LOGIN-E2E-003 @stable @p1 @signin invalid email shows the login email validation message', async ({ page }) => {
    await page.getByLabel('E-mail').fill('abc');
    await page.getByLabel('Password').click();
    await expect(page.getByText('Enter a valid work email address.')).toBeVisible();
  });

  test('LOGIN-E2E-004 @stable @p1 @signin blank password shows the current password validation message', async ({ page }) => {
    await page.getByLabel('E-mail').fill('user@example.com');
    await page.getByLabel('Password').click();
    await page.getByLabel('E-mail').click();
    await expect(page.getByText('Enter a valid password.')).toBeVisible();
  });

  test('LOGIN-E2E-005 @stable @p1 @signin remember me is selected by default', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeChecked();
  });

  test('LOGIN-E2E-006 @stable @p1 @signin show hide toggles login password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('Whizard@1234');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('LOGIN-MBUG-001 @stable @p1 @signin forgot password opens a reset flow', async ({ page }) => {
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot|reset/i);
  });

  test('LOGIN-MBUG-002 @stable @p1 @signin google sign-in starts an authentication flow', async ({ page, context }) => {
    const googleButton = page.getByRole('button', { name: 'Sign in with Google' });
    await expect(googleButton).toBeVisible();

    const popupPromise = context.waitForEvent('page', { timeout: 5_000 }).catch(() => null);
    await googleButton.click();

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      await expect(popup).toHaveURL(/google|oauth|accounts/i);
      return;
    }

    await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
  });
});
