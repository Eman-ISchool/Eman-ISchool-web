/**
 * Reels Simulation API
 * Generates mock reels for testing without Nanobana service
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateMockReels, getAllMockReels } from '@/lib/mock-reels-generator';

/**
 * POST /api/reels/simulate
 * Generate and insert simulated reels into the database
 */
export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const count = body.count || 10;
        const teacherId = body.teacher_id;

        // Get a teacher to associate reels with
        let selectedTeacherId = teacherId;

        if (!selectedTeacherId) {
            const { data: teachers, error: teacherError } = await supabaseAdmin
                .from('users')
                .select('id, name')
                .eq('role', 'teacher')
                .limit(1);

            if (teacherError || !teachers || teachers.length === 0) {
                // Create a sample teacher if none exists
                const { data: newTeacher, error: createError } = await (supabaseAdmin
                    .from('users')
                    .insert({
                        email: 'teacher@eduverse.com',
                        name: 'Sample Teacher',
                        role: 'teacher',
                        google_id: `sample-teacher-${Date.now()}`
                    })
                    .select()
                    .single() as any);

                if (createError) {
                    return NextResponse.json(
                        { error: 'Failed to create sample teacher', details: createError.message },
                        { status: 500 }
                    );
                }

                selectedTeacherId = (newTeacher as any).id;
            } else {
                selectedTeacherId = teachers[0].id;
            }
        }

        // Generate mock reels
        const mockReels = generateMockReels(count);

        // Transform to database format
        const reelsToInsert = mockReels.map(reel => ({
            title_en: reel.title_en,
            title_ar: reel.title_ar,
            description_en: reel.description_en,
            description_ar: reel.description_ar,
            video_url: reel.video_url,
            thumbnail_url: reel.thumbnail_url,
            duration_seconds: reel.duration_seconds,
            subject: reel.subject,
            grade_level: reel.grade_level,
            teacher_id: selectedTeacherId,
            status: 'approved',
            is_published: true,
        }));

        // Insert into database
        const { data: insertedReels, error: insertError } = await (supabaseAdmin
            .from('reels')
            .insert(reelsToInsert)
            .select() as any);

        if (insertError) {
            console.error('Error inserting simulated reels:', insertError);
            return NextResponse.json(
                { error: 'Failed to insert simulated reels', details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully created ${insertedReels?.length || 0} simulated reels`,
            data: insertedReels,
        });
    } catch (error: any) {
        console.error('Error in POST /api/reels/simulate:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/reels/simulate
 * Get available mock reel templates
 */
export async function GET(request: NextRequest) {
    try {
        const mockReels = getAllMockReels();

        return NextResponse.json({
            success: true,
            count: mockReels.length,
            data: mockReels,
        });
    } catch (error: any) {
        console.error('Error in GET /api/reels/simulate:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/reels/simulate
 * Clear all simulated reels (for testing)
 */
export async function DELETE(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        // Delete all reels (be careful with this in production!)
        const { error: deleteError } = await supabaseAdmin
            .from('reels')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
            console.error('Error deleting simulated reels:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete simulated reels', details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'All reels deleted successfully',
        });
    } catch (error: any) {
        console.error('Error in DELETE /api/reels/simulate:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
