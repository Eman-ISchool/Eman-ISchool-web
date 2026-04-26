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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('banks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('bank_name', `%${search}%`);

    const { data, count, error } = await query;

    if (error) {
      // Table doesn't exist — return empty
      return NextResponse.json({ banks: [], total: 0, limit, offset });
    }

    return NextResponse.json({
      banks: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch banks' }, { status: 500 });
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
    const { bank_name, account_number, account_type, balance, status } = body;

    if (!bank_name || !account_number) {
      return NextResponse.json({ error: 'bank_name and account_number are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('banks')
      .insert({
        bank_name,
        account_number,
        account_type: account_type || 'savings',
        balance: balance || 0,
        status: status || 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create bank' }, { status: 500 });
  }
}
