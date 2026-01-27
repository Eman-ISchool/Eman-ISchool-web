import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch courses with filters
// Note: This endpoint has role-based filtering:
// - Admin/Teacher: Can see all courses (published and unpublished)
// - Students/Public: Can only see published courses
export async function GET(req: Request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const session = await getServerSession(authOptions);
        const currentUser = session?.user ? await getCurrentUser(session) : null;
        const canSeeUnpublished = currentUser && isTeacherOrAdmin(currentUser.role);

        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');
        const teacherId = searchParams.get('teacherId');
        const published = searchParams.get('published');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('courses')
            .select(`
                *,
                teacher:users!courses_teacher_id_fkey(id, name, email, image),
                enrollments:enrollments(count)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (subject) {
            query = query.eq('subject', subject);
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
            return NextResponse.json({ error: 'فشل جلب الدورات' }, { status: 500 });
        }

        return NextResponse.json({ courses, total: count });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ error: 'فشل جلب الدورات' }, { status: 500 });
    }
}

// POST - Create a new course
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, description, price, durationHours, imageUrl, subject, gradeLevel, maxStudents } = body;

        if (!title) {
            return NextResponse.json({ error: 'عنوان الدورة مطلوب' }, { status: 400 });
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
                subject,
                grade_level: gradeLevel,
                teacher_id: currentUser.id,
                max_students: maxStudents || 30,
                is_published: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            return NextResponse.json({ error: 'فشل إنشاء الدورة' }, { status: 500 });
        }

        return NextResponse.json({ course, message: 'تم إنشاء الدورة بنجاح' });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ error: 'فشل إنشاء الدورة' }, { status: 500 });
    }
}

// PATCH - Update a course
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
        }

        // Verify ownership or admin
        const { data: existingCourse } = await supabaseAdmin
            .from('courses')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (!existingCourse) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        if (existingCourse.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Map camelCase to snake_case
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.durationHours !== undefined) dbUpdates.duration_hours = updates.durationHours;
        if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
        if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
        if (updates.gradeLevel !== undefined) dbUpdates.grade_level = updates.gradeLevel;
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
            return NextResponse.json({ error: 'فشل تحديث الدورة' }, { status: 500 });
        }

        return NextResponse.json({ course, message: 'تم تحديث الدورة بنجاح' });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ error: 'فشل تحديث الدورة' }, { status: 500 });
    }
}

// DELETE - Delete a course
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
        }

        // Verify ownership or admin
        const { data: existingCourse } = await supabaseAdmin
            .from('courses')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (!existingCourse) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        if (existingCourse.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting course:', error);
            return NextResponse.json({ error: 'فشل حذف الدورة' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'تم حذف الدورة بنجاح' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'فشل حذف الدورة' }, { status: 500 });
    }
}
