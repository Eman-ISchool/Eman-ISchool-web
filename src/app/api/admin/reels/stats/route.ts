/**
 * Admin Reels Stats API Route
 * Provides statistics for reels monitoring dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/reels/stats
 * Get statistics for reels
 */
export async function GET(_request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        // Get total reels count
        const { count: totalCount, error: countError } = await supabaseAdmin
            .from('reels')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error counting reels:', countError);
            return NextResponse.json(
                { error: 'Failed to count reels', details: countError.message },
                { status: 500 }
            );
        }

        // Get reels by status
        const { data: statusCounts, error: statusError } = await supabaseAdmin
            .from('reels')
            .select('status');

        if (statusError) {
            console.error('Error fetching status counts:', statusError);
            return NextResponse.json(
                { error: 'Failed to fetch status counts', details: statusError.message },
                { status: 500 }
            );
        }

        // Count by status
        const stats = {
            total: totalCount || 0,
            queued: 0,
            processing: 0,
            pending_review: 0,
            approved: 0,
            rejected: 0,
            failed: 0,
        };

        (statusCounts || []).forEach((reel: any) => {
            const status = reel.status;
            if (status in stats) {
                stats[status as keyof typeof stats] = (stats[status as keyof typeof stats] || 0) + 1;
            }
        });

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentReels, error: recentError } = await supabaseAdmin
            .from('reels')
            .select('id, status, created_at')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentError) {
            console.error('Error fetching recent reels:', recentError);
            return NextResponse.json(
                { error: 'Failed to fetch recent reels', details: recentError.message },
                { status: 500 }
            );
        }

        // Calculate generation success rate
        const totalGenerated = (stats.queued + stats.processing + stats.pending_review + stats.approved + stats.rejected + stats.failed);
        const successRate = totalGenerated > 0 ? ((stats.approved / totalGenerated) * 100).toFixed(1) : '0';

        return NextResponse.json({
            data: {
                byStatus: stats,
                total: stats.total,
                successRate: parseFloat(successRate),
                recentActivity: recentReels || [],
            },
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/reels/stats:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
