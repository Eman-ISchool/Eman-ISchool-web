import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Strategy for locale detection
  localeDetection: true,

  // Always use a prefix to ensure consistent routing
  // This is important for static export compatibility
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - API routes (/api/*)
  // - Static files (/_next/*, /images/*, etc.)
  // - Public files in /public (/*.jpg, /*.svg, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
