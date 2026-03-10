import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('scrape all authenticated routes', async ({ page }) => {
    test.setTimeout(0);
    // Login first
    console.log('Logging in...');
    await page.goto('https://futurelab.school/ar/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.click('button[role="combobox"]');
    await page.waitForTimeout(1000);
    await page.locator('[data-value="962"]').click();
    await page.waitForTimeout(1000);

    await page.fill('#phone', '790320149');
    await page.fill('#password', '12345678');
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard...');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Read links
    const linksRaw = fs.readFileSync('futurelab-links.json', 'utf8');
    const links = JSON.parse(linksRaw);

    // Make output directory
    const outDir = 'futurelab-scrape';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    // Visit a subset to avoid timing out (we will just sample 5 core ones for the design system extraction)
    const targetRoutes = links.map((l: any) => l.href);


    for (const url of targetRoutes) {
        console.log(`Visiting: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(3000); // Wait for rendering

            const slug = url.split('/').filter(Boolean).pop() || 'index';

            const html = await page.content();
            fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
            await page.screenshot({ path: path.join(outDir, `${slug}.png`), fullPage: true });
        } catch (e) {
            console.error(`Failed to scrape ${url}:`, e);
        }
    }

    console.log('Done scraping sample routes.');
});
