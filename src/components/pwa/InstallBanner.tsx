'use client';

import { MonitorDown, X } from 'lucide-react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';

interface InstallBannerProps {
  locale?: string;
}

/**
 * PWA install banner matching the reference futurelab.school design.
 *
 * Shows at the top of the page with:
 * - Dark (#161616) background
 * - Close (X) button
 * - Centered title + subtitle in Arabic
 * - White "تثبيت التطبيق" CTA button
 *
 * Visibility rules:
 * - Hidden when app is already installed (standalone mode)
 * - Hidden after user dismisses (persisted in localStorage)
 * - Hidden when browser doesn't support install prompt AND we can't detect beforeinstallprompt
 * - On first visit, shown immediately (even before beforeinstallprompt fires, as a fallback UX)
 */
export default function InstallBanner({ locale }: InstallBannerProps) {
  const { canInstall, isInstalled, isDismissed, promptInstall, dismissBanner } =
    usePwaInstall();

  const isArabic = !locale || locale === 'ar';

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed) return null;

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      // Fallback: guide user to browser menu (iOS Safari, Firefox, etc.)
      // Use the same pattern as the reference site
      if (typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // iOS: Safari Add to Home Screen
        window.alert(
          isArabic
            ? 'اضغط على زر المشاركة ⬆ ثم اختر "إضافة إلى الشاشة الرئيسية"'
            : 'Tap the Share button ⬆ then choose "Add to Home Screen"',
        );
      } else {
        window.alert(
          isArabic
            ? 'افتح قائمة المتصفح واختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"'
            : 'Open browser menu and choose "Add to Home Screen" or "Install app"',
        );
      }
    }
  };

  return (
    <div className="bg-[#161616] px-5 py-4 text-white sm:px-8">
      <div className="flex items-center justify-between gap-5">
        {/* Close button */}
        <button
          type="button"
          onClick={dismissBanner}
          className="shrink-0 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={isArabic ? 'إغلاق' : 'Close'}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Center content: icon + text */}
        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="hidden rounded-2xl border border-white/15 bg-white/5 p-2 text-white/80 md:flex">
            <MonitorDown className="h-4 w-4" />
          </div>

          <div className="text-center">
            <p className="text-base font-bold">
              {isArabic ? 'تثبيت التطبيق' : 'Install app'}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {isArabic
                ? 'احصل على تجربة التطبيق الكاملة مع الوصول دون اتصال وتحميل أسرع'
                : 'Get the full app experience with offline access and faster loading'}
            </p>
          </div>
        </div>

        {/* Install CTA button */}
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
        >
          {isArabic ? 'تثبيت التطبيق' : 'Install app'}
        </button>
      </div>
    </div>
  );
}
