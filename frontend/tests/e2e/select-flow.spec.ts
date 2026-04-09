import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers -- seed a valid session into localStorage and mock APIs
// ---------------------------------------------------------------------------

const MOCK_TOKEN = 'jwt-mock-select-token';
const MOCK_SESSION = {
  id: 'sess-sel-1',
  nickname: 'Tester',
  avatarColor: '#d4852f',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

async function seedSession(page: Page) {
  // Inject token + session object into localStorage *before* navigation so
  // that the Zustand store's hydrate() picks them up.
  await page.addInitScript(
    ({ token, session }) => {
      localStorage.setItem('coffee_session_token', token);
      // The store only reads the token via hydrate(), but we also need the
      // session object for the page to render properly.  The real app sets
      // session via setSession after a POST /api/sessions call.  We store
      // it so that the store can be patched on mount.
      localStorage.setItem('coffee_session', JSON.stringify(session));
    },
    { token: MOCK_TOKEN, session: MOCK_SESSION },
  );
}

async function mockQueueApi(page: Page) {
  await page.route('**/api/queue/join', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ position: 1, estimatedWait: 30 }),
    }),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Selection Flow', () => {
  test('redirects to /join if no session', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('coffee_session_token');
    });
    await page.goto('/select');
    await expect(page).toHaveURL(/\/join$/);
  });

  test.describe('with session', () => {
    test.beforeEach(async ({ page }) => {
      await seedSession(page);
      await mockQueueApi(page);
      await page.goto('/select');
    });

    test('shows drink options (Coffee, Tea, Other)', async ({ page }) => {
      await expect(page.getByText('Coffee', { exact: true })).toBeVisible();
      await expect(page.getByText('Tea', { exact: true })).toBeVisible();
      await expect(page.getByText('Other', { exact: true })).toBeVisible();
    });

    test('shows topic grid', async ({ page }) => {
      // Check a representative set of default topics
      await expect(
        page.getByText('Technology & Innovation'),
      ).toBeVisible();
      await expect(page.getByText('Travel & Culture')).toBeVisible();
      await expect(page.getByText('Books & Learning')).toBeVisible();
      await expect(page.getByText('Random Chat')).toBeVisible();
      await expect(page.getByText('Custom Topic')).toBeVisible();
    });

    test('can select drink and topic', async ({ page }) => {
      // Select a drink
      await page.getByText('Coffee', { exact: true }).click();

      // Select a topic
      await page.getByText('Travel & Culture').click();

      // Both should now have the selected visual state -- we verify
      // indirectly by checking the "Find a Match" button becomes enabled.
      const findMatchBtn = page.getByRole('button', {
        name: /Find a Match/i,
      });
      await expect(findMatchBtn).toBeEnabled();
    });

    test('"Find a Match" button is disabled before selection', async ({
      page,
    }) => {
      const findMatchBtn = page.getByRole('button', {
        name: /Find a Match/i,
      });
      await expect(findMatchBtn).toBeDisabled();
    });

    test('"Find a Match" button is enabled after selecting drink and topic', async ({
      page,
    }) => {
      await page.getByText('Tea', { exact: true }).click();
      await page.getByText('Music & Arts').click();

      const findMatchBtn = page.getByRole('button', {
        name: /Find a Match/i,
      });
      await expect(findMatchBtn).toBeEnabled();
    });

    test('navigates to /waiting on submit', async ({ page }) => {
      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Technology & Innovation').click();

      await page.getByRole('button', { name: /Find a Match/i }).click();

      await expect(page).toHaveURL(/\/waiting$/);
    });

    test('custom topic input appears when Custom Topic is selected', async ({
      page,
    }) => {
      await page.getByText('Custom Topic').click();
      await expect(
        page.getByPlaceholder('Type your topic...'),
      ).toBeVisible();
    });

    test('"Find a Match" stays disabled for custom topic shorter than 2 chars', async ({
      page,
    }) => {
      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Custom Topic').click();
      await page.getByPlaceholder('Type your topic...').fill('A');

      const findMatchBtn = page.getByRole('button', {
        name: /Find a Match/i,
      });
      await expect(findMatchBtn).toBeDisabled();
    });

    test('"Find a Match" enabled for valid custom topic', async ({
      page,
    }) => {
      await page.getByText('Tea', { exact: true }).click();
      await page.getByText('Custom Topic').click();
      await page
        .getByPlaceholder('Type your topic...')
        .fill('My Cool Topic');

      const findMatchBtn = page.getByRole('button', {
        name: /Find a Match/i,
      });
      await expect(findMatchBtn).toBeEnabled();
    });

    test('shows "create a private room" link', async ({ page }) => {
      const link = page.getByRole('link', {
        name: /create a private room/i,
      });
      await expect(link).toBeVisible();
    });
  });
});
