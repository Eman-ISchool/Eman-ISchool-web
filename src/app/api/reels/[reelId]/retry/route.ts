/**
 * Reel Retry API Route
 * Handles retry requests for failed reels
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { submitGenerationRequest } from '@/lib/nano-banana';
import { logGenerationNotification, logFailureNotification } from '@/lib/reel-notifications';
import type { ReelUpdate } from '@/lib/supabase';

/**
 * POST /api/reels/[reelId]/retry
 * Retry a failed reel generation
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

        // Validate required fields
        if (!reelId) {
            return NextResponse.json(
                { error: 'Reel ID is required' },
                { status: 400 }
            );
        }

        // Fetch existing reel
        const { data: reel, error: fetchError } = await supabaseAdmin
            .from('reels')
            .select('*')
            .eq('id', reelId)
            .single();

        if (fetchError) {
            console.error('Error fetching reel:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch reel' },
                { status: 500 }
            );
        }

        if (!reel) {
            return NextResponse.json(
                { error: 'Reel not found' },
                { status: 404 }
            );
        }

        // Validate reel status - only failed reels can be retried
        if (reel.status !== 'failed') {
            return NextResponse.json(
                { error: 'Only failed reels can be retried' },
                { status: 400 }
            );
        }

        // Check for concurrent generation
        const { data: existingReels, error: checkError } = await supabaseAdmin
            .from('reels')
            .select('id, status')
            .eq('lesson_material_id', reel.lesson_material_id)
            .in('status', ['queued', 'processing'])
            .limit(1);

        if (checkError) {
            console.error('Error checking concurrent generations:', checkError);
            return NextResponse.json(
                { error: 'Failed to check for concurrent generations' },
                { status: 500 }
            );
        }

        if (existingReels && existingReels.length > 0) {
            return NextResponse.json(
                { error: 'A generation is already in progress for this material. Please wait for it to complete.' },
                { status: 409 }
            );
        }

        // Submit new generation request to nano-banana AI
        const generationResponse = await submitGenerationRequest({
            materialId: reel.lesson_material_id || '',
            lessonId: reel.lesson_id || null,
            content: '', // Will be populated from original material
            subject: reel.subject || undefined,
            gradeLevel: reel.grade_level || undefined,
            teacherGuidance: body.teacher_guidance || 'Retry failed generation',
            language: 'both',
        });

        if (!generationResponse.success) {
            // Log retry failure
            await supabaseAdmin.from('generation_logs').insert({
                reel_id: reel.id,
                teacher_id: reel.teacher_id,
                lesson_id: reel.lesson_id,
                lesson_material_id: reel.lesson_material_id,
                action: 'retry_failed',
                status: 'failed',
                error_message: generationResponse.error,
                metadata: {
                    error_code: generationResponse.errorCode,
                    retryable: generationResponse.retryable,
                },
            } as any);

            // Trigger failure notification
            await logFailureNotification(reel.teacher_id, reel.id, reel.lesson_id, reel.lesson_material_id, generationResponse.error || 'Unknown error', generationResponse.errorCode);

            return NextResponse.json(
                {
                    error: 'Failed to submit retry request',
                    details: generationResponse.error,
                    retryable: generationResponse.retryable,
                },
                { status: 500 }
            );
        }

        // Update reel status to queued
        // @ts-ignore - Supabase type inference issue
        const { error: updateError } = await supabaseAdmin
            .from('reels')
            .update({
                status: 'queued',
                generation_request_id: generationResponse.requestId,
            } as ReelUpdate)
            .eq('id', reelId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating reel for retry:', updateError);
            return NextResponse.json(
                { error: 'Failed to update reel for retry' },
                { status: 500 }
            );
        }

        // Log retry request
        await supabaseAdmin.from('generation_logs').insert({
            reel_id: reel.id,
            teacher_id: reel.teacher_id,
            lesson_id: reel.lesson_id,
            lesson_material_id: reel.lesson_material_id,
            action: 'retry_requested',
            status: 'success',
            metadata: {
                request_id: generationResponse.requestId,
                teacher_guidance: body.teacher_guidance || 'Retry failed generation',
            },
        } as any);

        // Trigger generation notification
        // @ts-ignore - TypeScript type inference issue
        await logGenerationNotification(reel.teacher_id, reel.id, reel.lesson_id, reel.lesson_material_id, 'success');

        return NextResponse.json({
            success: true,
            data: {
                // @ts-ignore - TypeScript type inference issue
                reelId: reel.id,
                requestId: generationResponse.requestId,
                status: 'queued',
                message: 'Retry request submitted successfully',
            },
        }, { status: 202 });
    } catch (error: any) {
        console.error('Error in POST /api/reels/[reelId]/retry:', error);

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
