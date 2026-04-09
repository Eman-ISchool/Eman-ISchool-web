'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';

interface PublicNavProps {
  activeRoute?: 'about' | 'contact' | 'services';
}

export default function PublicNav({ activeRoute }: PublicNavProps) {
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  const links = [
    { key: 'about' as const, href: '/about', ar: 'حولنا', en: 'About' },
    { key: 'contact' as const, href: '/contact', ar: 'اتصل بنا', en: 'Contact' },
    { key: 'services' as const, href: '/services', ar: 'خدماتنا', en: 'Services' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <Link href={withLocalePrefix('/', locale)} className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <span className="text-lg font-bold text-gray-900">Future Labs Academy</span>
          </Link>

          <div className={`flex items-center gap-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
            {links.map((link) => (
              <Link
                key={link.key}
                href={withLocalePrefix(link.href, locale)}
                className={`text-sm ${
                  activeRoute === link.key
                    ? 'font-medium text-gray-900 underline'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isArabic ? link.ar : link.en}
              </Link>
            ))}

            <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <Link
                href={withLocalePrefix(isArabic ? '/en' : '/ar', '')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1"
              >
                {isArabic ? 'English' : 'العربية'}
              </Link>
              <Link
                href={withLocalePrefix('/login', locale)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isArabic ? 'تسجيل الدخول' : 'Log in'}
              </Link>
              <Link
                href={withLocalePrefix('/join', locale)}
                className="rounded-full bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition"
              >
                {isArabic ? 'انضم' : 'Join'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
