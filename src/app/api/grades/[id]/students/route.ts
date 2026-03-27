import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { withRequestId } from '@/lib/request-id';
import { resolveGradeByRef } from '@/lib/grades';


function jsonWithRequestId(body: any, status: number, requestId: string) {
  return withRequestId(NextResponse.json(body, { status }), requestId);
}

function toCsvRow(values: Array<string | number>) {
  return values
    .map((value) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
    .join(',');
}

export const GET = withAuth(async (req, { user, requestId }, { params }) => {
  const gradeRef = await resolveGradeByRef(params.id);
  if (!gradeRef) {
    return jsonWithRequestId({ error: 'Grade not found', code: 'NOT_FOUND', requestId }, 404, requestId);
  }

  if (user.role === 'teacher' && gradeRef.supervisor_id && gradeRef.supervisor_id !== user.id) {
    return jsonWithRequestId({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, 403, requestId);
  }

  const { searchParams } = new URL(req.url);
  const exportFormat = searchParams.get('export');
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const statusFilter = searchParams.get('status') || '';
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);

  let coursesQuery = supabaseAdmin.from('courses').select('id').eq('grade_id', gradeRef.id);
  if (user.role === 'teacher') {
    coursesQuery = coursesQuery.eq('teacher_id', user.id);
  }
  const { data: courses, error: coursesError } = await coursesQuery;
  if (coursesError) {
    return jsonWithRequestId({ error: 'Failed to fetch students', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const courseIds = (courses || []).map((course: any) => course.id);
  if (courseIds.length === 0) {
    if (exportFormat === 'csv') {
      const csv = ['grade_name,student_name,email,status,fees_status'].join('\n');
      return withRequestId(
        new NextResponse(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="grade-${gradeRef.id}-students.csv"`,
          },
        }),
        requestId
      );
    }
    return jsonWithRequestId(
      {
        students: [],
        meta: { page: 1, limit, total: 0, totalPages: 1 },
        requestId,
      },
      200,
      requestId
    );
  }

  // Fetch enrollments and invoice items in parallel (independent queries)
  const [enrollmentsResult, invoiceItemsResult] = await Promise.all([
    supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        enrollment_date,
        student:users!enrollments_student_id_fkey(id, name, email)
      `)
      .in('course_id', courseIds),
    supabaseAdmin
      .from('invoice_items')
      .select('student_id, invoice_id, total, course_id')
      .in('course_id', courseIds),
  ]);

  const { data: enrollments, error: enrollmentsError } = enrollmentsResult;
  if (enrollmentsError) {
    return jsonWithRequestId({ error: 'Failed to fetch students', code: 'FETCH_ERROR', requestId }, 500, requestId);
  }

  const invoiceItems = invoiceItemsResult.data;

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

  const feeByStudent = new Map<string, { expected: number; paid: number }>();
  for (const item of invoiceItems || []) {
    if (!item.student_id) continue;
    const running = feeByStudent.get(item.student_id) || { expected: 0, paid: 0 };
    running.expected += Number(item.total || 0);
    running.paid += Number(paidByInvoice.get(item.invoice_id) || 0);
    feeByStudent.set(item.student_id, running);
  }

  const studentMap = new Map<string, { id: string; name: string; email: string; statuses: string[]; payment_status: 'paid' | 'partial' | 'unpaid' }>();
  for (const enrollment of enrollments || []) {
    const student = enrollment.student as any;
    if (!student?.id) continue;
    const fee = feeByStudent.get(student.id) || { expected: 0, paid: 0 };
    const payment_status: 'paid' | 'partial' | 'unpaid' =
      fee.expected === 0 ? 'unpaid' : fee.paid >= fee.expected ? 'paid' : fee.paid > 0 ? 'partial' : 'unpaid';

    const existing = studentMap.get(student.id);
    if (!existing) {
      studentMap.set(student.id, {
        id: student.id,
        name: student.name || 'Unknown Student',
        email: student.email || '',
        statuses: [enrollment.status || 'active'],
        payment_status,
      });
    } else {
      existing.statuses.push(enrollment.status || 'active');
      if (existing.payment_status === 'unpaid' && payment_status !== 'unpaid') {
        existing.payment_status = payment_status;
      }
      if (existing.payment_status === 'partial' && payment_status === 'paid') {
        existing.payment_status = 'paid';
      }
    }
  }

  let rows = Array.from(studentMap.values()).map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    enrollment_status: student.statuses.includes('active') ? 'active' : student.statuses[0] || 'active',
    payment_status: student.payment_status,
  }));

  if (statusFilter) {
    rows = rows.filter((row) => row.enrollment_status === statusFilter);
  }

  if (search) {
    rows = rows.filter(
      (row) => row.name.toLowerCase().includes(search) || row.email.toLowerCase().includes(search)
    );
  }

  if (exportFormat === 'csv') {
    const header = ['grade_name', 'student_name', 'email', 'status', 'fees_status'];
    const csvLines = [
      toCsvRow(header),
      ...rows.map((row) => toCsvRow([gradeRef.name, row.name, row.email, row.enrollment_status, row.payment_status])),
    ];
    const csv = csvLines.join('\n');
    return withRequestId(
      new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="grade-${gradeRef.id}-students.csv"`,
        },
      }),
      requestId
    );
  }

  const total = rows.length;
  const start = (page - 1) * limit;
  const paged = rows.slice(start, start + limit);
  return jsonWithRequestId(
    {
      students: paged,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      requestId,
    },
    200,
    requestId
  );
}, { allowedRoles: ['admin', 'supervisor', 'teacher'] });
