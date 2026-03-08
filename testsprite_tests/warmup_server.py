#!/usr/bin/env python3
"""
Warm up the Next.js dev server by loading all pages the tests need.
Run this before executing the test suite to ensure all pages are compiled
and JS is loaded. This prevents timeouts caused by on-demand compilation.
"""
import asyncio
from playwright import async_api

PAGES_TO_WARM = [
    ('http://localhost:3000/ar/login', '[href*="/login/admin"], [data-testid]'),
    ('http://localhost:3000/ar/login/teacher', '[data-testid="login-email-input"]'),
    ('http://localhost:3000/ar/login/student', '[data-testid="login-email-input"]'),
    ('http://localhost:3000/ar/login/admin', 'body'),
]

async def warmup():
    pw = await async_api.async_playwright().start()
    browser = await pw.chromium.launch(
        headless=True,
        args=['--window-size=1280,720', '--disable-dev-shm-usage', '--ipc=host', '--single-process']
    )
    context = await browser.new_context()
    page = await context.new_page()

    print("Warming up Next.js dev server pages (this may take 2-3 minutes)...")
    for url, selector in PAGES_TO_WARM:
        print(f"  Loading {url} ...")
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=120000)
            try:
                await page.wait_for_selector(selector, timeout=60000)
                print(f"  READY: {url}")
            except Exception:
                print(f"  LOADED (selector not found): {url}")
        except Exception as e:
            print(f"  ERROR: {url} - {str(e)[:80]}")
        await asyncio.sleep(2)

    print("\nServer warmup complete. Run tests now.")
    await context.close()
    await browser.close()
    await pw.stop()

if __name__ == '__main__':
    asyncio.run(warmup())
