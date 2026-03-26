/**
 * Admin Reels API Route
 * Handles listing all reels for administrators with filtering and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/reels
 * List all reels for administrators with filtering
 */
export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Get query parameters
        const status = searchParams.get('status');
        const teacherId = searchParams.get('teacher_id');
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('grade_level');
        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sort_by') || 'created_at';
        const sortOrder = searchParams.get('sort_order') || 'desc';

        // Build query
        let query = supabaseAdmin
            .from('reels')
            .select('*')
            .order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        if (subject) {
            query = query.eq('subject', subject);
        }

        if (gradeLevel) {
            query = query.eq('grade_level', gradeLevel);
        }

        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }

        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: reels, error, count } = await query;

        if (error) {
            console.error('Error fetching admin reels:', error);
            return NextResponse.json(
                { error: 'Failed to fetch reels', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: reels || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        console.error('Error in GET /api/admin/reels:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/reels/[reelId]
 * Delete a specific reel (admin only)
 */
export async function DELETE(
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

        if (!reelId) {
            return NextResponse.json(
                { error: 'Reel ID is required' },
                { status: 400 }
            );
        }

        // Delete reel
        const { error } = await supabaseAdmin
            .from('reels')
            .delete()
            .eq('id', reelId);

        if (error) {
            console.error('Error deleting reel:', error);
            return NextResponse.json(
                { error: 'Failed to delete reel', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in DELETE /api/admin/reels/[reelId]:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
