import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { generateRequestId, withRequestId } from '@/lib/request-id';
import { google } from 'googleapis';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const requestId = generateRequestId();

    // Token diagnostic mode
    if (searchParams.get('diag') === 'token') {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        const result: any = {
            envPresent: {
                clientId: clientId ? `YES (${clientId.substring(0, 15)}...)` : 'NO',
                clientSecret: clientSecret ? 'YES' : 'NO',
                refreshToken: refreshToken ? `YES (${refreshToken.length} chars, starts: ${refreshToken.substring(0, 10)}...)` : 'NO',
            },
        };

        if (clientId && clientSecret && refreshToken) {
            try {
                const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
                oauth2Client.setCredentials({ refresh_token: refreshToken });
                const startMs = Date.now();
                const { credentials } = await oauth2Client.refreshAccessToken();
                result.refreshElapsedMs = Date.now() - startMs;
                result.accessToken = credentials.access_token ? `YES (${credentials.access_token.length} chars)` : 'NO';
                result.expiresIn = credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) + 's' : 'unknown';
                result.tokenType = credentials.token_type;
                result.success = true;
            } catch (err: any) {
                result.success = false;
                result.error = err.message;
                result.responseData = err.response?.data ? JSON.stringify(err.response.data) : undefined;
            }
        }

        return NextResponse.json(result);
    }

    let db = 'down';
    let auth = 'down';

    if (isSupabaseAdminConfigured && supabaseAdmin) {
        const { error } = await supabaseAdmin.from('users').select('id').limit(1);
        db = error ? 'down' : 'up';
    }

    if (process.env.NEXTAUTH_SECRET) {
        const session = await getServerSession(authOptions);
        auth = session?.user ? 'up' : 'configured';
    }

    const status = db === 'up' && (auth === 'up' || auth === 'configured') ? 'ok' : 'degraded';
    const response = NextResponse.json({
        status,
        db,
        auth,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        requestId,
    });

    return withRequestId(response, requestId);
}
