import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const invoiceId = params.id;

    try {
        // Fetch invoice with related data
        const { data: invoice, error } = await supabaseAdmin
            .from('invoices')
            .select(`
                *,
                enrollments:enrollments(
                    id,
                    student_id,
                    course_id,
                    discount_percent
                ),
                invoice_items:invoice_items(
                    id,
                    description,
                    unit_amount,
                    quantity,
                    discount_percent,
                    students:students(id, name),
                    courses:courses(id, name)
                )
            `)
            .eq('id', invoiceId)
            .single();

        if (error) throw error;

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Check access permissions: admin or invoice's own parent
        const isAdmin = user.role === 'admin';
        const isInvoiceOwner = user.id === invoice.parent_id;

        if (!isAdmin && !isInvoiceOwner) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ invoice });
    } catch (error: any) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
