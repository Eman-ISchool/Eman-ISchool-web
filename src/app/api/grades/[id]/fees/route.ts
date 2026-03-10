import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { resolveGradeByRef } from '@/lib/grades';
import { getMockDb, saveMockDb } from '@/lib/mockDb';

function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

async function gradeCourseIds(gradeId: string, user: { id: string; role: string }) {
  let query = supabaseAdmin.from('courses').select('id').eq('grade_id', gradeId);
  if (user.role === 'teacher') {
    query = query.eq('teacher_id', user.id);
  }
  const { data } = await query;
  return (data || []).map((course: any) => course.id);
}

export const GET = withAuth(async (_req, { user, requestId }, { params }) => {
  const gradeRef = await resolveGradeByRef(params.id);
  if (!gradeRef) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRef.supervisor_id && gradeRef.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const feeItems = (Array.isArray(db.grade_fee_items) ? db.grade_fee_items : [])
      .filter((item: any) => item.grade_id === gradeRef.id)
      .map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        amount: Number(item.amount || 0),
        due_date: item.due_date,
        status: item.status || 'unpaid',
        student_name: item.student_name || null,
      }));

    const expected_total = feeItems.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const collected_total = feeItems
      .filter((item: any) => item.status === 'paid')
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const outstanding_total = Math.max(0, expected_total - collected_total);

    return jsonWithRequestId({
      feeItems,
      summary: { expected_total, collected_total, outstanding_total },
      requestId,
    }, 200, requestId);
  }

  const [courseIds, feeItemsResult] = await Promise.all([
    gradeCourseIds(gradeRef.id, user),
    supabaseAdmin
      .from('grade_fee_items')
      .select('id, item_name, amount, due_date, grade_id, created_at')
      .eq('grade_id', gradeRef.id)
      .order('due_date', { ascending: true }),
  ]);

  if (feeItemsResult.error && feeItemsResult.error.code !== 'PGRST205') {
    return jsonWithRequestId({ error: 'Failed to fetch fees', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const { data: invoiceItems } = courseIds.length
    ? await supabaseAdmin
        .from('invoice_items')
        .select(`
          id,
          description,
          total,
          invoice_id,
          created_at,
          student:student_id(id, name, email),
          invoice:invoice_id(id, due_date, status)
        `)
        .in('course_id', courseIds)
    : { data: [] as any[] };

  const invoiceIds = [...new Set((invoiceItems || []).map((item: any) => item.invoice_id).filter(Boolean))];
  const { data: payments } = invoiceIds.length
    ? await supabaseAdmin.from('payments').select('invoice_id, amount, status').in('invoice_id', invoiceIds)
    : { data: [] as any[] };

  const paidByInvoice = new Map<string, number>();
  for (const payment of payments || []) {
    if (!payment.invoice_id) continue;
    if (payment.status !== 'paid' && payment.status !== 'succeeded') continue;
    paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) || 0) + Number(payment.amount || 0));
  }

  const invoiceRows = (invoiceItems || []).map((item: any) => {
    const paidAmount = Number(paidByInvoice.get(item.invoice_id) || 0);
    const total = Number(item.total || 0);
    const status: 'paid' | 'partial' | 'unpaid' =
      paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    return {
      id: item.id,
      item_name: item.description || 'Fee',
      amount: total,
      due_date: item.invoice?.due_date || item.created_at || new Date().toISOString(),
      status,
      student_name: item.student?.name || null,
    };
  });

  const configuredRows = (feeItemsResult.data || []).map((item: any) => ({
    id: item.id,
    item_name: item.item_name,
    amount: Number(item.amount || 0),
    due_date: item.due_date,
    status: 'unpaid' as const,
    student_name: null,
  }));

  const feeItems = [...configuredRows, ...invoiceRows].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const expected_total = feeItems.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const collected_total = Array.from(paidByInvoice.values()).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const outstanding_total = Math.max(0, expected_total - collected_total);

  return jsonWithRequestId(
    {
      feeItems,
      summary: {
        expected_total,
        collected_total,
        outstanding_total,
      },
      requestId,
    },
    200,
    requestId
  );
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });

export const POST = withAuth(async (req, { user, requestId }, { params }) => {
  const gradeRef = await resolveGradeByRef(params.id);
  if (!gradeRef) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRef.supervisor_id && gradeRef.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const body = await req.json();
  const itemName = String(body.item_name || '').trim();
  const amount = Number(body.amount);
  const dueDate = String(body.due_date || '').trim();

  if (!itemName) {
    return jsonWithRequestId({ error: 'Fee item name is required', code: 'VALIDATION_ERROR', requestId }, 400, requestId);
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonWithRequestId({ error: 'Amount must be greater than 0', code: 'VALIDATION_ERROR', requestId }, 400, requestId);
  }
  if (!dueDate) {
    return jsonWithRequestId({ error: 'Due date is required', code: 'VALIDATION_ERROR', requestId }, 400, requestId);
  }

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    if (!Array.isArray(db.grade_fee_items)) {
      db.grade_fee_items = [];
    }
    const feeItem = {
      id: `gfi-${Date.now()}`,
      grade_id: gradeRef.id,
      item_name: itemName,
      amount,
      due_date: dueDate,
      status: 'unpaid',
      created_by: user.id,
      created_at: new Date().toISOString(),
    };
    db.grade_fee_items.push(feeItem);
    saveMockDb(db);
    return jsonWithRequestId({ feeItem, requestId }, 201, requestId);
  }

  const { data: feeItem, error } = await supabaseAdmin
    .from('grade_fee_items')
    .insert({
      grade_id: gradeRef.id,
      item_name: itemName,
      amount,
      due_date: dueDate,
      created_by: user.id,
    })
    .select('id, grade_id, item_name, amount, due_date, created_at')
    .single();

  if (error) {
    const isMissingTable = error.code === '42P01' || error.code === 'PGRST205';
    if (isMissingTable) {
      return jsonWithRequestId(
        {
          error: 'Fee structure table is missing. Run migration 20260308_teacher_portal_e2e.sql',
          code: 'MIGRATION_REQUIRED',
          requestId,
        },
        500,
        requestId
      );
    }
    return jsonWithRequestId({ error: 'Failed to save fee item', code: 'SAVE_ERROR', requestId }, 500, requestId);
  }

  return jsonWithRequestId({ feeItem, requestId }, 201, requestId);
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });
