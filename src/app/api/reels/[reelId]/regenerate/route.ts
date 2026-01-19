/**
 * Reel Regeneration API Route
 * Handles regeneration requests for existing reels
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { submitGenerationRequest } from '@/lib/nano-banana';
import { logRegenerationRequested } from '@/lib/generation-log';
import type { ReelInsert, ReelUpdate } from '@/lib/supabase';

/**
 * POST /api/reels/[reelId]/regenerate
 * Request regeneration of a reel
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

        // Validate reel status - only approved or rejected reels can be regenerated
        if (reel.status !== 'approved' && reel.status !== 'rejected') {
            return NextResponse.json(
                { error: 'Only approved or rejected reels can be regenerated' },
                { status: 400 }
            );
        }

        // Check for concurrent regeneration
        const { data: existingReels, error: checkError } = await supabaseAdmin
            .from('reels')
            .select('id, status')
            .eq('lesson_material_id', reel.lesson_material_id)
            .in('status', ['queued', 'processing'])
            .limit(1);

        if (checkError) {
            console.error('Error checking concurrent regeneration:', checkError);
            return NextResponse.json(
                { error: 'Failed to check for concurrent regeneration' },
                { status: 500 }
            );
        }

        if (existingReels && existingReels.length > 0) {
            return NextResponse.json(
                { error: 'A regeneration is already in progress for this material. Please wait for it to complete.' },
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
            teacherGuidance: body.teacher_guidance || 'Regenerate with improvements',
            language: 'both',
        });

        if (!generationResponse.success) {
            // Log regeneration failure
            await logRegenerationRequested(
                {
                    reelId: reel.id,
                    teacherId: reel.teacher_id,
                    lessonId: reel.lesson_id,
                    lessonMaterialId: reel.lesson_material_id,
                    reason: body.teacher_guidance || 'Regeneration requested',
                },
                supabaseAdmin
            );

            return NextResponse.json(
                {
                    error: 'Failed to submit regeneration request',
                    details: generationResponse.error,
                    retryable: generationResponse.retryable,
                },
                { status: 500 }
            );
        }

        // Update reel status to queued
        const { data: updatedReel, error: updateError } = await supabaseAdmin
            .from('reels')
            .update({
                status: 'queued',
                generation_request_id: generationResponse.requestId,
            } as ReelUpdate)
            .eq('id', reelId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating reel for regeneration:', updateError);
            return NextResponse.json(
                { error: 'Failed to update reel for regeneration' },
                { status: 500 }
            );
        }

        // Log regeneration request
        await logRegenerationRequested(
            {
                reelId: reel.id,
                teacherId: reel.teacher_id,
                lessonId: reel.lesson_id,
                lessonMaterialId: reel.lesson_material_id,
                reason: body.teacher_guidance || 'Regeneration requested',
            },
            supabaseAdmin
        );

        return NextResponse.json({
            success: true,
            data: {
                reelId: reel.id,
                requestId: generationResponse.requestId,
                status: 'queued',
                message: 'Regeneration request submitted successfully',
            },
        }, { status: 202 });
    } catch (error: any) {
        console.error('Error in POST /api/reels/[reelId]/regenerate:', error);

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
