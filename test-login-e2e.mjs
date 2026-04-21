import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // Step 1: Reset password via debug endpoint
  console.log('=== Step 1: Resetting password ===');
  await page.goto('http://localhost:3000/api/debug-reset-password?email=student1@eduverse.com&password=12345678');
  const resetResult = JSON.parse(await page.textContent('body'));
  console.log('Reset result:', JSON.stringify(resetResult, null, 2));

  if (!resetResult.success) {
    console.error('FAILED to reset password');
    process.exit(1);
  }

  // Step 2: Verify via debug-login
  console.log('\n=== Step 2: Verifying password in DB ===');
  await page.goto('http://localhost:3000/api/debug-login?phone=555555555&countryCode=971&password=12345678&email=student1@eduverse.com');
  const verifyResult = JSON.parse(await page.textContent('body'));
  console.log('Phone password check:', verifyResult.phonePasswordCheck);
  console.log('Email password check:', verifyResult.emailPasswordCheck);

  // Step 3: Try actual login
  console.log('\n=== Step 3: Testing actual login ===');
  await page.goto('http://localhost:3000/ar/auth/signin');
  await page.waitForTimeout(2000);

  // Find and fill phone field
  const phoneInput = page.locator('input[inputmode="tel"]').first();
  await phoneInput.fill('555555555');

  // Find and fill password field
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('12345678');

  // Click sign in button
  const signInButton = page.locator('button[type="submit"]').first();
  await signInButton.click();

  // Wait for response
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  // Check for error message
  const errorEl = await page.locator('text=بيانات الدخول غير صحيحة').count();
  if (errorEl > 0) {
    console.log('ERROR: Login still fails with "invalid credentials"');

    // Check network requests
    console.log('\nChecking page console for auth debug logs...');
  } else {
    console.log('SUCCESS: Login appears to have worked!');
  }

  // Take screenshot
  await page.screenshot({ path: 'login-test-result.png' });
  console.log('Screenshot saved to login-test-result.png');

} catch (e) {
  console.error('Test error:', e.message);
} finally {
  await browser.close();
}
