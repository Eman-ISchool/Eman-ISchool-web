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

        # Step 1: Verify unauthenticated access to admin API returns 401
        response = await page.request.get('http://localhost:3000/api/admin/stats')
        unauth_status = response.status
        assert unauth_status == 401, (
            f"API security FAIL: /api/admin/stats returned {unauth_status} without auth (expected 401)"
        )

        # Step 2: Log in as admin and verify authenticated access
        await page.goto('http://localhost:3000/login/teacher', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass

        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-email-input"]').nth(0)
        await page.wait_for_timeout(2000)
        await elem.fill('admin@test.com')

        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-password-input"]').nth(0)
        await page.wait_for_timeout(1000)
        await elem.fill('TestAdmin123!')

        frame = context.pages[-1]
        elem = frame.locator('[data-testid="login-submit-button"]').nth(0)
        await page.wait_for_timeout(1000)
        await elem.click(timeout=10000)

        # Wait for admin home
        await page.wait_for_url(re.compile(r'/admin/home'), timeout=30000)
        await asyncio.sleep(1)

        # Verify authenticated admin can access stats API (session cookies sent automatically)
        auth_response = await page.request.get('http://localhost:3000/api/admin/stats')
        auth_status = auth_response.status
        assert auth_status == 200, (
            f"Admin API access FAIL: /api/admin/stats returned {auth_status} for authenticated admin (expected 200)"
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
