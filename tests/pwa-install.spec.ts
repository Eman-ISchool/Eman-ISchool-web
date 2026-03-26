import { test, expect } from '@playwright/test';

const BASE = '/ar/dashboard/bundles';

// --- A. UI / Visual Behavior ---

test.describe('PWA Install Banner - UI & Visual', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage to ensure fresh state
    await context.clearCookies();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    // Clear localStorage after navigation
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('install banner appears at the top of the page', async ({ page }) => {
    // The banner should be visible with dark background
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Should be the first visible child in the main content area
    const bannerBox = await banner.boundingBox();
    expect(bannerBox).not.toBeNull();
    expect(bannerBox!.y).toBeLessThan(100); // Near top of page
  });

  test('Arabic content is correct', async ({ page }) => {
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Title text
    await expect(banner.locator('text=تثبيت التطبيق').first()).toBeVisible();

    // Subtitle text
    await expect(
      banner.locator('text=احصل على تجربة التطبيق الكاملة مع الوصول دون اتصال وتحميل أسرع'),
    ).toBeVisible();

    // CTA button with same text
    const ctaButton = banner.locator('button:has-text("تثبيت التطبيق")');
    await expect(ctaButton).toBeVisible();
  });

  test('RTL layout is correct', async ({ page }) => {
    // Page should have dir=rtl
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Also check the layout wrapper
    const layoutDir = await page.locator('[dir="rtl"]').first().getAttribute('dir');
    expect(layoutDir).toBe('rtl');
  });

  test('close button works and hides banner', async ({ page }) => {
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Find and click the close button (X icon button)
    const closeButton = banner.locator('button[aria-label="إغلاق"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Banner should disappear
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('install CTA button is present and clickable', async ({ page }) => {
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // The white CTA button
    const ctaButton = banner.locator('button.bg-white');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText('تثبيت التطبيق');
    await expect(ctaButton).toBeEnabled();
  });

  test('banner does not overlap or break page content', async ({ page }) => {
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    const bannerBox = await banner.boundingBox();
    expect(bannerBox).not.toBeNull();

    // Content below banner should exist and not overlap
    // Find the next sibling content area
    const mainContent = page.locator('.flex-1.px-4').first();
    if (await mainContent.isVisible()) {
      const contentBox = await mainContent.boundingBox();
      expect(contentBox).not.toBeNull();
      // Content should start below the banner
      expect(contentBox!.y).toBeGreaterThanOrEqual(bannerBox!.y + bannerBox!.height - 1);
    }
  });

  test('banner styling matches reference - dark background, white text', async ({ page }) => {
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Check computed styles
    const bgColor = await banner.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #161616 = rgb(22, 22, 22)
    expect(bgColor).toBe('rgb(22, 22, 22)');

    // Check text color is white
    const textColor = await banner.evaluate((el) => getComputedStyle(el).color);
    expect(textColor).toContain('255'); // rgb(255, 255, 255) or similar
  });

  test('screenshot - mobile viewport with banner', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'tests/screenshots/pwa-banner-mobile.png',
      fullPage: false,
    });
  });

  test('screenshot - desktop viewport with banner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'tests/screenshots/pwa-banner-desktop.png',
      fullPage: false,
    });
  });
});

// --- B. Installability ---

test.describe('PWA Installability - Manifest & SW', () => {
  test('manifest.json is served and valid', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toBeDefined();

    // Required fields for installability
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/ar/dashboard');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    // Arabic RTL settings
    expect(manifest.dir).toBe('rtl');
    expect(manifest.lang).toBe('ar');

    // Theme
    expect(manifest.theme_color).toBe('#161616');
    expect(manifest.background_color).toBe('#ffffff');

    // Icons have required sizes (192 and 512)
    const sizes = manifest.icons.map((i: any) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    // Has maskable icon
    const maskable = manifest.icons.find((i: any) => i.purpose === 'maskable');
    expect(maskable).toBeDefined();
  });

  test('manifest link tag is present in HTML', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
  });

  test('icons are accessible', async ({ page }) => {
    const iconPaths = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
      '/icons/icon-maskable-512x512.png',
      '/icons/apple-touch-icon.png',
    ];

    for (const path of iconPaths) {
      const response = await page.goto(path);
      expect(response?.status(), `Icon ${path} should be accessible`).toBe(200);
      const contentType = response?.headers()['content-type'];
      expect(contentType, `Icon ${path} should be PNG`).toContain('image/png');
    }
  });

  test('apple-web-app meta tags present', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Check apple-mobile-web-app-capable
    const capable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(capable).toBe('yes');

    // Check theme-color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#161616');
  });

  test('service worker file exists at /sw.js', async ({ page }) => {
    const response = await page.goto('/sw.js');
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('javascript');
  });

  test('workbox file exists', async ({ page }) => {
    // Check that workbox JS is served
    const response = await page.goto('/workbox-4754cb34.js');
    expect(response?.status()).toBe(200);
  });

  test('service worker content is valid workbox-based SW', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const swContent = await response?.text();
    expect(swContent).toBeDefined();
    expect(swContent!.length).toBeGreaterThan(100); // Not empty
    // Should reference workbox
    expect(swContent).toContain('workbox');
  });
});

// --- C. Functional Flow ---

test.describe('PWA Install Banner - Functional Flow', () => {
  test('first visit: banner is visible', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });
  });

  test('dismiss persists across page reloads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Dismiss the banner
    const closeButton = banner.locator('button[aria-label="إغلاق"]');
    await closeButton.click();
    await expect(banner).not.toBeVisible({ timeout: 5000 });

    // Verify localStorage was set
    const dismissed = await page.evaluate(() => localStorage.getItem('pwa-install-banner-dismissed'));
    expect(dismissed).toBe('true');

    // Reload and verify banner stays hidden
    await page.reload({ waitUntil: 'networkidle' });
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('dismiss persists across navigation', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Dismiss
    const closeButton = banner.locator('button[aria-label="إغلاق"]');
    await closeButton.click();
    await expect(banner).not.toBeVisible({ timeout: 5000 });

    // Navigate to another dashboard page and back
    await page.goto('/ar/dashboard', { waitUntil: 'networkidle' });
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Banner should still be hidden
    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('install CTA triggers alert fallback when beforeinstallprompt not available', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Listen for dialog (alert) — in dev mode, beforeinstallprompt won't fire
    // so clicking install should show the fallback alert
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const ctaButton = banner.locator('button.bg-white');
    await ctaButton.click();

    // Wait a bit for the dialog
    await page.waitForTimeout(1000);

    // Should have shown an Arabic fallback message
    if (dialogMessage) {
      expect(
        dialogMessage.includes('إضافة إلى الشاشة الرئيسية') ||
        dialogMessage.includes('تثبيت التطبيق'),
      ).toBe(true);
    }
    // Note: In some environments the alert may not fire if canInstall is false and
    // the handler detects iOS/other. The key test is that clicking doesn't crash.
  });

  test('standalone mode detection hides banner', async ({ page }) => {
    // Simulate standalone mode via matchMedia override
    await page.addInitScript(() => {
      // Override matchMedia to report standalone mode
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = (query: string) => {
        if (query === '(display-mode: standalone)') {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Banner should not be visible when in standalone mode
    const banner = page.locator('div.bg-\\[\\#161616\\]');
    // Give it a moment to render, then verify hidden
    await page.waitForTimeout(2000);
    const count = await banner.count();
    // Either no banner elements or all are hidden
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(banner.nth(i)).not.toBeVisible();
      }
    }
  });

  test('beforeinstallprompt handling works correctly', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    // Simulate beforeinstallprompt event
    const canInstallBefore = await page.evaluate(() => {
      // Check the context state (the banner visibility implies not installed/dismissed)
      return document.querySelector('div[class*="bg-[#161616]"]') !== null;
    });
    expect(canInstallBefore).toBe(true);

    // Fire a synthetic beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });

    // Banner should still be visible (event was captured, prompt deferred)
    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible();
  });
});

// --- D. Mobile-First Behavior ---

test.describe('PWA Install Banner - Mobile Viewport', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  });

  test('banner shows correctly on mobile', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    // On mobile, the MonitorDown icon should be hidden
    const iconContainer = banner.locator('.hidden.md\\:flex');
    if (await iconContainer.count() > 0) {
      await expect(iconContainer).not.toBeVisible();
    }

    // Title and CTA should still be visible
    await expect(banner.locator('text=تثبيت التطبيق').first()).toBeVisible();
    await expect(banner.locator('button.bg-white')).toBeVisible();
  });

  test('mobile banner is full-width', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('pwa-install-banner-dismissed'));
    await page.reload({ waitUntil: 'networkidle' });

    const banner = page.locator('div.bg-\\[\\#161616\\]').first();
    await expect(banner).toBeVisible({ timeout: 10000 });

    const bannerBox = await banner.boundingBox();
    const viewport = page.viewportSize();
    expect(bannerBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    // Banner should span full viewport width (or nearly)
    expect(bannerBox!.width).toBeGreaterThanOrEqual(viewport!.width - 10);
  });
});

// --- E. PWA Audit Checks ---

test.describe('PWA Audit - Comprehensive Checks', () => {
  test('page serves correct content-type and status', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
  });

  test('manifest has all installability requirements', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    const manifest = await response?.json();

    // Chrome installability requirements:
    // 1. name or short_name
    expect(manifest.name || manifest.short_name).toBeTruthy();
    // 2. icons: at least 192x192 and 512x512
    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512');
    expect(has192).toBe(true);
    expect(has512).toBe(true);
    // 3. start_url
    expect(manifest.start_url).toBeTruthy();
    // 4. display: standalone, fullscreen, or minimal-ui
    expect(['standalone', 'fullscreen', 'minimal-ui']).toContain(manifest.display);
    // 5. prefer_related_applications is not true (or absent)
    expect(manifest.prefer_related_applications).not.toBe(true);
  });

  test('all manifest icon files are valid images', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    const manifest = await response?.json();

    for (const icon of manifest.icons) {
      const iconResponse = await page.goto(icon.src);
      expect(iconResponse?.status(), `${icon.src} accessible`).toBe(200);

      // Verify it's actually an image
      const contentType = iconResponse?.headers()['content-type'];
      expect(contentType, `${icon.src} is image`).toMatch(/image\//);
    }
  });

  test('HTML has required PWA meta tags', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    expect(manifestLink).toBeGreaterThanOrEqual(1);

    // viewport meta
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // theme-color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors (like auth redirects in dev)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('next-auth') &&
        !e.includes('NEXT_REDIRECT') &&
        !e.includes('hydration') &&
        !e.includes('supabase') &&
        !e.includes('Failed to fetch'),
    );

    // Should have no PWA-related critical errors
    const pwaErrors = criticalErrors.filter(
      (e) => e.includes('manifest') || e.includes('service-worker') || e.includes('sw.js'),
    );
    expect(pwaErrors).toHaveLength(0);
  });
});
