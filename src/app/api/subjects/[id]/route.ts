import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch a single subject by ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const requestId = generateRequestId();

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                { status: 401 }
            );
        }
        const user = await getCurrentUser(session);

        // Fetch subject
        const { data: subject, error } = await supabaseAdmin
            .from('subjects')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !subject) {
            return NextResponse.json(
                { error: 'Subject not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        // Verify ownership: user must be subject's teacher or admin
        const isOwner = subject.teacher_id === user.id;
        if (!isOwner && !isAdmin(user.role)) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        // Fetch courses for this subject
        const { data: courses } = await supabaseAdmin
            .from('courses')
            .select('id, title, is_published')
            .eq('subject_id', params.id)
            .order('created_at', { ascending: false });

        const subjectWithCourses = {
            ...subject,
            courses: courses || [],
        };

        return NextResponse.json({ subject: subjectWithCourses, requestId });
    } catch (error) {
        console.error('Error fetching subject:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}

// PATCH - Update a subject
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const requestId = generateRequestId();

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                { status: 401 }
            );
        }
        const user = await getCurrentUser(session);

        // Fetch subject to verify ownership
        const { data: subject, error: fetchError } = await supabaseAdmin
            .from('subjects')
            .select('teacher_id')
            .eq('id', params.id)
            .single();

        if (fetchError || !subject) {
            return NextResponse.json(
                { error: 'Subject not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        // Verify ownership: user must be subject's teacher or admin
        const isOwner = subject.teacher_id === user.id;
        if (!isOwner && !isAdmin(user.role)) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { title, description, image_url, is_active } = body;

        // Validate that at least one valid field is provided
        const validFields = [title, description, image_url, is_active].some(
            field => field !== undefined
        );

        if (!validFields) {
            return NextResponse.json(
                { error: 'No valid fields provided', code: 'VALIDATION_ERROR', requestId },
                { status: 400 }
            );
        }

        // Build update object with only provided fields
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (image_url !== undefined) updates.image_url = image_url;
        if (is_active !== undefined) updates.is_active = is_active;

        // Update subject
        const { data: updatedSubject, error: updateError } = await supabaseAdmin
            .from('subjects')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating subject:', updateError);
            return NextResponse.json(
                { error: 'Failed to update subject', code: 'SUBJECT_UPDATE_ERROR', requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ subject: updatedSubject, requestId });
    } catch (error) {
        console.error('Error updating subject:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const requestId = generateRequestId();

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                { status: 401 }
            );
        }
        const user = await getCurrentUser(session);

        // Verify subject ownership
        const { data: subject } = await supabaseAdmin
            .from('subjects')
            .select('teacher_id')
            .eq('id', params.id)
            .single();

        if (!subject) {
            return NextResponse.json(
                { error: 'Subject not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        const isOwner = subject.teacher_id === user.id;

        if (user.role !== 'admin' && !isOwner) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from('subjects')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ message: 'Subject deleted', requestId });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}
