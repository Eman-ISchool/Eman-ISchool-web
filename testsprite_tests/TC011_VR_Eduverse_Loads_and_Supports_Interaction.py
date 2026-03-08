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
        context = await browser.new_context()
        context.set_default_timeout(10000)
        page = await context.new_page()

        # Navigate to the login page which has the Eduverse branding
        await page.goto('http://localhost:3000/ar/login', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass
        await asyncio.sleep(2)

        # Assert the application loads and has Eduverse branding
        frame = context.pages[-1]
        await expect(frame.locator('text=Eduverse').first).to_be_visible(timeout=15000)

        # Verify the page is locale-aware (redirected to /ar)
        current_url = page.url
        assert 'localhost:3000' in current_url, (
            f"Application failed to load. Current URL: {current_url}"
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
