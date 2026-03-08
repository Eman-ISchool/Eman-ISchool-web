import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Vercel Cron signature verification (optional but recommended for production)
// import { verifySignature } from '@upstash/qstash/nextjs'; // or vercel equivalent

/**
 * GET /api/cron/auto-end-lessons
 * 
 * Background job to automatically transition 'live' or 'scheduled' lessons
 * that have exceeded their end_date_time + a grace period (e.g., 2 hours).
 * 
 * Recommended execution: Hourly via Vercel Cron.
 */
export async function GET(req: Request) {
    // Simple cron secret check to prevent unauthorized execution
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Grace period: Lesson end time + 2 hours
        const gracefulThreshold = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const { data: updatedLessons, error } = await supabaseAdmin
            .from('lessons')
            .update({ status: 'completed' })
            .in('status', ['scheduled', 'live'])
            .lt('end_date_time', gracefulThreshold)
            .select('id, title, end_date_time');

        if (error) {
            console.error('Failed to auto-end lessons:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully auto-ended ${updatedLessons?.length || 0} lessons`,
            autoEndedLessons: updatedLessons
        });
    } catch (err: any) {
        console.error('Cron job error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
