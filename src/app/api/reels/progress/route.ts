/**
 * Reel Progress API Route
 * Handles tracking student progress on reels (watch time, save/bookmark)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ReelProgressInsert = Database['public']['Tables']['reel_progress']['Insert'];
type ReelProgressUpdate = Database['public']['Tables']['reel_progress']['Update'];

/**
 * GET /api/reels/progress
 * Get progress for a student on a specific reel or all reels
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
        const reelId = searchParams.get('reel_id');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Build query
        let query = supabaseAdmin
            .from('reel_progress')
            .select('*')
            .eq('student_id', studentId);

        // Filter by specific reel if provided
        if (reelId) {
            query = query.eq('reel_id', reelId);
        }

        // Execute query
        const { data: progress, error } = await query;

        if (error) {
            console.error('Error fetching reel progress:', error);
            return NextResponse.json(
                { error: 'Failed to fetch progress', details: error.message },
                { status: 500 }
            );
        }

        // Return single record or array
        if (reelId) {
            return NextResponse.json({
                data: progress?.[0] || null,
            });
        }

        return NextResponse.json({
            data: progress || [],
        });
    } catch (error: any) {
        console.error('Error in GET /api/reels/progress:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reels/progress
 * Create or update progress for a student on a reel
 * Handles: watch time tracking, save/bookmark toggle
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
        const requiredFields = ['student_id', 'reel_id'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: 'Missing required fields', fields: missingFields },
                { status: 400 }
            );
        }

        const { student_id, reel_id, watched_seconds, is_saved, is_completed } = body;

        // Check if progress record exists
        const { data: existingProgress, error: fetchError } = await (supabaseAdmin
            .from('reel_progress')
            .select('*')
            .eq('student_id', student_id)
            .eq('reel_id', reel_id)
            .single() as any);

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing progress:', fetchError);
            return NextResponse.json(
                { error: 'Failed to check progress', details: fetchError.message },
                { status: 500 }
            );
        }

        if (existingProgress) {
            // Update existing progress
            const updateData: ReelProgressUpdate = {};

            if (watched_seconds !== undefined) {
                updateData.watched_seconds = watched_seconds;
            }

            if (is_saved !== undefined) {
                updateData.is_saved = is_saved;
            }

            if (is_completed !== undefined) {
                updateData.is_completed = is_completed;
                updateData.last_watched_at = new Date().toISOString();
            }

            // Update progress
            const { data: progress, error: updateError } = await (supabaseAdmin
                .from('reel_progress')
                // @ts-expect-error - Supabase update type inference issue
                .update(updateData as any)
                .eq('student_id', student_id)
                .eq('reel_id', reel_id)
                .select()
                .single() as any);

            if (updateError) {
                console.error('Error updating progress:', updateError);
                return NextResponse.json(
                    { error: 'Failed to update progress', details: updateError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ data: progress });
        } else {
            // Create new progress record
            const progressData: ReelProgressInsert = {
                student_id,
                reel_id,
                watched_seconds: watched_seconds || 0,
                is_saved: is_saved || false,
                is_completed: is_completed || false,
                last_watched_at: new Date().toISOString(),
            };

            // Insert progress
            const { data: progress, error: insertError } = await (supabaseAdmin
                .from('reel_progress')
                .insert(progressData as any)
                .select()
                .single() as any);

            if (insertError) {
                console.error('Error creating progress:', insertError);
                return NextResponse.json(
                    { error: 'Failed to create progress', details: insertError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ data: progress }, { status: 201 });
        }
    } catch (error: any) {
        console.error('Error in POST /api/reels/progress:', error);

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
