import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Strategy for locale detection
  localeDetection: true,

  // Prefix default locale in URL (e.g., /ar/about instead of /about)
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for
  // - API routes (/api/*)
  // - Static files (/_next/*, /images/*, etc.)
  // - Public files in /public (/*.jpg, /*.svg, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
