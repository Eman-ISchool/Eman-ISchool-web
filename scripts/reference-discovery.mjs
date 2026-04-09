import { firefox } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const EVIDENCE_DIR = join(process.cwd(), 'docs', 'discovery', 'screenshots');
mkdirSync(EVIDENCE_DIR, { recursive: true });

async function run() {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar',
  });
  const page = await context.newPage();

  // Step 1: Navigate to login page
  console.log('Navigating to reference login page...');
  await page.goto('https://futurelab.school/ar/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: join(EVIDENCE_DIR, 'ref-login-ar.png'), fullPage: true });
  console.log('Screenshot: ref-login-ar.png');

  // Get login page structure
  const loginSnapshot = await page.evaluate(() => {
    const data = {};
    // Get all form fields
    data.inputs = [...document.querySelectorAll('input, select, textarea')].map(el => ({
      type: el.type,
      name: el.name,
      placeholder: el.placeholder,
      label: el.labels?.[0]?.textContent?.trim() || '',
      required: el.required,
    }));
    // Get all buttons
    data.buttons = [...document.querySelectorAll('button, [role="button"], a.btn')].map(el => ({
      text: el.textContent?.trim(),
      type: el.type || '',
      href: el.href || '',
    }));
    // Get all links
    data.links = [...document.querySelectorAll('a')].map(el => ({
      text: el.textContent?.trim(),
      href: el.href,
    }));
    // Get page title
    data.title = document.title;
    // Get all visible text
    data.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim(),
    }));
    return data;
  });

  console.log('LOGIN PAGE STRUCTURE:');
  console.log(JSON.stringify(loginSnapshot, null, 2));

  // Step 2: Login with credentials
  console.log('\nAttempting login...');

  // Find and interact with country selector and phone field
  const phoneInput = await page.$('input[type="tel"], input[name="phone"], input[name="mobile"]');
  const passwordInput = await page.$('input[type="password"]');

  if (phoneInput && passwordInput) {
    // Try to find country selector
    const countrySelectors = await page.$$('[class*="country"], [class*="phone-code"], select, [role="combobox"]');
    console.log(`Found ${countrySelectors.length} potential country selectors`);

    await phoneInput.fill('790320149');
    await passwordInput.fill('12345678');

    // Screenshot filled form
    await page.screenshot({ path: join(EVIDENCE_DIR, 'ref-login-filled.png'), fullPage: true });

    // Submit
    const submitBtn = await page.$('button[type="submit"], button:has-text("تسجيل"), button:has-text("دخول")');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);

      console.log('Post-login URL:', page.url());
      await page.screenshot({ path: join(EVIDENCE_DIR, 'ref-post-login.png'), fullPage: true });
    }
  } else {
    console.log('Could not find phone/password fields. Taking full page content...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page text:', bodyText.substring(0, 2000));
  }

  // Step 3: If logged in, take dashboard screenshots
  if (page.url().includes('dashboard') || page.url().includes('home')) {
    console.log('\n=== DASHBOARD DISCOVERY ===');
    await page.screenshot({ path: join(EVIDENCE_DIR, 'ref-dashboard-ar.png'), fullPage: true });

    // Get sidebar items
    const sidebarItems = await page.evaluate(() => {
      const items = [...document.querySelectorAll('nav a, aside a, [class*="sidebar"] a, [class*="menu"] a, [class*="nav"] a')];
      return items.map(el => ({
        text: el.textContent?.trim(),
        href: el.href,
        active: el.classList.contains('active') || el.getAttribute('aria-current') === 'page',
      }));
    });
    console.log('SIDEBAR/NAV ITEMS:');
    console.log(JSON.stringify(sidebarItems, null, 2));

    // Get dashboard summary cards
    const dashboardCards = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('[class*="card"], [class*="stat"], [class*="summary"]')];
      return cards.slice(0, 20).map(el => ({
        text: el.textContent?.trim().substring(0, 200),
        className: el.className,
      }));
    });
    console.log('\nDASHBOARD CARDS:');
    console.log(JSON.stringify(dashboardCards, null, 2));
  }

  await browser.close();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
