import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
// GET - Fetch assignments with filters
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('assignments')
            .select(`
                *,
                course:courses(id, title, slug, teacher_id)
            `, { count: 'exact' })
            .order('due_date', { ascending: true })
            .range(offset, offset + limit - 1);

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data: assignments, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: 'فشل جلب المهام' }, { status: 500 });
        }

        return NextResponse.json({ assignments, total: count });
    } catch (error) {
        return NextResponse.json({ error: 'فشل جلب المهام' }, { status: 500 });
    }
}

// POST - Create a new assignment
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
        const { courseId, title, description, dueDate, maxScore, lessonId } = body;

        if (!courseId) {
            return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
        }

        if (!title) {
            return NextResponse.json({ error: 'عنوان المهمة مطلوب' }, { status: 400 });
        }

        if (!dueDate) {
            return NextResponse.json({ error: 'تاريخ التسليم مطلوب' }, { status: 400 });
        }

        // Verify course exists and user is the teacher or admin
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select('id, teacher_id')
            .eq('id', courseId)
            .single();

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        if (course.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { data: assignment, error } = await supabaseAdmin
            .from('assignments')
            .insert({
                course_id: courseId,
                title,
                description: description || null,
                due_date: dueDate,
                max_score: maxScore || 100,
                lesson_id: lessonId || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'فشل إنشاء المهمة' }, { status: 500 });
        }

        return NextResponse.json({ assignment, message: 'تم إنشاء المهمة بنجاح' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'فشل إنشاء المهمة' }, { status: 500 });
    }
}

// PATCH - Update an assignment
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
            return NextResponse.json({ error: 'معرف المهمة مطلوب' }, { status: 400 });
        }

        // Verify assignment exists and user is the course teacher or admin
        const { data: assignment } = await supabaseAdmin
            .from('assignments')
            .select('id, course:courses(teacher_id)')
            .eq('id', id)
            .single();

        if (!assignment) {
            return NextResponse.json({ error: 'المهمة غير موجودة' }, { status: 404 });
        }

        if (assignment.course?.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Map camelCase to snake_case
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.maxScore !== undefined) dbUpdates.max_score = updates.maxScore;

        const { data: updatedAssignment, error } = await supabaseAdmin
            .from('assignments')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'فشل تحديث المهمة' }, { status: 500 });
        }

        return NextResponse.json({ assignment: updatedAssignment, message: 'تم تحديث المهمة بنجاح' });
    } catch (error) {
        return NextResponse.json({ error: 'فشل تحديث المهمة' }, { status: 500 });
    }
}

// DELETE - Delete an assignment
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
            return NextResponse.json({ error: 'معرف المهمة مطلوب' }, { status: 400 });
        }

        // Verify assignment exists and user is the course teacher or admin
        const { data: assignment } = await supabaseAdmin
            .from('assignments')
            .select('id, course:courses(teacher_id)')
            .eq('id', id)
            .single();

        if (!assignment) {
            return NextResponse.json({ error: 'المهمة غير موجودة' }, { status: 404 });
        }

        if (assignment.course?.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('assignments')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'فشل حذف المهمة' }, { status: 500 });
        }

        return NextResponse.json({ message: 'تم حذف المهمة بنجاح' });
    } catch (error) {
        return NextResponse.json({ error: 'فشل حذف المهمة' }, { status: 500 });
    }
}
