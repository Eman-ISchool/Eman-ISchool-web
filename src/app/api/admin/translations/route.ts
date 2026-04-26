import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const currentUser = await getCurrentUser(session);
  if (!currentUser || !isAdmin(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('translations')
      .select('*', { count: 'exact' })
      .order('key', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`key.ilike.%${search}%,ar.ilike.%${search}%,en.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      // Table doesn't exist — return empty
      return NextResponse.json({ translations: [], total: 0, limit, offset });
    }

    return NextResponse.json({
      translations: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch translations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const currentUser = await getCurrentUser(session);
  if (!currentUser || !isAdmin(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { key, ar, en } = body;

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('translations')
      .insert({
        key,
        ar: ar || '',
        en: en || '',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create translation' }, { status: 500 });
  }
}
