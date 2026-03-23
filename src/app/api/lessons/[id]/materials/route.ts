/**
 * Lesson Materials API Endpoint
 * 
 * GET /api/lessons/[id]/materials - List all materials for a lesson
 * POST /api/lessons/[id]/materials - Add a new material to a lesson
 * PATCH /api/lessons/[id]/materials - Update a material
 * DELETE /api/lessons/[id]/materials - Delete a material
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/lessons/[id]/materials
 * 
 * List all materials for a specific lesson.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: materials, error } = await supabase
      .from('materials')
      .select(`
        *,
        uploaded_by_user:users!materials_uploaded_by_fkey(id, name, email, image)
      `)
      .eq('lesson_id', params.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching materials:', error);
      return NextResponse.json(
        { error: 'Failed to fetch materials' },
        { status: 500 }
      );
    }

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error in GET /api/lessons/[id]/materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lessons/[id]/materials
 * 
 * Add a new material to a lesson.
 * 
 * Request body:
 * {
 *   title: string (required)
 *   type: 'file' | 'link' | 'book' | 'image' | 'video' (required)
 *   file_url: string (required if type='file')
 *   file_name: string (required if type='file')
 *   file_size: number (required if type='file')
 *   file_mime_type: string (required if type='file')
 *   external_url: string (required if type='link')
 *   course_id: string (optional, defaults to current lesson's course_id)
 *   lesson_id: string (optional, defaults to current lesson's id)
 *   sort_order: number (optional, defaults to 0)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type' },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (body.type === 'file' && !body.file_url) {
      return NextResponse.json(
        { error: 'file_url is required for type=file' },
        { status: 400 }
      );
    }

    if (body.type === 'file' && !body.file_name) {
      return NextResponse.json(
        { error: 'file_name is required for type=file' },
        { status: 400 }
      );
    }

    // Get lesson to verify it exists
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, course_id')
      .eq('id', params.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Create material
    const { data: material, error } = await supabase
      .from('materials')
      .insert({
        title: body.title,
        type: body.type,
        file_url: body.type === 'file' ? body.file_url : null,
        file_name: body.type === 'file' ? body.file_name : null,
        file_size: body.type === 'file' ? body.file_size : null,
        file_mime_type: body.type === 'file' ? body.file_mime_type : null,
        external_url: body.type === 'link' ? body.external_url : null,
        course_id: lesson.course_id || null,
        lesson_id: params.id,
        uploaded_by: '00000000-0000-0000-0000-0000', // TODO: Get actual user ID from session
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating material:', error);
      return NextResponse.json(
        { error: 'Failed to create material' },
        { status: 500 }
      );
    }

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/lessons/[id]/materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lessons/[id]/materials
 * 
 * Update a material.
 * 
 * Request body (all fields optional):
 * {
 *   title: string
 *   type: 'file' | 'link' | 'book' | 'image' | 'video'
 *   file_url: string (if type='file')
 *   file_name: string (if type='file')
 *   file_size: number (if type='file')
 *   file_mime_type: string (if type='file')
 *   external_url: string (if type='link')
 *   sort_order: number
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const materialId = body.id;

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Verify material exists
    const { data: existingMaterial, error: fetchError } = await supabase
      .from('materials')
      .select('id, lesson_id')
      .eq('id', materialId)
      .single();

    if (fetchError || !existingMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Map camelCase to snake_case
    const dbUpdates: any = {};
    if (body.title !== undefined) dbUpdates.title = body.title;
    if (body.type !== undefined) dbUpdates.type = body.type;
    if (body.file_url !== undefined) dbUpdates.file_url = body.file_url;
    if (body.file_name !== undefined) dbUpdates.file_name = body.file_name;
    if (body.file_size !== undefined) dbUpdates.file_size = body.file_size;
    if (body.file_mime_type !== undefined) dbUpdates.file_mime_type = body.file_mime_type;
    if (body.external_url !== undefined) dbUpdates.external_url = body.external_url;
    if (body.sort_order !== undefined) dbUpdates.sort_order = body.sort_order;

    const { data: material, error } = await supabase
      .from('materials')
      .update(dbUpdates)
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating material:', error);
      return NextResponse.json(
        { error: 'Failed to update material' },
        { status: 500 }
      );
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Error in PATCH /api/lessons/[id]/materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lessons/[id]/materials
 * 
 * Delete a material.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Verify material exists
    const { data: existingMaterial, error: fetchError } = await supabase
      .from('materials')
      .select('id, lesson_id')
      .eq('id', materialId)
      .single();

    if (fetchError || !existingMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Delete material
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting material:', error);
      return NextResponse.json(
        { error: 'Failed to delete material' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/lessons/[id]/materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
