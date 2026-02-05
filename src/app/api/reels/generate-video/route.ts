/**
 * API Route: Generate AI Video from Text
 * POST /api/reels/generate-video
 * Initiates RunwayML video generation and creates a reel record
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { simulateTextToVideo, generateTextToVideo } from '@/lib/runway-api';

const USE_SIMULATION = process.env.NEXT_PUBLIC_USE_APP_SIMULATION === 'true';

// Helper function to validate UUID format
function isValidUUID(uuid: string | undefined | null): boolean {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { prompt, teacherId, classId, subject, gradeLevel } = body;

        // Validate required fields
        if (!prompt || !teacherId) {
            return NextResponse.json(
                { error: 'Missing required fields: prompt and teacherId' },
                { status: 400 }
            );
        }

        // Validate prompt length
        if (prompt.length < 10) {
            return NextResponse.json(
                { error: 'Prompt must be at least 10 characters long' },
                { status: 400 }
            );
        }

        if (prompt.length > 1000) {
            return NextResponse.json(
                { error: 'Prompt must be less than 1000 characters' },
                { status: 400 }
            );
        }

        // Generate title from prompt (first 50 chars)
        const titleEn = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
        const titleAr = `فيديو تعليمي: ${titleEn}`;

        // Initiate video generation
        let runwayTask;
        try {
            if (USE_SIMULATION) {
                console.log('Using simulation for video generation');
                runwayTask = await simulateTextToVideo({
                    prompt_text: prompt,
                    duration: 5,
                    ratio: '9:16',
                });
            } else {
                console.log('Using real RunwayML API for video generation');
                // Use default model and settings for now
                runwayTask = await generateTextToVideo({
                    prompt_text: prompt,
                    duration: 5,
                    ratio: '9:16',
                    model: 'gen3a_turbo',
                });
            }
        } catch (error: any) {
            console.error('RunwayML API error:', error);
            return NextResponse.json(
                { error: 'Failed to initiate video generation', details: error.message },
                { status: 500 }
            );
        }

        // Create reel record with 'processing' status
        // Validate UUID fields to prevent database errors
        const validatedClassId = isValidUUID(classId) ? classId : null;

        const reelData = {
            title_en: titleEn,
            title_ar: titleAr,
            description_en: prompt,
            description_ar: prompt,
            video_url: 'pending', // Will be updated when generation completes
            thumbnail_url: null,
            duration_seconds: 5,
            status: 'processing',
            teacher_id: teacherId,
            lesson_id: validatedClassId, // Use validated UUID or null
            class_id: validatedClassId,  // Use validated UUID or null
            subject: subject || null,
            grade_level: gradeLevel || null,
            generation_request_id: runwayTask.id,
            is_published: false,
            view_count: 0,
        };

        const { data: reel, error: insertError } = await supabaseAdmin
            .from('reels')
            .insert(reelData as any)
            .select()
            .single();

        if (insertError) {
            console.error('Error creating reel:', insertError);
            return NextResponse.json(
                { error: 'Failed to create reel record', details: insertError.message },
                { status: 500 }
            );
        }

        // Log generation request
        await supabaseAdmin.from('generation_logs').insert({
            reel_id: reel.id,
            teacher_id: teacherId,
            lesson_id: classId || null,
            action: 'generation_requested',
            status: 'pending',
            metadata: {
                prompt,
                runway_task_id: runwayTask.id,
                simulation: USE_SIMULATION,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                reelId: reel.id,
                taskId: runwayTask.id,
                status: 'processing',
                message: 'Video generation started. This may take 1-2 minutes.',
            },
        });
    } catch (error: any) {
        console.error('Error in POST /api/reels/generate-video:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
