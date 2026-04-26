import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
// PATCH - Approve or reject an enrollment
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { action, rejectionReason } = body;

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // If rejecting, require rejection reason
    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'rejectionReason is required when rejecting' },
        { status: 400 }
      );
    }

    // Get enrollment with related data
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        courses!inner (
          id,
          title,
          price,
          currency
        ),
        parent!inner (
          id,
          email,
          name
        ),
        student!inner (
          id,
          name,
          email
        )
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (action === 'reject') {
      // Reject enrollment
      const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_at: null,
          approved_by: null,
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error rejecting enrollment:', updateError);
        return NextResponse.json(
          { error: 'Failed to reject enrollment' },
          { status: 500 }
        );
      }

      // Send notification to parent
      await createNotification(
        enrollment.parent_id,
        'enrollment_rejected',
        'Enrollment Rejected',
        `Your enrollment for ${enrollment.student.name} in ${enrollment.courses.title} has been rejected.`,
        `/parent/enrollments`
      );

      return NextResponse.json({
        message: 'Enrollment rejected successfully',
        enrollment: { ...enrollment, status: 'rejected', rejection_reason: rejectionReason }
      });
    }

    // Approve enrollment
    // 1. Count parent's active+payment_pending+payment_completed enrollments
    const { data: parentEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('parent_id', enrollment.parent_id)
      .in('status', ['active', 'payment_pending', 'payment_completed']);

    const totalEnrollments = parentEnrollments?.length || 0;

    // 2. Calculate sibling discount
    let discountPercent = 0;
    if (totalEnrollments >= 3) {
      discountPercent = 0.15; // 15% for 3rd+ sibling
    } else if (totalEnrollments >= 2) {
      discountPercent = 0.10; // 10% for 2nd sibling
    }

    // 3. Generate invoice number using UUID-based approach for uniqueness
    const generateInvoiceNumber = () => {
      const year = new Date().getFullYear();
      // Use crypto.randomUUID() for guaranteed uniqueness (Node.js 15.6.0+)
      // Fallback to timestamp + random if crypto.randomUUID is not available
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : `${Date.now().toString(36)}-${Math.floor(Math.random() * 1000).toString(36)}`;
      return `INV-${year}-${uniqueId}`;
    };

    const invoiceNumber = generateInvoiceNumber();

    // 4. Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        parent_id: enrollment.parent_id,
        status: 'pending',
        subtotal: enrollment.courses.price,
        discount_amount: enrollment.courses.price * discountPercent,
        tax_amount: 0, // TODO: Calculate tax based on location
        total: enrollment.courses.price * (1 - discountPercent),
        currency: enrollment.courses.currency,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        paid_at: null,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    // 5. Create invoice item
    const discountAmount = enrollment.courses.price * discountPercent;
    const { error: itemError } = await supabaseAdmin
      .from('invoice_items')
      .insert({
        invoice_id: invoice.id,
        description: `${enrollment.courses.title} - ${enrollment.student.name}`,
        student_id: enrollment.student_id,
        course_id: enrollment.courses.id,
        enrollment_id: enrollment.id,
        quantity: 1,
        unit_price: enrollment.courses.price,
        discount_percent: discountPercent * 100,
        discount_amount: discountAmount,
        total: enrollment.courses.price - discountAmount,
      });

    if (itemError) {
      console.error('Error creating invoice item:', itemError);
      // Rollback invoice creation
      await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json(
        { error: 'Failed to create invoice item' },
        { status: 500 }
      );
    }

    // 6. Update enrollment status to payment_pending
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'payment_pending',
        approved_at: new Date().toISOString(),
        approved_by: currentUser.id,
        rejection_reason: null,
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating enrollment:', updateError);
      // Rollback: delete invoice and invoice items
      await supabaseAdmin.from('invoice_items').delete().eq('invoice_id', invoice.id);
      await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json(
        { error: 'Failed to update enrollment' },
        { status: 500 }
      );
    }

    // 7. Send notification to parent
    await createNotification(
      enrollment.parent_id,
      'enrollment_approved',
      'Enrollment Approved',
      `Your enrollment for ${enrollment.student.name} in ${enrollment.courses.title} has been approved. Please complete payment to activate the enrollment.`,
      `/parent/invoices/${invoice.id}`
    );

    return NextResponse.json({
      message: 'Enrollment approved successfully',
      enrollment: {
        ...enrollment,
        status: 'payment_pending',
        approved_at: new Date().toISOString(),
      },
      invoice,
    });

  } catch (error) {
    console.error('Error processing enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
