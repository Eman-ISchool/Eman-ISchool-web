export function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (!url) {
    throw new Error(
      'NEXTAUTH_URL or NEXT_PUBLIC_APP_URL is required. ' +
        'Set one of these environment variables in your deployment environment.'
    );
  }

  return url.replace(/\/$/, '');
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGoogleOAuthRedirectUri(): string {
  const appUrl = getAppUrl();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for Google OAuth.'
    );
  }

  return `${appUrl}/api/auth/callback/google`;
}
