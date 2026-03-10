import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { generateRequestId, withRequestId } from '@/lib/request-id';

export async function GET() {
    const requestId = generateRequestId();
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
