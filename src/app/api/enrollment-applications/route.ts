import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'You must be logged in to submit an enrollment application' }, { status: 401 });
        }

        const formData = await req.formData();

        // Extract fields
        const gradeId = formData.get('gradeId') as string;
        const studentDetailsStr = formData.get('studentDetails') as string;
        const parentDetailsStr = formData.get('parentDetails') as string;
        const paymentMethod = formData.get('paymentMethod') as string;
        const paymentPlanStr = formData.get('paymentPlan') as string;
        const totalAmountStr = formData.get('totalAmount') as string;
        const currency = formData.get('currency') as string || 'AED';

        const studentDetails = studentDetailsStr ? JSON.parse(studentDetailsStr) : {};
        const parentDetails = parentDetailsStr ? JSON.parse(parentDetailsStr) : {};
        const paymentPlan = paymentPlanStr ? JSON.parse(paymentPlanStr) : {};
        const totalAmount = totalAmountStr ? parseFloat(totalAmountStr) : 0;

        // Handle file uploads
        const documents: Record<string, string> = {};

        // Allowed MIME types for file uploads
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];

        const uploadFile = async (file: File | null, type: string) => {
            if (!file) return;
            
            // Validate file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`File ${type} is too large. Max size is 5MB.`);
            }

            // Validate file type
            if (!allowedMimeTypes.includes(file.type)) {
                throw new Error(`File ${type} has invalid type (${file.type}). Allowed types: PDF, JPEG, PNG, GIF.`);
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExt = file.name.split('.').pop() || 'tmp';
            const fileName = `${userId}/${crypto.randomUUID()}_${type}.${fileExt}`;

            const { data, error } = await supabaseAdmin.storage
                .from('enrollment_documents')
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) throw error;
            documents[type] = data.path;
        };

        const emiratesIdFile = formData.get('emiratesId') as File | null;
        const egyptianIdFile = formData.get('egyptianId') as File | null;
        const previousSchoolReportFile = formData.get('previousSchoolReport') as File | null;
        const bankReceiptFile = formData.get('bankReceipt') as File | null;

        await uploadFile(emiratesIdFile, 'emiratesId');
        await uploadFile(egyptianIdFile, 'egyptianId');
        await uploadFile(previousSchoolReportFile, 'previousSchoolReport');
        if (paymentMethod === 'bank_transfer') {
            await uploadFile(bankReceiptFile, 'bankReceipt');
        }

        const status = paymentMethod === 'stripe' ? 'payment_pending' : 'pending';

        // Insert into database
        const { data: application, error } = await supabaseAdmin
            .from('enrollment_applications')
            .insert({
                user_id: userId,
                grade_id: gradeId || null,
                student_details: studentDetails,
                parent_details: parentDetails,
                documents: documents,
                payment_method: paymentMethod,
                payment_plan: paymentPlan,
                total_amount: totalAmount,
                currency: currency,
                status: status as any
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, application });
    } catch (error: any) {
        console.error('Enrollment submission error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role?.toLowerCase() !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('enrollment_applications')
            .select(`
                *,
                users!enrollment_applications_user_id_fkey(name, email),
                grades(name)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status as any);
        }

        const { data: applications, error, count } = await query;
        if (error) throw error;

        return NextResponse.json({
            applications,
            meta: { page, limit, total: count || 0, totalPages: Math.max(1, Math.ceil((count || 0) / limit)) },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
