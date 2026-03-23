import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { generateRequestId, withRequestId } from '@/lib/request-id';
import { getMockDb, saveMockDb } from '@/lib/mockDb';

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
        if (process.env.TEST_BYPASS === 'true') {
            const db = getMockDb();
            let enrollments = Array.isArray(db.enrollments) ? db.enrollments : [];
            const { searchParams } = new URL(req.url);
            const status = searchParams.get('status');
            const courseId = searchParams.get('courseId');
            const studentId = searchParams.get('studentId');
            const limit = parseInt(searchParams.get('limit') || '50', 10);
            const offset = parseInt(searchParams.get('offset') || '0', 10);

            if (status) {
                enrollments = enrollments.filter((enrollment: any) => enrollment.status === status);
            }
            if (courseId) {
                enrollments = enrollments.filter((enrollment: any) => enrollment.course_id === courseId);
            }
            if (studentId) {
                enrollments = enrollments.filter((enrollment: any) => enrollment.student_id === studentId);
            }
            if (user.role === 'student') {
                enrollments = enrollments.filter((enrollment: any) => enrollment.student_id === user.id);
            }

            const response = NextResponse.json({
                enrollments: enrollments.slice(offset, offset + limit),
                total: enrollments.length,
                limit,
                offset,
            });
            response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
            return response;
        }

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

        const response = NextResponse.json({
            enrollments,
            total: count || 0,
            limit,
            offset
        });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const requestId = generateRequestId();
    const session = await getServerSession(authOptions);
    if (!session) {
        return withRequestId(NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', requestId }, { status: 401 }), requestId);
    }
    const user = session.user as any;

    try {
        const body = await req.json();
        const courseId = body.course_id || body.courseId;
        const studentEmail = body.student_email || body.studentEmail;
        const studentId = body.student_id || body.studentId;

        if (!courseId) {
            return withRequestId(NextResponse.json({ error: 'course_id is required', code: 'VALIDATION_ERROR', requestId }, { status: 400 }), requestId);
        }

        if (process.env.TEST_BYPASS === 'true') {
            const db = getMockDb();
            if (!Array.isArray(db.enrollments)) {
                db.enrollments = [];
            }
            if (!Array.isArray(db.users)) {
                db.users = [
                    { id: '00000000-0000-0000-0000-000000000001', email: 'teacher@eduverse.com', name: 'Test Teacher', role: 'teacher' },
                    { id: '00000000-0000-0000-0000-000000000002', email: 'student@eduverse.com', name: 'Test Student', role: 'student' },
                    { id: '00000000-0000-0000-0000-000000000003', email: 'admin@eduverse.com', name: 'Test Admin', role: 'admin' },
                ];
            }

            const courses = Array.isArray(db.courses) ? db.courses : [];
            const targetCourse = courses.find((course: any) => course.id === courseId);
            if (!targetCourse) {
                return withRequestId(NextResponse.json({ error: 'Course not found', code: 'NOT_FOUND', requestId }, { status: 404 }), requestId);
            }

            if (user.role === 'teacher' && targetCourse.teacher_id !== user.id) {
                return withRequestId(NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, { status: 403 }), requestId);
            }

            const resolvedStudent = db.users.find((candidate: any) =>
                (studentId && candidate.id === studentId) ||
                (studentEmail && String(candidate.email).toLowerCase() === String(studentEmail).toLowerCase())
            );

            if (!resolvedStudent) {
                return withRequestId(NextResponse.json({ error: 'User not found', code: 'NOT_FOUND', requestId }, { status: 404 }), requestId);
            }
            if (resolvedStudent.role !== 'student') {
                return withRequestId(NextResponse.json({ error: 'Target user is not a student account', code: 'VALIDATION_ERROR', requestId }, { status: 400 }), requestId);
            }

            const duplicate = db.enrollments.find((enrollment: any) => (
                enrollment.course_id === courseId &&
                enrollment.student_id === resolvedStudent.id &&
                ['active', 'payment_completed', 'pending'].includes(enrollment.status)
            ));
            if (duplicate) {
                return withRequestId(NextResponse.json({ error: 'Student already enrolled', code: 'CONFLICT', requestId }, { status: 409 }), requestId);
            }

            const enrollment = {
                id: `enroll-${Date.now()}`,
                student_id: resolvedStudent.id,
                student_email: resolvedStudent.email,
                student_name: resolvedStudent.name,
                course_id: courseId,
                grade_id: targetCourse.grade_id || null,
                status: 'active',
                enrollment_date: new Date().toISOString(),
                enrolled_at: new Date().toISOString(),
            };

            db.enrollments.push(enrollment);
            saveMockDb(db);
            return withRequestId(NextResponse.json({ enrollment, requestId }, { status: 201 }), requestId);
        }

        // Teacher/Admin enrollment flow (teacher-owned course)
        if (user.role === 'teacher' || isAdmin(user.role)) {
            let resolvedStudentId = studentId;
            if (!resolvedStudentId && studentEmail) {
                const { data: studentLookup, error: studentLookupError } = await supabaseAdmin
                    .from('users')
                    .select('id, role')
                    .eq('email', studentEmail)
                    .single();

                if (studentLookupError || !studentLookup) {
                    return withRequestId(NextResponse.json({ error: 'User not found', code: 'NOT_FOUND', requestId }, { status: 404 }), requestId);
                }
                if (studentLookup.role !== 'student') {
                    return withRequestId(NextResponse.json({ error: 'Target user is not a student account', code: 'VALIDATION_ERROR', requestId }, { status: 400 }), requestId);
                }
                resolvedStudentId = studentLookup.id;
            }

            if (!resolvedStudentId) {
                return withRequestId(NextResponse.json({ error: 'student_email or student_id is required', code: 'VALIDATION_ERROR', requestId }, { status: 400 }), requestId);
            }

            const { data: course, error: courseError } = await supabaseAdmin
                .from('courses')
                .select('id, grade_id, teacher_id')
                .eq('id', courseId)
                .single();

            if (courseError || !course) {
                return withRequestId(NextResponse.json({ error: 'Course not found', code: 'NOT_FOUND', requestId }, { status: 404 }), requestId);
            }

            if (user.role === 'teacher' && course.teacher_id !== user.id) {
                return withRequestId(NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN', requestId }, { status: 403 }), requestId);
            }

            const { data: duplicate } = await supabaseAdmin
                .from('enrollments')
                .select('id, status')
                .eq('course_id', courseId)
                .eq('student_id', resolvedStudentId)
                .in('status', ['active', 'payment_completed', 'pending'])
                .maybeSingle();

            if (duplicate) {
                return withRequestId(NextResponse.json({ error: 'Student already enrolled', code: 'CONFLICT', requestId }, { status: 409 }), requestId);
            }

            const { data: enrollment, error: enrollmentError } = await supabaseAdmin
                .from('enrollments')
                .insert({
                    student_id: resolvedStudentId,
                    course_id: courseId,
                    grade_id: course.grade_id,
                    status: 'active',
                    enrollment_date: new Date().toISOString(),
                })
                .select()
                .single();

            if (enrollmentError || !enrollment) {
                return withRequestId(NextResponse.json({ error: 'Failed to create enrollment', code: 'CREATE_ERROR', requestId }, { status: 500 }), requestId);
            }

            return withRequestId(NextResponse.json({ enrollment, requestId }, { status: 201 }), requestId);
        }

        // Parent enrollment flow
        if (user.role !== 'parent') {
            return withRequestId(NextResponse.json({ error: 'Only parents, teachers, or admins can enroll students', code: 'FORBIDDEN', requestId }, { status: 403 }), requestId);
        }

        let resolvedStudentId = studentId;
        if (studentEmail && !studentId) {
            const { data: student } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', studentEmail)
                .eq('role', 'student')
                .single();

            if (!student) {
                return withRequestId(NextResponse.json({ error: 'Student not found', code: 'NOT_FOUND', requestId }, { status: 404 }), requestId);
            }
            resolvedStudentId = student.id;
        }

        if (!resolvedStudentId) {
            return withRequestId(NextResponse.json({ error: 'Missing studentId or studentEmail', code: 'VALIDATION_ERROR', requestId }, { status: 400 }), requestId);
        }

        const { data: relationship } = await supabaseAdmin
            .from('parent_student')
            .select('id')
            .eq('parent_id', user.id)
            .eq('student_id', resolvedStudentId)
            .single();

        if (!relationship) {
            return withRequestId(NextResponse.json({ error: 'Student not linked to this parent', code: 'FORBIDDEN', requestId }, { status: 403 }), requestId);
        }

        const { data: existingEnrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id, status')
            .eq('student_id', resolvedStudentId)
            .eq('course_id', courseId)
            .single();

        if (existingEnrollment) {
            return withRequestId(NextResponse.json({
                error: 'Student already enrolled',
                code: 'CONFLICT',
                enrollmentId: existingEnrollment.id,
                status: existingEnrollment.status,
                requestId,
            }, { status: 409 }), requestId);
        }

        const { data: enrollment, error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                student_id: resolvedStudentId,
                course_id: courseId,
                parent_id: user.id,
                status: 'pending',
                enrolled_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return withRequestId(NextResponse.json({ enrollment, requestId }, { status: 201 }), requestId);
    } catch (error) {
        console.error('Error creating enrollment:', error);
        return withRequestId(NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_SERVER_ERROR', requestId }, { status: 500 }), requestId);
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
