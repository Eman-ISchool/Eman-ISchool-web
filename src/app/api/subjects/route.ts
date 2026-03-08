import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch subjects with optional filters
export async function GET(req: Request) {
  const requestId = generateRequestId();

  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user ? await getCurrentUser(session) : null;

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    let query = supabaseAdmin
      .from('subjects')
      .select(
        `
          *,
          courses:courses(count)
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    } else if (currentUser?.role === 'teacher') {
      // Teachers default to their own subjects unless a teacherId filter is explicitly provided.
      query = query.eq('teacher_id', currentUser.id);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: subjects, error, count } = await query;

    if (error) {
      console.error('Error fetching subjects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subjects', code: 'SUBJECTS_FETCH_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ subjects: subjects || [], total: count || 0, requestId });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}

// POST - Create a subject
export async function POST(req: Request) {
  const requestId = generateRequestId();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
      { status: 401 }
    );
  }

  const currentUser = await getCurrentUser(session);

  if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'FORBIDDEN', requestId },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const title = (body?.title || '').trim();
    const description = body?.description || null;
    const imageUrl = body?.image_url || body?.imageUrl || null;
    const isActive = body?.is_active ?? true;
    const sortOrder = body?.sort_order ?? 0;

    if (!title) {
      return NextResponse.json(
        { error: 'Subject title is required', code: 'VALIDATION_ERROR', requestId },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug || 'subject'}-${Date.now()}`;

    const teacherId = isAdmin(currentUser.role) ? body?.teacher_id || currentUser.id : currentUser.id;

    const { data: subject, error } = await supabaseAdmin
      .from('subjects')
      .insert({
        title,
        slug,
        description,
        teacher_id: teacherId,
        image_url: imageUrl,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return NextResponse.json(
        { error: 'Failed to create subject', code: 'SUBJECT_CREATE_ERROR', requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({ subject, requestId }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
      { status: 500 }
    );
  }
}
