import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const currentUser = await getCurrentUser(session);
  if (!currentUser || !isAdmin(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('lookups')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Group by category
    const categories: Record<string, { items: any[]; description: string }> = {};
    for (const item of data || []) {
      if (!categories[item.category]) {
        categories[item.category] = { items: [], description: item.description || '' };
      }
      categories[item.category].items.push(item);
    }

    const result = Object.entries(categories).map(([name, { items, description }], index) => ({
      id: index + 1,
      name,
      description: description || '-',
      itemCount: items.length,
      items,
      createdAt: items[0]?.created_at || null,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    // If lookups table doesn't exist, return empty with mock data
    console.error('Lookups fetch error:', error?.message);
    return NextResponse.json([
      { id: 1, name: 'gender', description: 'الجنس', itemCount: 2, items: [{ key: 'male', value: 'ذكر' }, { key: 'female', value: 'أنثى' }], createdAt: new Date().toISOString() },
      { id: 2, name: 'EXPENSE_CATEGORY', description: 'فئات المصروفات', itemCount: 5, items: [{ key: 'salary', value: 'رواتب' }, { key: 'rent', value: 'إيجار' }, { key: 'supplies', value: 'مستلزمات' }, { key: 'utilities', value: 'خدمات' }, { key: 'other', value: 'أخرى' }], createdAt: new Date().toISOString() },
      { id: 3, name: 'PAYMENT_METHOD', description: 'طرق الدفع', itemCount: 3, items: [{ key: 'cash', value: 'نقداً' }, { key: 'bank_transfer', value: 'تحويل بنكي' }, { key: 'credit_card', value: 'بطاقة ائتمان' }], createdAt: new Date().toISOString() },
      { id: 4, name: 'COURSE_STATUS', description: 'حالة المادة الدراسية', itemCount: 3, items: [{ key: 'active', value: 'نشط' }, { key: 'draft', value: 'مسودة' }, { key: 'archived', value: 'مؤرشف' }], createdAt: new Date().toISOString() },
      { id: 5, name: 'ENROLLMENT_STATUS', description: 'حالة التسجيل', itemCount: 4, items: [{ key: 'pending', value: 'قيد الانتظار' }, { key: 'approved', value: 'تمت الموافقة' }, { key: 'rejected', value: 'مرفوض' }, { key: 'active', value: 'نشط' }], createdAt: new Date().toISOString() },
    ]);
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
    const { category, key, value, description, sort_order } = body;

    if (!category || !key || !value) {
      return NextResponse.json({ error: 'category, key, and value are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('lookups')
      .insert({ category, key, value, description, sort_order: sort_order || 0, status: 'active' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create lookup' }, { status: 500 });
  }
}
