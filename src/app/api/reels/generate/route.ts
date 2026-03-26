/**
 * Reel Generation API Route
 * Handles AI reel generation requests from teachers
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { submitGenerationRequest } from '@/lib/nano-banana';
import { logGenerationNotification, logFailureNotification } from '@/lib/reel-notifications';

/**
 * POST /api/reels/generate
 * Submit a reel generation request
 */
export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['teacherId', 'content', 'materialId'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', fields: missingFields },
                { status: 400 }
            );
        }

        const { teacherId, content, materialId, lessonId, subject, gradeLevel, teacherGuidance } = body;

        // Validate content length
        if (content.trim().length < 100) {
            return NextResponse.json(
                { error: 'Content is too short. Minimum 100 characters required.' },
                { status: 400 }
            );
        }

        // Check for concurrent generation requests for the same material
        const { data: existingReels, error: checkError } = await supabaseAdmin
            .from('reels')
            .select('id, status')
            .eq('lesson_material_id', materialId)
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

        // Submit generation request to nano-banana AI
        const generationResponse = await submitGenerationRequest({
            materialId,
            lessonId: lessonId || null,
            content,
            subject: subject || undefined,
            gradeLevel: gradeLevel || undefined,
            teacherGuidance: teacherGuidance || undefined,
            language: 'both',
        });

        if (!generationResponse.success) {
            // Log generation failure
            await supabaseAdmin.from('generation_logs').insert({
                teacher_id: teacherId,
                lesson_id: lessonId || null,
                lesson_material_id: materialId,
                action: 'generation_requested',
                status: 'failed',
                error_message: generationResponse.error,
                metadata: {
                    error_code: generationResponse.errorCode,
                    retryable: generationResponse.retryable,
                },
            } as any);

            // Trigger failure notification
            await logFailureNotification(teacherId, null, lessonId, materialId, generationResponse.error || 'Unknown error', generationResponse.errorCode);

            return NextResponse.json(
                {
                    error: 'Failed to submit generation request',
                    details: generationResponse.error,
                    retryable: generationResponse.retryable,
                },
                { status: 500 }
            );
        }

        // Create reel record with queued status
        // @ts-ignore - Supabase type inference issue
        const { data: reel, error: insertError } = await supabaseAdmin
            .from('reels')
            .insert({
                title_en: 'AI Generated Reel',
                title_ar: 'ريل مولد بالذكاء الاصطناعي',
                description_en: 'AI-generated educational content',
                description_ar: 'محتوى تعليمي مولد بالذكاء الاصطناعي',
                video_url: '', // Will be updated when generation completes
                thumbnail_url: null,
                duration_seconds: 0, // Will be updated when generation completes
                status: 'queued',
                teacher_id: teacherId,
                lesson_id: lessonId || null,
                lesson_material_id: materialId,
                subject: subject || null,
                grade_level: gradeLevel || null,
                generation_request_id: generationResponse.requestId,
                is_published: false,
                view_count: 0,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating reel record:', insertError);
            return NextResponse.json(
                { error: 'Failed to create reel record' },
                { status: 500 }
            );
        }

        // Log generation request
        // @ts-ignore - Supabase type inference issue
        await supabaseAdmin.from('generation_logs').insert({
            reel_id: reel.id,
            teacher_id: teacherId,
            lesson_id: lessonId || null,
            lesson_material_id: materialId,
            action: 'generation_requested',
            status: 'success',
            metadata: {
                request_id: generationResponse.requestId,
                content_length: content.length,
            },
        });

        // Trigger generation notification
        // @ts-ignore - TypeScript type inference issue
        await logGenerationNotification(teacherId, reel.id, lessonId, materialId, 'success');

        return NextResponse.json({
            success: true,
            data: {
                // @ts-ignore - TypeScript type inference issue
                reelId: reel.id,
                requestId: generationResponse.requestId,
                status: 'queued',
                message: 'Reel generation request submitted successfully',
            },
        }, { status: 202 });
    } catch (error: any) {
        console.error('Error in POST /api/reels/generate:', error);

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
