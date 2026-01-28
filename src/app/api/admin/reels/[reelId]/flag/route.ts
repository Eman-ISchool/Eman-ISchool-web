/**
 * Admin Flag Reel API Route
 * Allows administrators to flag inappropriate content
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAdminReelAction } from '@/lib/admin-audit-log';

/**
 * POST /api/admin/reels/[reelId]/flag
 * Flag a reel as inappropriate
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { reelId: string } }
) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const { reelId } = params;
        const body = await request.json();

        if (!reelId) {
            return NextResponse.json(
                { error: 'Reel ID is required' },
                { status: 400 }
            );
        }

        const { flagReason } = body;

        if (!flagReason || flagReason.trim().length === 0) {
            return NextResponse.json(
                { error: 'Flag reason is required' },
                { status: 400 }
            );
        }

        // Update reel to mark as flagged
        const admin = supabaseAdmin as any;
        const { data: reel, error } = await admin
            .from('reels')
            .update({
                status: 'rejected',
                rejection_reason: `Flagged by admin: ${flagReason}`,
            })
            .eq('id', reelId)
            .select()
            .single();

        if (error) {
            console.error('Error flagging reel:', error);
            return NextResponse.json(
                { error: 'Failed to flag reel', details: error.message },
                { status: 500 }
            );
        }

        // Log admin action
        await logAdminReelAction(reelId, 'flagged', 'admin', { reason: flagReason });

        return NextResponse.json({ data: reel });
    } catch (error: any) {
        console.error('Error in POST /api/admin/reels/[reelId]/flag:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
