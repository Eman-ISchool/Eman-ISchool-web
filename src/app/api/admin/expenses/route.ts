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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try expenses table, fallback gracefully
    let query = supabaseAdmin
      .from('expenses')
      .select('*, created_by_user:users!expenses_created_by_fkey(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);

    const { data, count, error } = await query;

    if (error) {
      // Table doesn't exist — return empty
      return NextResponse.json({ expenses: [], total: 0, limit, offset });
    }

    return NextResponse.json({
      expenses: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch expenses' }, { status: 500 });
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
    const { title, amount, category, description } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: 'title and amount are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        title,
        amount,
        category: category || 'general',
        description: description || '',
        status: 'pending',
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create expense' }, { status: 500 });
  }
}
