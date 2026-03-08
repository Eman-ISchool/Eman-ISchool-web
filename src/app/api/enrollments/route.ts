import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    // Allow admins or students to view enrollments
    if (!isAdmin(user.role) && user.role !== 'student') {
        return NextResponse.json({ error: 'Only admins or students can view enrollments' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'pending';
        const courseId = searchParams.get('courseId');
        const parentId = searchParams.get('parentId');
        const studentId = searchParams.get('studentId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabaseAdmin
            .from('enrollments')
            .select(`
                *,
                students(id, name, email),
                courses(id, name, grade_level, price),
                parents(id, name, email)
            `)
            .eq('status', status)
            .order('enrolled_at', { ascending: false });

        // Apply filters if provided
        if (courseId) {
            query = query.eq('course_id', courseId);
        }
        if (parentId) {
            // Only admins or the parent themselves can view enrollments by parentId
            if (!isAdmin(user.role) && user.id !== parentId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            query = query.eq('parent_id', parentId);
        }
        if (studentId) {
            // If studentId is provided, verify student has permission to view
            if (user.role === 'student' && user.id !== studentId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
            query = query.eq('student_id', studentId);
        }

        // Fetch enrollments with related data
        const { data: enrollments, error } = await query
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Get total count with same filters
        let countQuery = supabaseAdmin
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('status', status);

        if (courseId) {
            countQuery = countQuery.eq('course_id', courseId);
        }
        if (parentId) {
            countQuery = countQuery.eq('parent_id', parentId);
        }
        if (studentId) {
            countQuery = countQuery.eq('student_id', studentId);
        }

        const { count } = await countQuery;

        return NextResponse.json({
            enrollments,
            total: count || 0,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    if (user.role !== 'parent') {
        return NextResponse.json({ error: 'Only parents can enroll students' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { studentId, studentEmail, courseId } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Resolve student ID from email if provided
        let resolvedStudentId = studentId;
        if (studentEmail && !studentId) {
            const { data: student } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', studentEmail)
                .eq('role', 'student')
                .single();

            if (!student) {
                return NextResponse.json({ error: 'Student not found' }, { status: 404 });
            }
            resolvedStudentId = student.id;
        }

        if (!resolvedStudentId) {
            return NextResponse.json({ error: 'Missing studentId or studentEmail' }, { status: 400 });
        }

        // Verify parent-student relationship
        const { data: relationship } = await supabaseAdmin
            .from('parent_student')
            .select('id')
            .eq('parent_id', user.id)
            .eq('student_id', resolvedStudentId)
            .single();

        if (!relationship) {
            return NextResponse.json({ error: 'Student not linked to this parent' }, { status: 403 });
        }

        // Check if already enrolled
        const { data: existingEnrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id, status')
            .eq('student_id', resolvedStudentId)
            .eq('course_id', courseId)
            .single();

        if (existingEnrollment) {
            return NextResponse.json({
                error: 'Student already enrolled',
                enrollmentId: existingEnrollment.id,
                status: existingEnrollment.status
            }, { status: 409 });
        }

        // Create pending enrollment
        const { data: enrollment, error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                student_id: resolvedStudentId,
                course_id: courseId,
                parent_id: user.id,
                status: 'pending',
                enrolled_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error('Error creating enrollment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    if (!isAdmin(user.role)) {
        return NextResponse.json({ error: 'Only admins can approve/reject enrollments' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { enrollmentId, action, reason } = body;

        if (!enrollmentId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Get enrollment details
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('*, students(name), courses(name), parents(name, email)')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        // Update enrollment status
        const newStatus = action === 'approve' ? 'active' : 'rejected';
        const { error: updateError } = await supabaseAdmin
            .from('enrollments')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                rejection_reason: action === 'reject' ? reason : null
            })
            .eq('id', enrollmentId);

        if (updateError) throw updateError;

        // Send notification to parent
        const notificationTitle = action === 'approve'
            ? 'Enrollment Approved'
            : 'Enrollment Rejected';
        const notificationMessage = action === 'approve'
            ? `Your child ${enrollment.students?.name}'s enrollment in ${enrollment.courses?.name} has been approved.`
            : `Your child ${enrollment.students?.name}'s enrollment in ${enrollment.courses?.name} has been rejected. ${reason || ''}`;

        await createNotification(
            enrollment.parent_id,
            'enrollment',
            notificationTitle,
            notificationMessage,
            `/enrollments/${enrollmentId}`
        );

        return NextResponse.json({
            message: `Enrollment ${newStatus}`,
            enrollment: { ...enrollment, status: newStatus }
        });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
