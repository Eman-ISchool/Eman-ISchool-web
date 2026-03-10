'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const isArabic = locale === 'ar';

  const quickLinks = [
    { href: '/about', label: isArabic ? 'حولنا' : 'About' },
    { href: '/services', label: isArabic ? 'خدماتنا' : 'Services' },
    { href: '/contact', label: isArabic ? 'اتصل بنا' : 'Contact' },
    { href: '/login', label: isArabic ? 'تسجيل الدخول' : 'Login' },
    { href: '/join', label: isArabic ? 'انضم' : 'Join' },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white">Eduverse</h2>
          <p className="max-w-md text-sm leading-7 text-slate-400">
            {isArabic
              ? 'تجربة عامة مبسطة مستوحاة من المرجع: تعريف سريع، مسارات دخول واضحة، وصفحات عامة مباشرة.'
              : 'A simplified public experience inspired by the reference: clear discovery, direct entry paths, and focused marketing pages.'}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {isArabic ? 'روابط سريعة' : 'Quick links'}
          </h3>
          <div className="grid gap-3 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocalePrefix(link.href, locale)}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {isArabic ? 'تواصل' : 'Contact'}
          </h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>hello@eduverse.local</p>
            <p>+962 79 000 0000</p>
            <p>{isArabic ? 'دبي / عمّان / الرياض' : 'Dubai / Amman / Riyadh'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Eduverse
      </div>
    </footer>
  );
}

