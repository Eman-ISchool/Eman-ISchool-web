import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { getMockDb, saveMockDb } from '@/lib/mockDb';

export const GET = withAuth(async (req, { user, requestId }) => {
  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get('is_active');

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    let grades = db.grades || [];
    return NextResponse.json({ grades, requestId }, { status: 200 });
  }

  let query = supabaseAdmin
    .from('grades')
    .select('*, supervisor:users!grades_supervisor_id_fkey(id, name, email, image), courses:courses(count)')
    .order('sort_order', { ascending: true });

  if (user.role === 'supervisor' && !isActive) {
    // Supervisors see grades they supervise by default
    query = query.eq('supervisor_id', user.id);
  } else if (user.role === 'teacher') {
    // Teachers only see their own classes (mapped to supervisor_id)
    query = query.eq('supervisor_id', user.id);
  } else if (isActive !== null) {
    query = query.eq('is_active', isActive === 'true');
  }

  const { data: grades, error } = await query;

  if (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades', code: 'FETCH_ERROR', requestId },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ grades, requestId }, { status: 200 });
  response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  return response;
});

/**
 * POST /api/grades
 * 
 * Create a new grade. Admins and Teachers can create grades.
 * 
 * Request body:
 * {
 *   name: string (required)
 *   name_en: string (optional)
 *   slug: string (required, must be unique)
 *   sort_order: number (optional, defaults to 0)
 *   is_active: boolean (optional, defaults to true)
 *   supervisor_id: string (optional)
 *   description: string (optional)
 *   image_url: string (optional)
 * }
 */
export const POST = withAuth(async (req, { user, requestId }) => {
  const body = await req.json();

  if (!body.name || !body.slug) {
    return NextResponse.json(
      { error: 'Missing required fields: name, slug', code: 'VALIDATION_ERROR', requestId },
      { status: 400 }
    );
  }

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    if (!db.grades) db.grades = [];
    const newGrade = {
      id: `grade-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      sort_order: body.sort_order || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      supervisor_id: user.id,
      description: body.description || null,
      image_url: body.image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      supervisor: {
        id: user.id,
        name: user.name || 'Test Teacher',
        email: user.email || 'teacher@eduverse.com',
      },
    };
    db.grades.push(newGrade);
    saveMockDb(db);
    return NextResponse.json({ grade: newGrade, requestId }, { status: 201 });
  }

  // Check for duplicate slug
  const { data: existingGrade } = await supabaseAdmin
    .from('grades')
    .select('id')
    .eq('slug', body.slug)
    .single();

  if (existingGrade) {
    return NextResponse.json(
      { error: 'Grade with this slug already exists', code: 'CONFLICT', requestId },
      { status: 409 }
    );
  }

  // Create the grade
  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .insert({
      name: body.name,
      name_en: body.name_en || null,
      slug: body.slug,
      sort_order: body.sort_order || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      supervisor_id: user.role === 'teacher' ? user.id : (body.supervisor_id || body.teacher_id || null),
      description: body.description || null,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Failed to create grade', code: 'CREATE_ERROR', requestId },
      { status: 500 }
    );
  }

  return NextResponse.json({ grade, requestId }, { status: 201 });
}, { allowedRoles: ['admin', 'teacher'] });
