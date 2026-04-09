import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

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
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('salaries')
      .select('*, user:users(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (month) query = query.eq('month', month);
    if (search) query = query.ilike('user.name', `%${search}%`);

    const { data, count, error } = await query;

    if (error) {
      // Table doesn't exist — return empty
      return NextResponse.json({ salaries: [], total: 0, limit, offset });
    }

    return NextResponse.json({
      salaries: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch salaries' }, { status: 500 });
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
    const { user_id, base_salary, allowances, deductions, net_salary, month, status } = body;

    if (!user_id || !base_salary || !month) {
      return NextResponse.json({ error: 'user_id, base_salary, and month are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('salaries')
      .insert({
        user_id,
        base_salary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        net_salary: net_salary || (base_salary + (allowances || 0) - (deductions || 0)),
        month,
        status: status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create salary record' }, { status: 500 });
  }
}
