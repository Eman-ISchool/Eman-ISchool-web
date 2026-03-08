import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Single middleware instance — handles locale detection and routing.
// Role-based access control is handled at the page level via getServerSession.
// Previously this file had a duplicate named middleware export that created
// 4 separate createMiddleware instances and ran getToken() JWT decoding
// on every single request, adding significant latency to all navigations.
export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
