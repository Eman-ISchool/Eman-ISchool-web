import asyncio
import re
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
        context = await browser.new_context()
        context.set_default_timeout(10000)
        page = await context.new_page()

        # Navigate directly to student login page
        await page.goto('http://localhost:3000/login/student', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass

        # Log in as student using data-testid selectors
        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-email-input"]').nth(0)
        await page.wait_for_timeout(2000)
        await elem.fill('student@test.com')

        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-password-input"]').nth(0)
        await page.wait_for_timeout(1000)
        await elem.fill('TestStudent123!')

        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-submit-button"]').nth(0)
        await page.wait_for_timeout(1000)
        await elem.click(timeout=10000)

        # Wait for student home
        await page.wait_for_url(re.compile(r'/student/home'), timeout=30000)
        await asyncio.sleep(2)

        # Assert student home is loaded (student home uses 'الدروس القادمة' from LanguageContext)
        frame = context.pages[-1]
        await expect(frame.locator('text=الدروس القادمة').first).to_be_visible(timeout=15000)

        # Verify notifications API endpoint responds (authenticated request uses page context cookies)
        response = await page.request.get('http://localhost:3000/api/notifications')
        status = response.status
        assert status in [200, 204], (
            f"Notifications API returned unexpected status: {status}. Expected 200 or 204."
        )
        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
