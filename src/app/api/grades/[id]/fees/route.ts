/**
 * Grade Fees API Endpoint
 * 
 * GET /api/grades/[id]/fees - List all fees for a grade
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/grades/[id]/fees
 * 
 * List all fees for a specific grade.
 * This returns invoice items and payments related to courses in this grade.
 * 
 * Query parameters:
 * - type: Filter by fee type (tuition, material, exam, etc.)
 * - status: Filter by payment status (paid, pending, overdue)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Get all courses for this grade
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, price, currency')
      .eq('grade_id', params.id);

    if (coursesError) {
      console.error('Error fetching courses for grade:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json({ fees: [] });
    }

    const courseIds = courses.map(c => c.id);

    // Get invoice items for these courses
    const { data: invoiceItems, error: invoiceError } = await supabase
      .from('invoice_items')
      .select(`
        *,
        invoice:invoice_id (
          invoice_number,
          status,
          total,
          currency,
          due_date,
          paid_at
        ),
        student:student_id (
          id,
          name,
          email
        )
      `)
      .in('course_id', courseIds);

    if (invoiceError) {
      console.error('Error fetching invoice items:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to fetch fees' },
        { status: 500 }
      );
    }

    // Get payments for these invoices
    const invoiceIds = invoiceItems?.map(item => item.invoice_id) || [];
    let payments: any[] = [];
    
    if (invoiceIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('invoice_id', invoiceIds);

      if (!paymentsError && paymentsData) {
        payments = paymentsData;
      }
    }

    // Combine invoice items with payment information
    const fees = (invoiceItems || []).map((item: any) => {
      const invoicePayments = payments.filter(p => p.invoice_id === item.invoice_id);
      const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        id: item.id,
        description: item.description,
        course_id: item.course_id,
        course_title: courses.find(c => c.id === item.course_id)?.title,
        student: item.student,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        discount_amount: item.discount_amount,
        total: item.total,
        invoice: item.invoice,
        payments: invoicePayments,
        total_paid: totalPaid,
        balance: item.invoice?.total - totalPaid,
        status: totalPaid >= item.invoice?.total ? 'paid' : 
               totalPaid > 0 ? 'partial' : 'pending',
      };
    });

    // Apply filters
    let filteredFees = fees;
    
    if (type) {
      filteredFees = filteredFees.filter(fee => 
        fee.description.toLowerCase().includes(type.toLowerCase())
      );
    }

    if (status) {
      filteredFees = filteredFees.filter(fee => fee.status === status);
    }

    // Calculate summary statistics
    const summary = {
      total_fees: filteredFees.reduce((sum, fee) => sum + fee.total, 0),
      total_paid: filteredFees.reduce((sum, fee) => sum + fee.total_paid, 0),
      total_balance: filteredFees.reduce((sum, fee) => sum + fee.balance, 0),
      paid_count: filteredFees.filter(f => f.status === 'paid').length,
      pending_count: filteredFees.filter(f => f.status === 'pending').length,
      partial_count: filteredFees.filter(f => f.status === 'partial').length,
    };

    return NextResponse.json({ fees: filteredFees, summary });
  } catch (error) {
    console.error('Error in GET /api/grades/[id]/fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
