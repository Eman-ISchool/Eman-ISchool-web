import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from './i18n/config';
import { hasAccess, legacyRedirectFor } from './lib/dashboard-permissions';

const intl = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

const DASHBOARD_PATH = /^\/(ar|en)\/dashboard(\/.*)?$/;
const FORBIDDEN_PATH = /^\/(ar|en)\/dashboard\/forbidden$/;
const LOGIN_PATH = /^\/(ar|en)\/(login|$)/;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const legacyTarget = legacyRedirectFor(pathname);
  if (legacyTarget) {
    const dest = req.nextUrl.clone();
    dest.pathname = legacyTarget;
    return NextResponse.redirect(dest, 301);
  }

  if (DASHBOARD_PATH.test(pathname) && !FORBIDDEN_PATH.test(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const localeMatch = pathname.match(/^\/(ar|en)\//);
    const locale = localeMatch?.[1] ?? 'ar';

    if (!token) {
      const hasSessionCookie =
        req.cookies.has('next-auth.session-token') ||
        req.cookies.has('__Secure-next-auth.session-token');
      if (hasSessionCookie) {
        console.error(
          '[middleware] Session cookie exists but JWT cannot be decoded. ' +
          'Verify NEXTAUTH_SECRET is set identically for API routes and middleware.'
        );
      }
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string | undefined) || '';
    if (!hasAccess(role, pathname)) {
      const dest = req.nextUrl.clone();
      dest.pathname = `/${locale}/dashboard/forbidden`;
      return NextResponse.rewrite(dest);
    }
  }

  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
