/**
 * Student Reels API Route
 * Handles listing approved reels for students with relevance sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

/**
 * GET /api/reels/student
 * List approved reels for students with relevance sorting
 * Relevance: enrolled subjects first, then by recency
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
        const studentId = searchParams.get('student_id');
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('grade_level');
        const savedOnly = searchParams.get('saved_only') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build base query - only approved and published reels
        let query = supabaseAdmin
            .from('reels')
            .select('*', { count: 'exact' })
            .eq('status', 'approved')
            .eq('is_published', true);

        // Apply optional filters
        if (subject) {
            query = query.eq('subject', subject);
        }

        if (gradeLevel) {
            query = query.eq('grade_level', gradeLevel);
        }

        // Apply saved filter if requested
        if (savedOnly && studentId) {
            // Get saved reels from reel_progress table
            const { data: savedReels } = await (supabaseAdmin
                .from('reel_progress')
                .select('reel_id')
                .eq('student_id', studentId)
                .eq('is_saved', true) as any);

            // @ts-ignore - Supabase type inference issue
            const savedReelIds = (savedReels as any)?.map((r: any) => r.reel_id) || [];
            if (savedReelIds.length > 0) {
                query = query.in('id', savedReelIds);
            } else {
                // If no saved reels, return empty list
                return NextResponse.json({
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                    },
                });
            }
        }

        // Fetch all reels first (we'll sort them manually for relevance)
        const { data: reels, error } = await query;

        if (error) {
            console.error('Error fetching student reels:', error);
            return NextResponse.json(
                { error: 'Failed to fetch reels', details: error.message },
                { status: 500 }
            );
        }

        // Apply relevance sorting
        let sortedReels = reels || [];

        if (studentId) {
            // Get student's enrolled subjects
            const { data: enrollments } = await (supabaseAdmin
                .from('enrollments')
                .select('course_id')
                .eq('student_id', studentId) as any);

            // Get courses to extract subjects
            // @ts-ignore - Supabase type inference issue
            const courseIds = (enrollments as any)?.map((e: any) => e.course_id) || [];
            let enrolledSubjects: string[] = [];

            if (courseIds.length > 0) {
                const { data: courses } = await (supabaseAdmin
                    .from('courses')
                    .select('subject')
                    .in('id', courseIds) as any);

                // @ts-ignore - Supabase type inference issue
                enrolledSubjects = [...new Set((courses as any)?.map((c: any) => c.subject) || [])] as string[];
            }

            // Sort reels: enrolled subjects first, then by recency
            // @ts-ignore - Supabase type inference issue
            sortedReels = (reels as any).sort((a: any, b: any) => {
                const aIsEnrolled = enrolledSubjects.includes(a.subject || '');
                const bIsEnrolled = enrolledSubjects.includes(b.subject || '');

                // Prioritize enrolled subjects
                if (aIsEnrolled && !bIsEnrolled) return -1;
                if (!aIsEnrolled && bIsEnrolled) return 1;

                // Within same enrollment status, sort by recency
                const aDate = new Date(a.created_at).getTime();
                const bDate = new Date(b.created_at).getTime();
                return bDate - aDate;
            });
        } else {
            // No student ID, just sort by recency
            // @ts-ignore - Supabase type inference issue
            sortedReels = (reels as any).sort((a: any, b: any) => {
                const aDate = new Date(a.created_at).getTime();
                const bDate = new Date(b.created_at).getTime();
                return bDate - aDate;
            });
        }

        // Apply pagination after sorting
        const offset = (page - 1) * limit;
        const paginatedReels = sortedReels.slice(offset, offset + limit);

        return NextResponse.json({
            data: paginatedReels,
            pagination: {
                page,
                limit,
                total: sortedReels.length,
                totalPages: Math.ceil(sortedReels.length / limit),
            },
        });
    } catch (error: any) {
        console.error('Error in GET /api/reels/student:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
