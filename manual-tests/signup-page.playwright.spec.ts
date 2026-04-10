import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:4200';

test.describe('SignIn sheet-aligned signup coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/signup`);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('SIGNUP-E2E-001 @stable @p1 @signin signup page loads with the expected fields and actions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create Account', level: 1 })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Whizard Logo' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /I agree to the Terms and Conditions/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('SIGNUP-E2E-002 @stable @p1 @signin sign in link redirects back to the login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('SIGNUP-E2E-003 @stable @p1 @signin full name must be at least two characters', async ({ page }) => {
    await page.getByLabel('Full Name').fill('A');
    await page.getByLabel('E-mail').click();
    await expect(page.getByText('Name must be at least 2 characters.')).toBeVisible();
  });

  test('SIGNUP-E2E-004 @stable @p1 @signin invalid email shows the signup email validation message', async ({ page }) => {
    await page.getByLabel('E-mail').fill('abc');
    await page.getByLabel('Password', { exact: true }).click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });

  test('SIGNUP-E2E-005 @stable @p1 @signin password must be at least eight characters', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm Password').click();
    await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
  });

  test('SIGNUP-E2E-006 @stable @p1 @signin confirm password is required', async ({ page }) => {
    await page.getByLabel('Password', { exact: true }).fill('Whizard@1234');
    await page.getByRole('checkbox', { name: /I agree to the Terms and Conditions/ }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Please confirm your password.')).toBeVisible();
  });

  test('SIGNUP-E2E-007 @stable @p1 @signin password mismatch shows the current signup error', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Playwright User');
    await page.getByLabel('E-mail').fill('mismatch@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Whizard@1234');
    await page.getByLabel('Confirm Password').fill('Whizard@9999');
    await page.getByRole('checkbox', { name: /I agree to the Terms and Conditions/ }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('SIGNUP-E2E-008 @stable @p1 @signin terms and conditions must be accepted before account creation', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Playwright User');
    await page.getByLabel('E-mail').fill('terms@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Whizard@1234');
    await page.getByLabel('Confirm Password').fill('Whizard@1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('You must agree to the terms and conditions.')).toBeVisible();
  });

  test('SIGNUP-E2E-009 @stable @p1 @signin show hide toggles signup password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true });
    await passwordInput.fill('Whizard@1234');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show' }).first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide' }).first().click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('SIGNUP-E2E-010 @stable @p1 @signin show hide toggles confirm password visibility', async ({ page }) => {
    const confirmPasswordInput = page.getByLabel('Confirm Password');
    const confirmPasswordField = page.locator('.password-field').nth(1);
    await confirmPasswordInput.fill('Whizard@1234');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    await confirmPasswordField.getByRole('button', { name: 'Show' }).click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    await confirmPasswordField.getByRole('button', { name: 'Hide' }).click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('SIGNUP-E2E-011 @future @p1 @signin valid signup should create the account and return the user to login', async ({ page }) => {
    throw new Error(
      'Signup success is authored from the live signup UI, but it remains blocked until a disposable local signup path is confirmed for repeatable automation.'
    );
  });
});
