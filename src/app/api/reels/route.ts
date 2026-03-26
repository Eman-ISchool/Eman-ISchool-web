/**
 * Reels API Route
 * Handles GET (list) and POST (create) operations for reels
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ReelInsert = Database['public']['Tables']['reels']['Insert'];

/**
 * GET /api/reels
 * List reels with optional filtering
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
        const lessonId = searchParams.get('lesson_id');
        const classId = searchParams.get('class_id');
        const subject = searchParams.get('subject');
        const gradeLevel = searchParams.get('grade_level');
        const isPublished = searchParams.get('is_published');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sort_by') || 'created_at';
        const sortOrder = searchParams.get('sort_order') || 'desc';

        // Build query
        let query = supabaseAdmin
            .from('reels')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        if (lessonId) {
            query = query.eq('lesson_id', lessonId);
        }

        if (classId) {
            query = query.eq('class_id', classId);
        }

        if (subject) {
            query = query.eq('subject', subject);
        }

        if (gradeLevel) {
            query = query.eq('grade_level', gradeLevel);
        }

        if (isPublished !== null) {
            query = query.eq('is_published', isPublished === 'true');
        }

        // Apply sorting
        const validSortFields = ['created_at', 'updated_at', 'title_en', 'view_count', 'duration_seconds'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        query = query.order(sortField, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Execute query
        const { data: reels, error, count } = await query;

        if (error) {
            console.error('Error fetching reels:', error);
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
        console.error('Error in GET /api/reels:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reels
 * Create a new reel
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
        const requiredFields = ['title_en', 'title_ar', 'video_url', 'duration_seconds', 'teacher_id'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', fields: missingFields },
                { status: 400 }
            );
        }

        // Validate duration
        if (body.duration_seconds <= 0 || body.duration_seconds > 120) {
            return NextResponse.json(
                { error: 'Invalid duration. Must be between 1 and 120 seconds' },
                { status: 400 }
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

        // Prepare reel data
        const reelData: ReelInsert = {
            title_en: body.title_en,
            title_ar: body.title_ar,
            description_en: body.description_en || null,
            description_ar: body.description_ar || null,
            video_url: body.video_url,
            thumbnail_url: body.thumbnail_url || null,
            duration_seconds: body.duration_seconds,
            status: body.status || 'queued',
            teacher_id: body.teacher_id,
            lesson_id: body.lesson_id || null,
            lesson_material_id: body.lesson_material_id || null,
            subject: body.subject || null,
            grade_level: body.grade_level || null,
            generation_request_id: body.generation_request_id || null,
            is_published: body.is_published || false,
            view_count: body.view_count || 0,
        };

        // Insert reel
        const { data: reel, error } = await (supabaseAdmin
            .from('reels')
            .insert(reelData as any)
            .select()
            .single() as any);

        if (error) {
            console.error('Error creating reel:', error);
            return NextResponse.json(
                { error: 'Failed to create reel', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: reel }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/reels:', error);

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
