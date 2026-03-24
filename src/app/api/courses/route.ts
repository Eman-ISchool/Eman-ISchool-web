import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

// GET - Fetch courses with filters
// Note: This endpoint has role-based filtering:
// - Admin/Teacher: Can see all courses (published and unpublished)
// - Students/Public: Can only see published courses
export async function GET(req: Request) {
    const requestId = generateRequestId();

    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
        const offset = (page - 1) * limit;
        const subject = searchParams.get('subject');
        const subjectId = searchParams.get('subjectId'); // Add subjectId filter
        const teacherId = searchParams.get('teacherId');
        const published = searchParams.get('published');
        const search = searchParams.get('search');
        const gradeId = searchParams.get('gradeId');

        const session = await getServerSession(authOptions);
        const currentUser = session?.user ? await getCurrentUser(session) : null;
        const canSeeUnpublished = !!(currentUser && isTeacherOrAdmin(currentUser.role));

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
                { status: 500 }
            );
        }

        // Try full query with joins; fall back to basic query if FK relationships are missing
        let query = supabaseAdmin
            .from('courses')
            .select(`
                *,
                teacher:users!courses_teacher_id_fkey(id, name, email, image),
                grade:grades(id, name, slug),
                subject:subjects(id, title, slug),
                enrollments:enrollments(count)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Pre-check: test if the join query works; if not, fall back to simple select
        const testResult = await supabaseAdmin
            .from('courses')
            .select(`
                *,
                teacher:users!courses_teacher_id_fkey(id, name, email, image),
                grade:grades(id, name, slug),
                subject:subjects(id, title, slug),
                enrollments:enrollments(count)
            `, { count: 'exact', head: true });

        if (testResult.error) {
            console.warn('Courses join query failed, using basic query:', testResult.error.message);
            query = supabaseAdmin
                .from('courses')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
        }

        if (currentUser?.role === 'teacher') {
            query = query.eq('teacher_id', currentUser.id);
        }

        if (currentUser?.role === 'student') {
            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('course_id')
                .eq('student_id', currentUser.id)
                .eq('status', 'active');

            const enrolledCourseIds = (enrollments || []).map((enrollment: any) => enrollment.course_id);
            if (enrolledCourseIds.length === 0) {
                return NextResponse.json({
                    courses: [],
                    total: 0,
                    meta: { page, limit, total: 0, totalPages: 1 },
                    requestId,
                });
            }
            query = query.in('id', enrolledCourseIds);
        }

        // Support both 'subject' and 'subjectId' parameters
        const subjectFilter = subjectId || subject;
        if (subjectFilter) {
            query = query.eq('subject_id', subjectFilter);
        }

        if (gradeId) {
            query = query.eq('grade_id', gradeId);
        }

        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        // Non-admin/teacher users can only see published courses
        if (!canSeeUnpublished) {
            query = query.eq('is_published', true);
        } else if (published === 'true') {
            // Admin/teacher can filter by published if requested
            query = query.eq('is_published', true);
        } else if (published === 'false') {
            query = query.eq('is_published', false);
        }

        if (search) {
            // Sanitize search input: escape PostgREST special characters to prevent injection
            const sanitizedSearch = search
                .replace(/\\/g, '\\\\')
                .replace(/%/g, '\\%')
                .replace(/,/g, '\\,')
                .replace(/\./g, '\\.')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)');
            query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
        }

        const { data: courses, error, count } = await query;

        if (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json(
                { error: 'Failed to fetch courses', code: 'COURSES_FETCH_ERROR', requestId },
                { status: 500 }
            );
        }

        const courseIds = (courses || []).map((course: any) => course.id);
        const { data: nextLessons } = courseIds.length
            ? await supabaseAdmin
                .from('lessons')
                .select('course_id, title, start_date_time')
                .in('course_id', courseIds)
                .gt('start_date_time', new Date().toISOString())
                .order('start_date_time', { ascending: true })
            : { data: [] as any[] };

        const nextLessonByCourse = new Map<string, { title: string; start_date_time: string }>();
        for (const lesson of nextLessons || []) {
            if (!nextLessonByCourse.has(lesson.course_id)) {
                nextLessonByCourse.set(lesson.course_id, {
                    title: lesson.title,
                    start_date_time: lesson.start_date_time,
                });
            }
        }

        const enrichedCourses = (courses || []).map((course: any) => ({
            ...course,
            teacher_name: course.teacher?.name || '',
            next_lesson: nextLessonByCourse.get(course.id) || null,
        }));

        const response = NextResponse.json({
            courses: enrichedCourses,
            total: count || 0,
            meta: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
            },
            requestId,
        });
        // Cache GET responses for 60s, allow stale-while-revalidate for 5min
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}

// POST - Create a new course
export async function POST(req: Request) {
    const requestId = generateRequestId();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
            { status: 401 }
        );
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || (!isTeacherOrAdmin(currentUser.role) && !isAdmin(currentUser.role))) {

        if (currentUser?.role === 'supervisor') {
            return NextResponse.json(
                { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS', detail: 'Supervisors cannot create courses', requestId },
                { status: 403 }
            );
        }
        // Only teachers and admins can create courses. Supervisors cannot.
        return NextResponse.json(
            { error: 'Forbidden. Supervisors cannot create courses.', code: 'FORBIDDEN', requestId },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const { title, description, price, durationHours, imageUrl, thumbnailUrl, subject_id, grade_id, maxStudents } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Course title is required', code: 'VALIDATION_ERROR', requestId },
                { status: 400 }
            );
        }

        // Validate price >= 0
        if (price !== undefined && price < 0) {
            return NextResponse.json(
                { error: 'Price must be non-negative', code: 'VALIDATION_ERROR', requestId },
                { status: 400 }
            );
        }

        // Validate grade_id exists and is active
        if (grade_id) {
            const { data: grade, error: gradeError } = await supabaseAdmin
                .from('grades')
                .select('id, is_active')
                .eq('id', grade_id)
                .single();

            if (gradeError || !grade || !grade.is_active) {
                return NextResponse.json(
                    { error: 'Grade not found or inactive', code: 'VALIDATION_ERROR', requestId },
                    { status: 400 }
                );
            }
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now();

        const { data: course, error } = await supabaseAdmin
            .from('courses')
            .insert({
                title,
                slug,
                description,
                price: price || 0,
                duration_hours: durationHours,
                image_url: imageUrl,
                thumbnail_url: thumbnailUrl,
                subject_id: subject_id || body.subject,
                grade_level: grade_id,
                grade_id: grade_id,
                teacher_id: currentUser.id,
                max_students: maxStudents || 30,
                is_published: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            return NextResponse.json(
                { error: 'Failed to create course', code: 'COURSE_CREATE_ERROR', requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ course, requestId }, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}

// PATCH - Update a course
export async function PATCH(req: Request) {
    const requestId = generateRequestId();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
            { status: 401 }
        );
    }

    const currentUser = await getCurrentUser(session);

    // Allow Admin, Teacher, and Supervisor to edit courses
    if (!currentUser || (!isTeacherOrAdmin(currentUser.role) && currentUser.role !== 'supervisor')) {
        return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN', requestId },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const { id, action, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Course ID is required', code: 'VALIDATION_ERROR', requestId },
                { status: 400 }
            );
        }

        // Verify ownership or admin
        const { data: existingCourse } = await supabaseAdmin
            .from('courses')
            .select('teacher_id, is_published, title, grade_id')
            .eq('id', id)
            .single();

        if (!existingCourse) {
            return NextResponse.json(
                { error: 'Course not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        // Check permission: Admin can edit any course, Teacher can edit their own courses,
        // Supervisor can edit courses in grades they supervise
        if (existingCourse.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            if (currentUser.role !== 'supervisor' || existingCourse.grade_id !== currentUser.supervised_grade_id) {
                return NextResponse.json(
                    { error: 'Forbidden. You do not have permission to edit this course.', code: 'FORBIDDEN', requestId },
                    { status: 403 }
                );
            }
        }

        // Handle publish action
        if (action === 'publish') {
            // Run publish checklist validation
            const issues: string[] = [];

            if (!existingCourse.title) {
                issues.push('Course must have a title');
            }

            if (!existingCourse.grade_id) {
                issues.push('Course must have a grade level selected');
            }

            // Check if course has at least one lesson
            const { count: lessonCount } = await supabaseAdmin
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', id);

            if (!lessonCount || lessonCount === 0) {
                issues.push('Course must have at least one lesson');
            }

            if (issues.length > 0) {
                return NextResponse.json(
                    { error: 'Cannot publish course', code: 'PUBLISH_VALIDATION_FAILED', issues, requestId },
                    { status: 422 }
                );
            }

            // All checks passed, publish the course
            const { data: course, error } = await supabaseAdmin
                .from('courses')
                .update({ is_published: true })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error publishing course:', error);
                return NextResponse.json(
                    { error: 'Failed to publish course', code: 'COURSE_PUBLISH_ERROR', requestId },
                    { status: 500 }
                );
            }

            return NextResponse.json({ course, requestId });
        }

        // Map camelCase to snake_case
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.durationHours !== undefined) dbUpdates.duration_hours = updates.durationHours;
        if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
        if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
        if (updates.subject !== undefined) dbUpdates.subject_id = updates.subject;
        if (updates.subject_id !== undefined) dbUpdates.subject_id = updates.subject_id;
        if (updates.gradeLevel !== undefined) dbUpdates.grade_level = updates.gradeLevel;
        if (updates.grade_id !== undefined) dbUpdates.grade_id = updates.grade_id;
        if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
        if (updates.maxStudents !== undefined) dbUpdates.max_students = updates.maxStudents;
        if (updates.meet_link !== undefined) dbUpdates.meet_link = updates.meet_link;

        const { data: course, error } = await supabaseAdmin
            .from('courses')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating course:', error);
            return NextResponse.json(
                { error: 'Failed to update course', code: 'COURSE_UPDATE_ERROR', requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ course, requestId });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}

// DELETE - Delete a course
export async function DELETE(req: Request) {
    const requestId = generateRequestId();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
            { status: 401 }
        );
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN', requestId },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Course ID is required', code: 'VALIDATION_ERROR', requestId },
                { status: 400 }
            );
        }

        // Verify ownership or admin
        const { data: existingCourse } = await supabaseAdmin
            .from('courses')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (!existingCourse) {
            return NextResponse.json(
                { error: 'Course not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        if (existingCourse.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting course:', error);
            return NextResponse.json(
                { error: 'Failed to delete course', code: 'COURSE_DELETE_ERROR', requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, requestId });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}
