import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_TOKEN = 'jwt-mock-create-token';
const MOCK_SESSION = {
  id: 'sess-cr-1',
  nickname: 'RoomCreator',
  avatarColor: '#a05c2f',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

const MOCK_ROOM = {
  id: 'room-pvt-abc',
  type: 'private',
  status: 'waiting',
  drinkType: 'coffee',
  topic: 'Technology & Innovation',
  inviteCode: 'ABCD1234',
  maxParticipants: 6,
  createdAt: new Date().toISOString(),
  closedAt: null,
};

async function seedSession(page: Page) {
  await page.addInitScript(
    ({ token, session }) => {
      localStorage.setItem('coffee_session_token', token);
      localStorage.setItem('coffee_session', JSON.stringify(session));
    },
    { token: MOCK_TOKEN, session: MOCK_SESSION },
  );
}

async function mockCreateRoomApi(page: Page) {
  await page.route('**/api/rooms/private', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: MOCK_ROOM,
          inviteCode: MOCK_ROOM.inviteCode,
        }),
      });
    }
    return route.continue();
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Private Room Flow', () => {
  test('redirects to /join if no session', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('coffee_session_token');
    });
    await page.goto('/create');
    await expect(page).toHaveURL(/\/join$/);
  });

  test.describe('with session', () => {
    test.beforeEach(async ({ page }) => {
      await seedSession(page);
      await mockCreateRoomApi(page);
      await page.goto('/create');
    });

    test('create page shows heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Create Private Room/i }),
      ).toBeVisible();
    });

    test('create page shows drink and topic selection', async ({ page }) => {
      // Drinks
      await expect(
        page.getByText('What are you having?'),
      ).toBeVisible();
      await expect(page.getByText('Coffee', { exact: true })).toBeVisible();
      await expect(page.getByText('Tea', { exact: true })).toBeVisible();
      await expect(page.getByText('Other', { exact: true })).toBeVisible();

      // Topics
      await expect(page.getByText('Pick a topic')).toBeVisible();
      await expect(
        page.getByText('Technology & Innovation'),
      ).toBeVisible();
    });

    test('can adjust max participants slider', async ({ page }) => {
      await expect(page.getByText('Max participants')).toBeVisible();

      // The range input should be present
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeVisible();

      // Default value is 6
      await expect(slider).toHaveValue('6');

      // Adjust to a different value
      await slider.fill('8');
      await expect(slider).toHaveValue('8');

      // The displayed value should update
      await expect(page.getByText('8')).toBeVisible();
    });

    test('Create Room button is disabled until drink and topic are selected', async ({
      page,
    }) => {
      const createBtn = page.getByRole('button', {
        name: /Create Room/i,
      });
      await expect(createBtn).toBeDisabled();
    });

    test('creates room and shows invite code', async ({ page }) => {
      // Make selections
      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Technology & Innovation').click();

      // Submit
      await page.getByRole('button', { name: /Create Room/i }).click();

      // Should transition to the success state
      await expect(
        page.getByRole('heading', { name: /Room Created/i }),
      ).toBeVisible();

      // Invite code should be displayed
      await expect(page.getByText('ABCD1234')).toBeVisible();
      await expect(page.getByText('Invite Code')).toBeVisible();
    });

    test('copy button is present on success screen', async ({ page }) => {
      // Create the room
      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Technology & Innovation').click();
      await page.getByRole('button', { name: /Create Room/i }).click();

      // Wait for success state
      await expect(
        page.getByRole('heading', { name: /Room Created/i }),
      ).toBeVisible();

      // The copy button (aria-label) should be present
      const copyBtn = page.getByRole('button', {
        name: /Copy invite code/i,
      });
      await expect(copyBtn).toBeVisible();

      // "Copy room link" text link should be present
      await expect(page.getByText('Copy room link')).toBeVisible();
    });

    test('room details are shown after creation', async ({ page }) => {
      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Technology & Innovation').click();
      await page.getByRole('button', { name: /Create Room/i }).click();

      await expect(
        page.getByRole('heading', { name: /Room Created/i }),
      ).toBeVisible();

      // Room detail summary shows topic, drink, and max participants
      await expect(
        page.getByText('Technology & Innovation'),
      ).toBeVisible();
      await expect(page.getByText('6')).toBeVisible(); // maxParticipants
    });

    test('Enter Room button navigates to room page', async ({ page }) => {
      // Mock the room page load (it will try socket connections)
      await page.route('**/api/rooms/room-pvt-abc/state', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            room: MOCK_ROOM,
            participants: [],
            turnState: {
              roomId: MOCK_ROOM.id,
              currentSpeakerId: null,
              status: 'idle',
              startedAt: null,
              endsAt: null,
              queue: [],
            },
            suggestions: [],
          }),
        }),
      );

      await page.getByText('Coffee', { exact: true }).click();
      await page.getByText('Technology & Innovation').click();
      await page.getByRole('button', { name: /Create Room/i }).click();

      await expect(
        page.getByRole('heading', { name: /Room Created/i }),
      ).toBeVisible();

      // Click Enter Room
      await page
        .getByRole('button', { name: /Enter Room/i })
        .click();

      await expect(page).toHaveURL(/\/room\/room-pvt-abc$/);
    });

    test('back to public matching link is present', async ({ page }) => {
      await expect(
        page.getByRole('link', { name: /Back to public matching/i }),
      ).toBeVisible();
    });
  });
});
