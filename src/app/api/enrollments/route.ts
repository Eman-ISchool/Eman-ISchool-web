import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch enrollments
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('enrollments')
            .select(`
                *,
                student:users!enrollments_student_id_fkey(id, name, email, image),
                course:courses(id, title, slug, image_url, teacher_id)
            `)
            .order('enrolled_at', { ascending: false });

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        // Students can only see their own enrollments
        if (currentUser.role === 'student') {
            query = query.eq('student_id', currentUser.id);
        } else if (studentId) {
            query = query.eq('student_id', studentId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: enrollments, error } = await query;

        if (error) {
            console.error('Error fetching enrollments:', error);
            return NextResponse.json({ error: 'فشل جلب التسجيلات' }, { status: 500 });
        }

        return NextResponse.json({ enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return NextResponse.json({ error: 'فشل جلب التسجيلات' }, { status: 500 });
    }
}

// POST - Enroll in a course
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { courseId, studentId } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
        }

        // Determine which student to enroll
        const targetStudentId = currentUser.role === 'admin' && studentId
            ? studentId
            : currentUser.id;

        // Check if course exists and has capacity
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select(`
                *,
                enrollments:enrollments(count)
            `)
            .eq('id', courseId)
            .single();

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        // Check enrollment limit
        const currentEnrollments = course.enrollments?.[0]?.count || 0;
        if (currentEnrollments >= course.max_students) {
            return NextResponse.json({ error: 'الدورة ممتلئة' }, { status: 400 });
        }

        // Check if already enrolled
        const { data: existing } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('course_id', courseId)
            .eq('student_id', targetStudentId)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'مسجل بالفعل في هذه الدورة' }, { status: 400 });
        }

        const { data: enrollment, error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                course_id: courseId,
                student_id: targetStudentId,
                status: 'active',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating enrollment:', error);
            return NextResponse.json({ error: 'فشل التسجيل' }, { status: 500 });
        }

        return NextResponse.json({ enrollment, message: 'تم التسجيل بنجاح' });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        return NextResponse.json({ error: 'فشل التسجيل' }, { status: 500 });
    }
}

// PATCH - Update enrollment status
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, status, progressPercent } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف التسجيل مطلوب' }, { status: 400 });
        }

        // Verify ownership or admin/teacher
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('student_id, course:courses(teacher_id)')
            .eq('id', id)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'التسجيل غير موجود' }, { status: 404 });
        }

        const isOwner = enrollment.student_id === currentUser.id;
        const isTeacher = enrollment.course?.teacher_id === currentUser.id;
        const isAdmin = currentUser.role === 'admin';

        if (!isOwner && !isTeacher && !isAdmin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const updates: any = {};
        if (status) updates.status = status;
        if (progressPercent !== undefined) updates.progress_percent = progressPercent;
        if (status === 'completed') updates.completed_at = new Date().toISOString();
        updates.last_accessed = new Date().toISOString();

        const { data: updated, error } = await supabaseAdmin
            .from('enrollments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating enrollment:', error);
            return NextResponse.json({ error: 'فشل تحديث التسجيل' }, { status: 500 });
        }

        return NextResponse.json({ enrollment: updated, message: 'تم تحديث التسجيل' });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        return NextResponse.json({ error: 'فشل تحديث التسجيل' }, { status: 500 });
    }
}

// DELETE - Unenroll from a course
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'معرف التسجيل مطلوب' }, { status: 400 });
        }

        // Verify ownership or admin
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('student_id')
            .eq('id', id)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'التسجيل غير موجود' }, { status: 404 });
        }

        if (enrollment.student_id !== currentUser.id && currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('enrollments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting enrollment:', error);
            return NextResponse.json({ error: 'فشل إلغاء التسجيل' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'تم إلغاء التسجيل' });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        return NextResponse.json({ error: 'فشل إلغاء التسجيل' }, { status: 500 });
    }
}
