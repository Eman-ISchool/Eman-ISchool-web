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
    const role = (token?.role as string | undefined) || '';
    if (!hasAccess(role, pathname)) {
      const localeMatch = pathname.match(/^\/(ar|en)\//);
      const locale = localeMatch?.[1] ?? 'ar';
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
