import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { resolveGradeByRef } from '@/lib/grades';


function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

export const GET = withAuth(async (_req, { user, requestId }, { params }) => {
  const gradeRef = params.id;
  const gradeRefRecord = await resolveGradeByRef(gradeRef);

  if (!gradeRefRecord) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRefRecord.supervisor_id && gradeRefRecord.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .select('id, name, name_en, slug, sort_order, is_active, supervisor_id, description, image_url, created_at, supervisor:users!grades_supervisor_id_fkey(id, name, email)')
    .eq('id', gradeRefRecord.id)
    .single();

  if (error || !grade) {
    return jsonWithRequestId({ error: 'Failed to fetch grade', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId({ grade, requestId }, 200, requestId);
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });

export const PATCH = withAuth(async (req, { user, requestId }, { params }) => {
  const gradeRef = params.id;
  const body = await req.json();

  const gradeRefRecord = await resolveGradeByRef(gradeRef);
  if (!gradeRefRecord) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRefRecord.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const updateData: Record<string, any> = {};
  if (body.name !== undefined) {
    const normalizedName = String(body.name).trim();
    if (!normalizedName) {
      return jsonWithRequestId({ error: 'Grade name is required', code: 'VALIDATION_ERROR', requestId }, 400, requestId);
    }
    updateData.name = normalizedName;
  }
  if (body.name_en !== undefined) updateData.name_en = body.name_en;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;
  if (body.is_active !== undefined && user.role !== 'teacher') updateData.is_active = body.is_active;
  if (body.supervisor_id !== undefined) {
    if (user.role === 'teacher' && body.supervisor_id !== user.id) {
      return jsonWithRequestId({ error: 'Teachers can only assign themselves as supervisor', code: 'FORBIDDEN', requestId }, 403, requestId);
    }
    updateData.supervisor_id = body.supervisor_id;
  }

  if (Object.keys(updateData).length === 0) {
    return jsonWithRequestId({ error: 'No fields to update', code: 'VALIDATION_ERROR', requestId }, 400, requestId);
  }

  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .update(updateData)
    .eq('id', gradeRefRecord.id)
    .select('id, name, name_en, slug, sort_order, is_active, supervisor_id, description, image_url, created_at, supervisor:users!grades_supervisor_id_fkey(id, name, email)')
    .single();

  if (error || !grade) {
    const status = error?.code === '23505' ? 409 : 500;
    const code = error?.code === '23505' ? 'CONFLICT' : 'UPDATE_ERROR';
    const message = error?.code === '23505' ? 'Grade with this slug already exists' : 'Failed to update grade';
    return jsonWithRequestId({ error: message, code, requestId }, status, requestId);
  }

  return jsonWithRequestId({ grade, requestId }, 200, requestId);
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });

export const DELETE = withAuth(async (_req, { requestId }, { params }) => {
  const gradeRef = params.id;
  const gradeRefRecord = await resolveGradeByRef(gradeRef);
  if (!gradeRefRecord) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  const { error } = await supabaseAdmin.from('grades').delete().eq('id', gradeRefRecord.id);
  if (error) {
    return jsonWithRequestId({ error: 'Failed to delete grade', code: 'DELETE_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId({ success: true, requestId }, 200, requestId);
}, { allowedRoles: ['admin'] });
