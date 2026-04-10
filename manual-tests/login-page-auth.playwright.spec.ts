import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:4200';
const loginEmail = process.env.TEST_LOGIN_EMAIL;
const loginPassword = process.env.TEST_LOGIN_PASSWORD;

test.describe('Login page authenticated flow', () => {
  test.skip(!loginEmail || !loginPassword, 'TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD are required');

  test('LOGIN-E2E-007 @stable @p1 @signin valid credentials sign the user in and leave the login page', async ({ page }) => {
    await page.goto(`${baseUrl}/login`);

    await page.getByLabel('E-mail').fill(loginEmail!);
    await page.getByLabel('Password').fill(loginPassword!);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).not.toBeVisible();
  });
});
