'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const isArabic = locale === 'ar';
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: '/', label: isArabic ? 'الرئيسية' : 'Home' },
      { href: '/about', label: isArabic ? 'حولنا' : 'About' },
      { href: '/services', label: isArabic ? 'خدماتنا' : 'Services' },
      { href: '/contact', label: isArabic ? 'اتصل بنا' : 'Contact' },
    ],
    [isArabic],
  );

  const dashboardHref = withLocalePrefix('/dashboard', locale);

  const handleLanguageToggle = () => {
    const switchedPath = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${nextLocale}`);
    router.push(switchedPath || `/${nextLocale}`);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: withLocalePrefix('/', locale) });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={withLocalePrefix('/', locale)} className="flex items-center gap-3">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={withLocalePrefix(item.href, locale)}
              className="transition hover:text-sky-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            {isArabic ? 'English' : 'العربية'}
          </button>

          {status === 'authenticated' ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {isArabic ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                {isArabic ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link
                href={withLocalePrefix('/login', locale)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {isArabic ? 'تسجيل الدخول' : 'Login'}
              </Link>
              <Link
                href={withLocalePrefix('/join', locale)}
                className="rounded-xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {isArabic ? 'انضم' : 'Join'}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {isArabic ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={withLocalePrefix(item.href, locale)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {status === 'authenticated' ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  {isArabic ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={withLocalePrefix('/login', locale)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
                <Link
                  href={withLocalePrefix('/join', locale)}
                  className="rounded-xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {isArabic ? 'انضم' : 'Join'}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
