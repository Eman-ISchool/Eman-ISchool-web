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

        # Test Arabic locale (RTL)
        await page.goto('http://localhost:3000/ar/login', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass
        await asyncio.sleep(2)

        # Assert Arabic page loads with Eduverse branding
        frame = context.pages[-1]
        await expect(frame.locator('text=Eduverse').first).to_be_visible(timeout=15000)

        # Verify Arabic locale: the locale layout wrapper div has dir="rtl"
        # (The root html[lang] is set by a NEXT_LOCALE cookie, but the locale layout div reflects URL locale)
        ar_dir = await page.locator('div[dir]').first.get_attribute('dir')
        assert ar_dir == 'rtl', f"Expected dir='rtl' for Arabic locale, got: {ar_dir}"

        # Test English locale (LTR)
        await page.goto('http://localhost:3000/en/login', wait_until="commit", timeout=60000)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass
        await asyncio.sleep(2)

        # Assert English page loads with Eduverse branding
        frame = context.pages[-1]
        await expect(frame.locator('text=Eduverse').first).to_be_visible(timeout=15000)

        # Verify English locale: the locale layout wrapper div has dir="ltr"
        en_dir = await page.locator('div[dir]').first.get_attribute('dir')
        assert en_dir == 'ltr', f"Expected dir='ltr' for English locale, got: {en_dir}"

        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
