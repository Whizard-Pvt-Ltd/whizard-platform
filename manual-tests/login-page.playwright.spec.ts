import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:4200';

test.describe('Login page smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login/);
  });

  test('renders the login heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('renders the email field', async ({ page }) => {
    const emailInput = page.getByLabel('E-mail');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'example@gmail.com');
  });

  test('renders the password field', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', '@#*%');
  });

  test('renders the sign-in button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  });

  test('renders the Google sign-in button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('renders the create account link to signup', async ({ page }) => {
    const createAccountLink = page.getByRole('link', { name: 'Create now' });
    await expect(createAccountLink).toBeVisible();
    await expect(createAccountLink).toHaveAttribute('href', /signup/);
  });

  test('renders the forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  test('supports the current keyboard tab order for primary controls', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Create now' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('E-mail')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Show' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeFocused();
  });
});
