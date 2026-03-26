/**
 * Reel by ID API Route
 * Handles GET, PATCH, and DELETE operations for a specific reel
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logApprovalNotification, logRejectionNotification } from '@/lib/reel-notifications';

/**
 * GET /api/reels/[reelId]
 * Get a specific reel by ID
 */
export async function GET(
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

        // Fetch reel
        const { data: reel, error } = await supabaseAdmin
            .from('reels')
            .select('*')
            .eq('id', reelId)
            .single();

        if (error) {
            console.error('Error fetching reel:', error);

            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Reel not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to fetch reel', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: reel });
    } catch (error: any) {
        console.error('Error in GET /api/reels/[reelId]:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/reels/[reelId]
 * Update a specific reel
 */
export async function PATCH(
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

        // Fetch current reel to check status
        const { data: currentReel, error: fetchError } = await (supabaseAdmin
            .from('reels')
            .select('status')
            .eq('id', reelId)
            .single() as any);

        if (fetchError) {
            console.error('Error fetching current reel:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch reel' },
                { status: 500 }
            );
        }

        if (!currentReel) {
            return NextResponse.json(
                { error: 'Reel not found' },
                { status: 404 }
            );
        }

        // Validate status if provided
        const validStatuses = ['queued', 'processing', 'pending_review', 'approved', 'rejected', 'failed'];
        if (body.status && !validStatuses.includes(body.status)) {
            return NextResponse.json(
                { error: 'Invalid status', validStatuses },
                { status: 400 }
            );
        }

        // Validate duration if provided
        if (body.duration_seconds !== undefined) {
            if (body.duration_seconds <= 0 || body.duration_seconds > 120) {
                return NextResponse.json(
                    { error: 'Invalid duration. Must be between 1 and 120 seconds' },
                    { status: 400 }
                );
            }
        }

        // Handle approve action
        if (body.action === 'approve') {
            if (currentReel.status !== 'pending_review') {
                return NextResponse.json(
                    { error: 'Can only approve reels in pending_review status' },
                    { status: 400 }
                );
            }

            const { data: approvedReel, error: approveError } = await (supabaseAdmin
                .from('reels')
                // @ts-expect-error - Supabase update type inference issue
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                } as any)
                .eq('id', reelId)
                .select()
                .single() as any);

            if (approveError) {
                console.error('Error approving reel:', approveError);
                return NextResponse.json(
                    { error: 'Failed to approve reel', details: approveError.message },
                    { status: 500 }
                );
            }

            // Trigger approval notification
            await logApprovalNotification(
                approvedReel?.teacher_id || '',
                reelId,
                approvedReel?.lesson_id || null,
                approvedReel?.lesson_material_id || ''
            );

            return NextResponse.json({ data: approvedReel });
        }

        // Handle reject action
        if (body.action === 'reject') {
            if (currentReel.status !== 'pending_review') {
                return NextResponse.json(
                    { error: 'Can only reject reels in pending_review status' },
                    { status: 400 }
                );
            }

            const rejectionReason = body.rejection_reason || null;

            const { data: rejectedReel, error: rejectError } = await (supabaseAdmin
                .from('reels')
                // @ts-expect-error - Supabase update type inference issue
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                } as any)
                .eq('id', reelId)
                .select()
                .single() as any);

            if (rejectError) {
                console.error('Error rejecting reel:', rejectError);
                return NextResponse.json(
                    { error: 'Failed to reject reel', details: rejectError.message },
                    { status: 500 }
                );
            }

            // Trigger rejection notification
            await logRejectionNotification(
                rejectedReel?.teacher_id || '',
                reelId,
                rejectedReel?.lesson_id || null,
                rejectedReel?.lesson_material_id || '',
                rejectionReason || 'No reason provided'
            );

            return NextResponse.json({ data: rejectedReel });
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {};

        const allowedFields = [
            'title_en', 'title_ar',
            'description_en', 'description_ar',
            'keywords_en', 'keywords_ar',
            'topics_en', 'topics_ar',
            'captions_en', 'captions_ar',
            'video_url', 'thumbnail_url',
            'duration_seconds', 'status',
            'subject', 'grade_level',
            'generation_request_id',
            'is_published', 'view_count',
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        // Update reel
        const { data: reel, error } = await (supabaseAdmin
            .from('reels')
            // @ts-expect-error - Supabase update type inference issue
            .update(updateData as any)
            .eq('id', reelId)
            .select()
            .single() as any);

        if (error) {
            console.error('Error updating reel:', error);

            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Reel not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to update reel', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: reel });
    } catch (error: any) {
        console.error('Error in PATCH /api/reels/[reelId]:', error);

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

/**
 * DELETE /api/reels/[reelId]
 * Delete a specific reel
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

            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Reel not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to delete reel', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in DELETE /api/reels/[reelId]:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
