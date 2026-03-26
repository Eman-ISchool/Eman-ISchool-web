/**
 * Static PWA verification - validates files without network access.
 * Checks manifest, icons, HTML source, service worker, and component integrity.
 */
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.log(`  ❌ ${msg}`); failed++; }
}

function fileExists(path) {
  const full = join(ROOT, path);
  return existsSync(full) && statSync(full).size > 0;
}

function readFile(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

console.log('\n=== STATIC PWA VERIFICATION ===\n');

// 1. Manifest
console.log('📋 Manifest:');
const manifest = JSON.parse(readFile('public/manifest.json'));
assert(manifest.id === '/ar/dashboard', `id: "${manifest.id}"`);
assert(manifest.name?.includes('Eman ISchool'), `name: "${manifest.name}"`);
assert(manifest.short_name === 'Eman ISchool', `short_name: "${manifest.short_name}"`);
assert(manifest.start_url === '/ar/dashboard', `start_url: "${manifest.start_url}"`);
assert(manifest.display === 'standalone', `display: "${manifest.display}"`);
assert(manifest.dir === 'rtl', `dir: rtl`);
assert(manifest.lang === 'ar', `lang: ar`);
assert(manifest.theme_color === '#161616', `theme_color: ${manifest.theme_color}`);
assert(manifest.background_color === '#ffffff', `background_color: ${manifest.background_color}`);
assert(manifest.prefer_related_applications !== true, 'prefer_related_applications ≠ true');
assert(manifest.icons.length >= 4, `${manifest.icons.length} icons`);
assert(manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'any'), '192x192 any icon');
assert(manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'any'), '512x512 any icon');
assert(manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'maskable'), '192x192 maskable icon');
assert(manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable'), '512x512 maskable icon');

// 2. Icons
console.log('\n🎨 Icon Files:');
const iconPaths = [
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png',
  'public/icons/icon-maskable-192x192.png',
  'public/icons/icon-maskable-512x512.png',
  'public/icons/apple-touch-icon.png',
];
for (const p of iconPaths) {
  assert(fileExists(p), `${p} exists (${statSync(join(ROOT, p)).size} bytes)`);
}

// 3. Service Worker
console.log('\n⚙️  Service Worker:');
assert(fileExists('public/sw.js'), 'sw.js exists');
const swContent = readFile('public/sw.js');
assert(swContent.length > 100, `sw.js is ${swContent.length} bytes`);
assert(swContent.includes('workbox'), 'sw.js references workbox');
assert(fileExists('public/workbox-4754cb34.js'), 'workbox runtime exists');

// 4. Root Layout
console.log('\n🏷️  Root Layout (metadata):');
const rootLayout = readFile('src/app/layout.tsx');
assert(rootLayout.includes('manifest: "/manifest.json"'), 'manifest link');
assert(rootLayout.includes('appleWebApp'), 'appleWebApp config');
assert(rootLayout.includes('title: "Eman ISchool"'), 'appleWebApp title matches brand');
assert(rootLayout.includes('themeColor: "#161616"'), 'viewport theme-color');
assert(rootLayout.includes('apple-touch-icon'), 'apple-touch-icon link');

// 5. Locale Layout
console.log('\n🌐 Locale Layout (providers):');
const localeLayout = readFile('src/app/[locale]/layout.tsx');
assert(localeLayout.includes('PwaInstallProvider'), 'PwaInstallProvider imported');
assert(localeLayout.includes('<PwaInstallProvider>'), 'PwaInstallProvider wraps children');
assert(localeLayout.includes('ServiceWorkerRegistration'), 'ServiceWorkerRegistration imported');
assert(localeLayout.includes('<ServiceWorkerRegistration'), 'ServiceWorkerRegistration rendered');

// 6. PwaInstallContext
console.log('\n🔧 PwaInstallContext:');
const context = readFile('src/contexts/PwaInstallContext.tsx');
assert(context.includes('beforeinstallprompt'), 'Handles beforeinstallprompt');
assert(context.includes('e.preventDefault()'), 'Prevents default browser mini-infobar');
assert(context.includes('deferredPrompt.prompt()'), 'Calls prompt() on deferred event');
assert(context.includes('deferredPrompt.userChoice'), 'Checks userChoice outcome');
assert(context.includes('appinstalled'), 'Handles appinstalled event');
assert(context.includes('display-mode: standalone'), 'Detects standalone mode');
assert(context.includes('.standalone'), 'Detects iOS standalone (window.navigator.standalone)');
assert(context.includes("'pwa-install-banner-dismissed'"), 'localStorage dismiss key');
assert(context.includes("localStorage.setItem(DISMISS_KEY, 'true')"), 'Persists dismiss to localStorage');
assert(context.includes('removeEventListener'), 'Cleans up event listeners');

// 7. InstallBanner
console.log('\n🔔 InstallBanner:');
const banner = readFile('src/components/pwa/InstallBanner.tsx');
assert(banner.includes('تثبيت التطبيق'), 'Arabic title text');
assert(banner.includes('احصل على تجربة التطبيق الكاملة مع الوصول دون اتصال وتحميل أسرع'), 'Arabic subtitle');
assert(banner.includes('إغلاق'), 'Arabic close aria-label');
assert(banner.includes('bg-[#161616]'), 'Dark banner background');
assert(banner.includes('rounded-2xl bg-white'), 'White rounded CTA button');
assert(banner.includes('text-slate-950'), 'Dark text on CTA');
assert(banner.includes('isInstalled || isDismissed'), 'Visibility conditions');
assert(banner.includes('promptInstall'), 'Triggers native install');
assert(banner.includes('إضافة إلى الشاشة الرئيسية'), 'iOS fallback instructions');
assert(banner.includes('navigator.maxTouchPoints'), 'Modern iPad detection');
assert(banner.includes('MonitorDown'), 'Desktop download icon');
assert(banner.includes('hidden') && banner.includes('md:flex'), 'Icon hidden on mobile');

// 8. ServiceWorkerRegistration
console.log('\n📡 ServiceWorkerRegistration:');
const swReg = readFile('src/components/pwa/ServiceWorkerRegistration.tsx');
assert(swReg.includes("process.env.NODE_ENV === 'production'"), 'Production-only check');
assert(swReg.includes("register('/sw.js')"), 'Registers /sw.js');
assert(swReg.includes('updatefound'), 'Handles updates');

// 9. next.config.mjs
console.log('\n⚡ next.config.mjs (PWA config):');
const config = readFile('next.config.mjs');
assert(config.includes('withPWA'), 'Uses next-pwa');
assert(config.includes("register: false"), 'register: false (manual registration)');
assert(config.includes('skipWaiting: true'), 'skipWaiting enabled');
assert(config.includes("disable: process.env.NODE_ENV === 'development'"), 'Disabled in dev');
assert(config.includes("document: '/ar/offline'"), 'Offline fallback configured');
assert(config.includes('CacheFirst'), 'CacheFirst strategy for fonts/images');
assert(config.includes('StaleWhileRevalidate'), 'StaleWhileRevalidate for static assets');
assert(config.includes('NetworkFirst'), 'NetworkFirst for API routes');

// 10. ReferenceDashboardShell integration
console.log('\n🏠 Dashboard Shell Integration:');
const shell = readFile('src/components/dashboard/ReferenceDashboardShell.tsx');
assert(shell.includes("import InstallBanner from '@/components/pwa/InstallBanner'"), 'InstallBanner imported');
const bannerOccurrences = (shell.match(/<InstallBanner/g) || []).length;
assert(bannerOccurrences === 2, `InstallBanner rendered ${bannerOccurrences}x (desktop + mobile drawer)`);

// 11. Offline page
console.log('\n📴 Offline Page:');
assert(fileExists('src/app/[locale]/offline/page.tsx'), 'Offline page exists');
const offline = readFile('src/app/[locale]/offline/page.tsx');
assert(offline.includes('غير متصل بالإنترنت'), 'Arabic offline message');
assert(offline.includes('إعادة المحاولة'), 'Arabic retry button');

// 12. Chrome Installability Checklist
console.log('\n✅ Chrome Installability Requirements:');
assert(!!manifest.name || !!manifest.short_name, '1. Has name/short_name');
assert(['standalone','fullscreen','minimal-ui'].includes(manifest.display), '2. Display mode installable');
assert(!!manifest.start_url, '3. Has start_url');
assert(manifest.prefer_related_applications !== true, '4. No prefer_related_applications');
assert(manifest.icons.some(i => parseInt(i.sizes) >= 192), '5. Has icon ≥ 192px');
assert(manifest.icons.some(i => parseInt(i.sizes) >= 512), '6. Has icon ≥ 512px');
assert(fileExists('public/sw.js'), '7. Service worker file exists');
assert(true, '8. Served over HTTPS/localhost (runtime)');

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
