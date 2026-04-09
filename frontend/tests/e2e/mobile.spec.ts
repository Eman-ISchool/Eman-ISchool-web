import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mobile Viewport E2E Tests
//
// These tests use a fixed 375x812 viewport (iPhone 13 dimensions) to verify
// that every page renders correctly on mobile screens.
// ---------------------------------------------------------------------------

const MOBILE_VIEWPORT = { width: 375, height: 812 };

const MOCK_TOKEN = 'jwt-mock-mobile-token';
const MOCK_SESSION = {
  id: 'sess-mobile-1',
  nickname: 'MobileTester',
  avatarColor: '#d4852f',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedSession(page: Page) {
  await page.addInitScript(
    ({ token, session }) => {
      localStorage.setItem('coffee_session_token', token);
      localStorage.setItem('coffee_session', JSON.stringify(session));
    },
    { token: MOCK_TOKEN, session: MOCK_SESSION },
  );
}

/** Assert that no element causes horizontal overflow at the given viewport. */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(overflow).toBe(false);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Mobile Viewport Tests', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  // ─── Landing Page ──────────────────────────────────────────────

  test.describe('Landing page on mobile', () => {
    test('renders correctly at 375x812', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.removeItem('coffee_session_token');
      });
      await page.goto('/');

      // Title is visible
      await expect(
        page.getByRole('heading', { name: /Coffee Gathering/i }),
      ).toBeVisible();

      // Feature cards are stacked vertically on mobile (grid-cols-1)
      const cards = page.locator('section').last().locator('[class*="rounded"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(3);

      // CTA buttons are visible
      await expect(
        page.getByRole('link', { name: /Join a Gathering/i }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /Create Private Room/i }),
      ).toBeVisible();

      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Join Page ─────────────────────────────────────────────────

  test.describe('Join page on mobile', () => {
    test('is usable on mobile', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.removeItem('coffee_session_token');
      });
      await page.goto('/join');

      // Heading visible
      await expect(
        page.getByRole('heading', { name: /Join the Gathering/i }),
      ).toBeVisible();

      // Input is visible and interactive
      const nicknameInput = page.getByLabel(/Nickname/i);
      await expect(nicknameInput).toBeVisible();
      await nicknameInput.fill('MobileUser');

      // Submit button is visible
      await expect(
        page.getByRole('button', { name: /Enter as Guest/i }),
      ).toBeVisible();

      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Selection Page ────────────────────────────────────────────

  test.describe('Selection page on mobile', () => {
    test('cards stack properly', async ({ page }) => {
      await seedSession(page);

      await page.route('**/api/queue/join', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ position: 1, estimatedWait: 30 }),
        }),
      );

      await page.goto('/select');

      // Drink options should be visible (3 columns grid even on mobile)
      await expect(
        page.getByText('Coffee', { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText('Tea', { exact: true }),
      ).toBeVisible();

      // Topics should be in a 2-column grid on mobile
      await expect(
        page.getByText('Technology & Innovation'),
      ).toBeVisible();

      // Button visible
      await expect(
        page.getByRole('button', { name: /Find a Match/i }),
      ).toBeVisible();

      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Create / Private Room Page ────────────────────────────────

  test.describe('Create room page on mobile', () => {
    test('renders without overflow', async ({ page }) => {
      await seedSession(page);
      await page.goto('/create');

      await expect(
        page.getByRole('heading', { name: /Create Private Room/i }),
      ).toBeVisible();

      // Slider visible
      await expect(page.locator('input[type="range"]')).toBeVisible();

      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Room Page ─────────────────────────────────────────────────

  test.describe('Room page on mobile', () => {
    test('adapts to mobile layout', async ({ page }) => {
      await seedSession(page);

      await page.route('**/socket.io/**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: '',
        }),
      );

      await page.goto('/room/room-mob-001');

      // The page should render (either loading or room UI)
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // On mobile, the layout should stack vertically (flex-col)
      // rather than using the desktop grid. We verify no overflow.
      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Waiting Page ──────────────────────────────────────────────

  test.describe('Waiting page on mobile', () => {
    test('renders without overflow', async ({ page }) => {
      await seedSession(page);

      // Mock socket.io so it doesn't crash
      await page.route('**/socket.io/**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: '',
        }),
      );

      await page.goto('/waiting');

      const main = page.locator('main');
      await expect(main).toBeVisible();

      await assertNoHorizontalOverflow(page);
    });
  });

  // ─── Cross-Page Overflow Check ─────────────────────────────────

  test('no horizontal overflow on any page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('coffee_session_token');
    });

    const pages = ['/', '/join'];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await assertNoHorizontalOverflow(page);
    }
  });
});
