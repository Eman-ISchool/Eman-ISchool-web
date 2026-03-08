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
        if (process.env.TEST_BYPASS === 'true') {
            const { getMockDb } = require('@/lib/mockDb');
            const db = getMockDb();
            const courses = db.courses || [];
            return NextResponse.json({ courses, total: courses.length, requestId });
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database not configured', code: 'DATABASE_NOT_CONFIGURED', requestId },
                { status: 500 }
            );
        }

        const session = await getServerSession(authOptions);
        const currentUser = session?.user ? await getCurrentUser(session) : null;
        const canSeeUnpublished = currentUser && isTeacherOrAdmin(currentUser.role);

        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');
        const subjectId = searchParams.get('subjectId'); // Add subjectId filter
        const teacherId = searchParams.get('teacherId');
        const published = searchParams.get('published');
        const search = searchParams.get('search');
        const gradeId = searchParams.get('gradeId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

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
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: courses, error, count } = await query;

        if (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json(
                { error: 'Failed to fetch courses', code: 'COURSES_FETCH_ERROR', requestId },
                { status: 500 }
            );
        }

        return NextResponse.json({ courses, total: count, requestId });
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

        if (process.env.TEST_BYPASS === 'true') {
            const { getMockDb, saveMockDb } = require('@/lib/mockDb');
            const db = getMockDb();
            if (!db.courses) db.courses = [];
            const newCourse = {
                id: `course-${Date.now()}`,
                title,
                description,
                grade_id,
                subject_id: subject_id || body.subject,
                teacher_id: currentUser.id,
                teacher: { name: currentUser.name, email: currentUser.email }
            };
            db.courses.push(newCourse);
            saveMockDb(db);
            return NextResponse.json({ course: newCourse, requestId }, { status: 201 });
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
