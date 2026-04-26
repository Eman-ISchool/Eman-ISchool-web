import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headersList = headers();
  const session = await getServerSession(authOptions);

  let jwtToken: any = null;
  let jwtError: string | null = null;
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const reqLike = {
      headers: headersList,
      cookies: cookieStore,
    } as any;
    jwtToken = await getToken({ req: reqLike, secret: process.env.NEXTAUTH_SECRET });
  } catch (e: any) {
    jwtError = e?.message || String(e);
  }

  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const secretPrefix = process.env.NEXTAUTH_SECRET
    ? process.env.NEXTAUTH_SECRET.substring(0, 6) + '...'
    : 'NOT SET';

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextauth: {
      secretConfigured: hasSecret,
      secretPrefix,
      url: process.env.NEXTAUTH_URL || 'NOT SET (auto-detect)',
    },
    session: session
      ? {
          hasSession: true,
          userId: (session.user as any)?.id || null,
          email: session.user?.email || null,
          name: session.user?.name || null,
          role: (session.user as any)?.role || null,
        }
      : { hasSession: false },
    jwt: jwtError
      ? { error: jwtError }
      : jwtToken
        ? {
            hasToken: true,
            userId: jwtToken.userId || null,
            email: jwtToken.email || null,
            name: jwtToken.name || null,
            role: jwtToken.role || null,
          }
        : { hasToken: false },
  });
}
