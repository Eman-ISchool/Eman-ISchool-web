import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Join Flow Tests
// ---------------------------------------------------------------------------

test.describe('Join Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh -- no prior session
    await page.addInitScript(() => {
      localStorage.removeItem('coffee_session_token');
    });
    await page.goto('/join');
  });

  test('shows nickname input form', async ({ page }) => {
    // Heading
    await expect(
      page.getByRole('heading', { name: /Join the Gathering/i }),
    ).toBeVisible();

    // Nickname label + input
    await expect(page.getByLabel(/Nickname/i)).toBeVisible();

    // Placeholder hint
    await expect(
      page.getByPlaceholder('e.g. CoffeeLover42'),
    ).toBeVisible();

    // Submit button
    await expect(
      page.getByRole('button', { name: /Enter as Guest/i }),
    ).toBeVisible();

    // Helper text with character count
    await expect(page.getByText(/\/20 characters/)).toBeVisible();
  });

  test('validates nickname -- rejects empty submission', async ({ page }) => {
    // Click submit without typing anything
    await page.getByRole('button', { name: /Enter as Guest/i }).click();

    // Should show a validation error about minimum length
    await expect(
      page.getByText(/at least 2 characters/i),
    ).toBeVisible();
  });

  test('validates nickname -- rejects single character', async ({ page }) => {
    await page.getByLabel(/Nickname/i).fill('A');
    await page.getByRole('button', { name: /Enter as Guest/i }).click();

    await expect(
      page.getByText(/at least 2 characters/i),
    ).toBeVisible();
  });

  test('accepts valid nickname and navigates to /select', async ({ page }) => {
    // Mock the session creation API
    await page.route('**/api/sessions', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session: {
              id: 'sess-123',
              nickname: 'CoffeeFan',
              avatarColor: '#d4852f',
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            },
            token: 'jwt-mock-token-xyz',
          }),
        });
      }
      return route.continue();
    });

    await page.getByLabel(/Nickname/i).fill('CoffeeFan');
    await page.getByRole('button', { name: /Enter as Guest/i }).click();

    // Should navigate to the selection page
    await expect(page).toHaveURL(/\/select$/);
  });

  test('shows error for API failures', async ({ page }) => {
    // Mock a server error
    await page.route('**/api/sessions', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Internal server error',
          }),
        });
      }
      return route.continue();
    });

    await page.getByLabel(/Nickname/i).fill('CoffeeFan');
    await page.getByRole('button', { name: /Enter as Guest/i }).click();

    // Should show the error message from the API
    await expect(
      page.getByText(/Internal server error/i),
    ).toBeVisible();
  });

  test('"Back to home" link navigates to /', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back to home/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('clears validation error when user types', async ({ page }) => {
    // Trigger error first
    await page.getByRole('button', { name: /Enter as Guest/i }).click();
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible();

    // Start typing -- error should clear
    await page.getByLabel(/Nickname/i).fill('Co');
    await expect(
      page.getByText(/at least 2 characters/i),
    ).not.toBeVisible();
  });
});
