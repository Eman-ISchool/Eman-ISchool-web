/**
 * API Route: Check Video Generation Status
 * GET /api/reels/check-status/:reelId
 * Polls RunwayML API and updates reel when complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { simulateCheckTaskStatus } from '@/lib/runway-api';

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

        // Fetch reel record
        const { data: reel, error: fetchError } = await supabaseAdmin
            .from('reels')
            .select('*')
            .eq('id', reelId)
            .single();

        if (fetchError || !reel) {
            return NextResponse.json(
                { error: 'Reel not found' },
                { status: 404 }
            );
        }

        // If already completed, return current status
        if (reel.status === 'approved' || reel.status === 'failed') {
            return NextResponse.json({
                reelId: reel.id,
                status: reel.status,
                videoUrl: reel.video_url,
                completed: true,
            });
        }

        // Check RunwayML task status
        const taskId = reel.generation_request_id;
        if (!taskId) {
            return NextResponse.json(
                { error: 'No generation task ID found' },
                { status: 400 }
            );
        }

        let taskStatus;
        try {
            taskStatus = await simulateCheckTaskStatus(taskId, reel.created_at);
        } catch (error: any) {
            console.error('Error checking RunwayML status:', error);

            // Update reel to failed status
            await supabaseAdmin
                .from('reels')
                .update({ status: 'failed' })
                .eq('id', reelId);

            await supabaseAdmin.from('generation_logs').insert({
                reel_id: reelId,
                teacher_id: reel.teacher_id,
                action: 'generation_failed',
                status: 'failed',
                error_message: error.message,
            });

            return NextResponse.json({
                reelId: reel.id,
                status: 'failed',
                error: error.message,
                completed: true,
            });
        }

        // Update reel based on task status
        if (taskStatus.status === 'SUCCEEDED' && taskStatus.output && taskStatus.output[0]) {
            // Video generation completed successfully
            const videoUrl = taskStatus.output[0];

            await supabaseAdmin
                .from('reels')
                .update({
                    video_url: videoUrl,
                    status: 'approved', // Auto-approve for now
                    is_published: true, // Auto-publish for immediate student access
                })
                .eq('id', reelId);

            await supabaseAdmin.from('generation_logs').insert({
                reel_id: reelId,
                teacher_id: reel.teacher_id,
                action: 'generation_completed',
                status: 'success',
                metadata: {
                    video_url: videoUrl,
                    task_id: taskId,
                },
            });

            return NextResponse.json({
                reelId: reel.id,
                status: 'approved',
                videoUrl: videoUrl,
                completed: true,
                message: 'Video generation completed successfully!',
            });
        } else if (taskStatus.status === 'FAILED') {
            // Video generation failed
            await supabaseAdmin
                .from('reels')
                .update({ status: 'failed' })
                .eq('id', reelId);

            await supabaseAdmin.from('generation_logs').insert({
                reel_id: reelId,
                teacher_id: reel.teacher_id,
                action: 'generation_failed',
                status: 'failed',
                error_message: taskStatus.failure || 'Unknown error',
            });

            return NextResponse.json({
                reelId: reel.id,
                status: 'failed',
                error: taskStatus.failure || 'Video generation failed',
                completed: true,
            });
        } else {
            // Still processing
            return NextResponse.json({
                reelId: reel.id,
                status: 'processing',
                progress: taskStatus.progress || 0,
                completed: false,
                message: 'Video is being generated...',
            });
        }
    } catch (error: any) {
        console.error('Error in GET /api/reels/check-status:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
