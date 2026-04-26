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

    // Try coupons table first
    let query = supabaseAdmin
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('code', `%${search}%`);

    const { data, count, error } = await query;

    if (error) {
      // Fall back to discounts table if coupons doesn't exist
      if (error.message?.includes('relation') || error.code === '42P01') {
        let discountsQuery = supabaseAdmin
          .from('discounts')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'all') discountsQuery = discountsQuery.eq('status', status);
        if (search) discountsQuery = discountsQuery.ilike('code', `%${search}%`);

        const { data: discounts, count: discountCount, error: discountError } = await discountsQuery;

        if (discountError) {
          // Neither table exists — return empty
          return NextResponse.json({ coupons: [], total: 0, limit, offset });
        }

        return NextResponse.json({
          coupons: discounts || [],
          total: discountCount || 0,
          limit,
          offset,
        });
      }
      // Other error — return empty
      return NextResponse.json({ coupons: [], total: 0, limit, offset });
    }

    return NextResponse.json({
      coupons: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch coupons' }, { status: 500 });
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
    const { code, discount_type, value, max_uses, status } = body;

    if (!code || !discount_type || value === undefined) {
      return NextResponse.json({ error: 'code, discount_type, and value are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code,
        discount_type,
        value,
        max_uses: max_uses || null,
        status: status || 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create coupon' }, { status: 500 });
  }
}
