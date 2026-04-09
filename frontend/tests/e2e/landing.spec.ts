import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('coffee_session_token');
      localStorage.removeItem('coffee_session');
    });
    await page.goto('/');
  });

  test('page loads with Coffee Gathering title', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Coffee Gathering');
  });

  test('shows hero description text', async ({ page }) => {
    await expect(
      page.getByText(/meet interesting people/i),
    ).toBeVisible();
  });

  test('shows feature cards', async ({ page }) => {
    await expect(page.getByText('Choose Your Drink')).toBeVisible();
    await expect(page.getByText('Join a Room')).toBeVisible();
    await expect(page.getByText('Chat & Connect')).toBeVisible();
  });

  test('"Join a Gathering" button navigates to /join', async ({ page }) => {
    const joinButton = page.getByRole('link', { name: /Join a Gathering/i });
    await expect(joinButton).toBeVisible();
    await joinButton.click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test('"Create Private Room" button navigates to /join when no session', async ({
    page,
  }) => {
    const createButton = page.getByRole('link', {
      name: /Create Private Room/i,
    });
    await expect(createButton).toBeVisible();
    await createButton.click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test('shows returning-user greeting when session exists', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('coffee_session_token', 'mock-token-abc');
      localStorage.setItem(
        'coffee_session',
        JSON.stringify({
          id: 'sess-1',
          nickname: 'TestUser',
          avatarColor: '#d4852f',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      );
    });
    await page.goto('/');

    await expect(page.getByText('Welcome back, TestUser!')).toBeVisible();
    // Button should change to "Continue to Drinks"
    await expect(
      page.getByRole('link', { name: /Continue to Drinks/i }),
    ).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    await expect(page.getByText('Made with warmth')).toBeVisible();
  });

  test('has no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});
