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
    const method = searchParams.get('method');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Try payments table first, fall back to invoices
    let query = supabaseAdmin
      .from('payments')
      .select('*, user:users(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (method && method !== 'all') {
      query = query.eq('payment_method', method);
    }

    const { data, count, error } = await query;

    if (error) {
      // Fall back to invoices table if payments doesn't exist
      if (error.message?.includes('relation') || error.code === '42P01') {
        let invoiceQuery = supabaseAdmin
          .from('invoices')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
          invoiceQuery = invoiceQuery.eq('status', status);
        }

        const { data: invoices, count: invoiceCount, error: invoiceError } = await invoiceQuery;
        if (invoiceError) throw invoiceError;

        return NextResponse.json({
          payments: (invoices || []).map((inv: any) => ({
            id: inv.id,
            user_name: inv.parent_name || 'N/A',
            user_email: '',
            amount: inv.total_amount || inv.amount || 0,
            currency: inv.currency || 'AED',
            payment_method: inv.payment_method || 'bank_transfer',
            status: inv.status || 'pending',
            transaction_id: inv.invoice_number || inv.id,
            created_at: inv.created_at,
          })),
          total: invoiceCount || 0,
          limit,
          offset,
        });
      }
      throw error;
    }

    const payments = (data || []).map((p: any) => ({
      id: p.id,
      user_name: p.user?.name || p.user_name || 'N/A',
      user_email: p.user?.email || '',
      amount: p.amount || 0,
      currency: p.currency || 'AED',
      payment_method: p.payment_method || p.method || 'bank_transfer',
      status: p.status || 'pending',
      transaction_id: p.transaction_id || p.reference || p.id,
      created_at: p.created_at,
    }));

    return NextResponse.json({ payments, total: count || 0, limit, offset });
  } catch (error: any) {
    console.error('Admin payments fetch error:', error?.message);
    return NextResponse.json({ error: error?.message || 'Failed to fetch payments' }, { status: 500 });
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
    const { user_email, amount, currency, method, status, transaction_id } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Find user by email if provided
    let userId = null;
    if (user_email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user_email)
        .maybeSingle();
      userId = user?.id || null;
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        currency: currency || 'AED',
        payment_method: method || 'bank_transfer',
        status: status || 'pending',
        transaction_id: transaction_id || `TXN-${Date.now()}`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If payments table doesn't exist, try invoices
      if (error.message?.includes('relation') || error.code === '42P01') {
        return NextResponse.json({ error: 'Payments table not available' }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json({ payment: data });
  } catch (error: any) {
    console.error('Admin payment create error:', error?.message);
    return NextResponse.json({ error: error?.message || 'Failed to create payment' }, { status: 500 });
  }
}
