/**
 * Reels Simulation API
 * Generates sample reels for testing without Nanobana service
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

        // Build sample reels to insert
        const sampleContent = [
            { subject: 'Mathematics', grade_level: 'Grade 8', title_en: 'Introduction to Algebra', title_ar: '\u0645\u0642\u062f\u0645\u0629 \u0641\u064a \u0627\u0644\u062c\u0628\u0631', description_en: 'Learn the basics of algebraic expressions and equations', description_ar: '\u062a\u0639\u0644\u0645 \u0623\u0633\u0627\u0633\u064a\u0627\u062a \u0627\u0644\u062a\u0639\u0628\u064a\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0627\u062a \u0627\u0644\u062c\u0628\u0631\u064a\u0629' },
            { subject: 'Science', grade_level: 'Grade 6', title_en: 'The Water Cycle', title_ar: '\u062f\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0621', description_en: 'Understanding how water moves through our environment', description_ar: '\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u062a\u062d\u0631\u0643 \u0627\u0644\u0645\u0627\u0621 \u0641\u064a \u0628\u064a\u0626\u062a\u0646\u0627' },
            { subject: 'English', grade_level: 'Grade 7', title_en: 'Present Perfect Tense', title_ar: '\u0632\u0645\u0646 \u0627\u0644\u0645\u0636\u0627\u0631\u0639 \u0627\u0644\u062a\u0627\u0645', description_en: 'Master the present perfect tense with examples', description_ar: '\u0625\u062a\u0642\u0627\u0646 \u0632\u0645\u0646 \u0627\u0644\u0645\u0636\u0627\u0631\u0639 \u0627\u0644\u062a\u0627\u0645 \u0645\u0639 \u0627\u0644\u0623\u0645\u062b\u0644\u0629' },
            { subject: 'Biology', grade_level: 'Grade 9', title_en: 'Photosynthesis Explained', title_ar: '\u0634\u0631\u062d \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062a\u0645\u062b\u064a\u0644 \u0627\u0644\u0636\u0648\u0626\u064a', description_en: 'How plants convert sunlight into energy', description_ar: '\u0643\u064a\u0641 \u062a\u062d\u0648\u0644 \u0627\u0644\u0646\u0628\u0627\u062a\u0627\u062a \u0636\u0648\u0621 \u0627\u0644\u0634\u0645\u0633 \u0625\u0644\u0649 \u0637\u0627\u0642\u0629' },
            { subject: 'Physics', grade_level: 'Grade 10', title_en: "Newton's Laws of Motion", title_ar: '\u0642\u0648\u0627\u0646\u064a\u0646 \u0646\u064a\u0648\u062a\u0646 \u0644\u0644\u062d\u0631\u0643\u0629', description_en: 'Understanding the three fundamental laws of motion', description_ar: '\u0641\u0647\u0645 \u0627\u0644\u0642\u0648\u0627\u0646\u064a\u0646 \u0627\u0644\u062b\u0644\u0627\u062b\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u062d\u0631\u0643\u0629' },
        ];
        const sampleVideos = [
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg', duration: 90 },
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg', duration: 75 },
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', duration: 60 },
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg', duration: 85 },
            { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg', duration: 70 },
        ];

        const reelsToInsert = [];
        for (let i = 0; i < Math.min(count, sampleContent.length); i++) {
            const content = sampleContent[i];
            const video = sampleVideos[i % sampleVideos.length];
            reelsToInsert.push({
                title_en: content.title_en,
                title_ar: content.title_ar,
                description_en: content.description_en,
                description_ar: content.description_ar,
                video_url: video.url,
                thumbnail_url: video.thumbnail,
                duration_seconds: video.duration,
                subject: content.subject,
                grade_level: content.grade_level,
                teacher_id: selectedTeacherId,
                status: 'approved',
                is_published: true,
            });
        }

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
 * Get all simulated reels from the database
 */
export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        const { data: reels, error } = await supabaseAdmin
            .from('reels')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reels:', error);
            return NextResponse.json(
                { error: 'Failed to fetch reels', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            count: reels?.length || 0,
            data: reels,
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
