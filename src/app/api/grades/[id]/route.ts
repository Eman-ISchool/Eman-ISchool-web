import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/grades/[id]
 * 
 * Get grade details by ID.
 */
export const GET = withAuth(async (req, { requestId }, { params }) => {
  const { id } = params;

  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .select('*, supervisor:users!grades_supervisor_id_fkey(id, name, email, image)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Grade not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }
    console.error('Error fetching grade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade', code: 'FETCH_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ grade, requestId }, { status: 200 });
});

/**
 * PATCH /api/grades/[id]
 * 
 * Update grade details.
 * Admin can update any grade.
 * Supervisor can update grades they are assigned to.
 */
export const PATCH = withAuth(async (req, { user, requestId }, { params }) => {
  const { id } = params;
  const body = await req.json();

  // Check if grade exists
  const { data: existingGrade, error: fetchError } = await supabaseAdmin
    .from('grades')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Grade not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch grade', code: 'FETCH_ERROR', requestId },
      { status: 500 }
    );
  }

  // Role check: Only Admins can edit ANY grade. Supervisors can edit their assigned grades.
  if (user.role !== 'admin') {
    if (user.role !== 'supervisor' || existingGrade.supervisor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
        { status: 403 }
      );
    }
  }

  // Build update object
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.name_en !== undefined) updateData.name_en = body.name_en;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.supervisor_id !== undefined) updateData.supervisor_id = body.supervisor_id;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;

  // Update grade
  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating grade:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Grade with this slug already exists', code: 'CONFLICT', requestId },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update grade', code: 'UPDATE_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ grade, requestId }, { status: 200 });
});

/**
 * DELETE /api/grades/[id]
 * 
 * Delete a grade. Only admins can delete grades.
 */
export const DELETE = withAuth(async (req, { requestId }, { params }) => {
  const { id } = params;

  // Check if grade exists
  const { data: existingGrade, error: fetchError } = await supabaseAdmin
    .from('grades')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Grade not found', code: 'NOT_FOUND', requestId },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch grade', code: 'FETCH_ERROR', requestId },
      { status: 500 }
    );
  }

  // Delete grade
  const { error } = await supabaseAdmin
    .from('grades')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json(
      { error: 'Failed to delete grade', code: 'DELETE_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Grade deleted successfully', requestId }, { status: 200 });
}, { allowedRoles: ['admin'] });
