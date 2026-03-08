import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        context.set_default_timeout(10000)
        page = await context.new_page()

        # Test at desktop viewport (1280x720)
        await page.goto('http://localhost:3000/ar/login/admin', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass
        await asyncio.sleep(2)

        # Assert login form is visible at desktop size
        frame = context.pages[-1]
        await expect(frame.locator('[data-testid="login-email-input"]').first).to_be_visible(timeout=15000)
        await expect(frame.locator('[data-testid="login-password-input"]').first).to_be_visible(timeout=10000)
        await expect(frame.locator('[data-testid="login-submit-button"]').first).to_be_visible(timeout=10000)

        # Switch to mobile viewport (375x667 - iPhone SE)
        await page.set_viewport_size({'width': 375, 'height': 667})
        await asyncio.sleep(1)

        # Assert login form is still visible and accessible at mobile size
        frame = context.pages[-1]
        await expect(frame.locator('[data-testid="login-email-input"]').first).to_be_visible(timeout=10000)
        await expect(frame.locator('[data-testid="login-submit-button"]').first).to_be_visible(timeout=10000)

        # Switch to tablet viewport (768x1024 - iPad)
        await page.set_viewport_size({'width': 768, 'height': 1024})
        await asyncio.sleep(1)

        # Assert login form is still visible at tablet size
        frame = context.pages[-1]
        await expect(frame.locator('[data-testid="login-email-input"]').first).to_be_visible(timeout=10000)
        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
