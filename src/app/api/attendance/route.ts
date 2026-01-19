import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch attendance records
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
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get('lessonId');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('attendance')
            .select(`
                *,
                lesson:lessons(id, title, start_date_time, end_date_time, status),
                user:users(id, name, email, image, role)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (lessonId) {
            query = query.eq('lesson_id', lessonId);
        }

        // Students can only see their own attendance
        if (currentUser.role === 'student') {
            query = query.eq('user_id', currentUser.id);
        } else if (userId) {
            query = query.eq('user_id', userId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: attendance, error, count } = await query;

        if (error) {
            console.error('Error fetching attendance:', error);
            return NextResponse.json({ error: 'فشل جلب سجلات الحضور' }, { status: 500 });
        }

        return NextResponse.json({ attendance, total: count });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'فشل جلب سجلات الحضور' }, { status: 500 });
    }
}

// POST - Record attendance (join meeting)
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
        const { lessonId, action } = body;

        if (!lessonId) {
            return NextResponse.json({ error: 'معرف الدرس مطلوب' }, { status: 400 });
        }

        // Get the lesson to check timing
        const { data: lesson } = await supabaseAdmin
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        const now = new Date();
        const startTime = new Date(lesson.start_date_time);
        const endTime = new Date(lesson.end_date_time);

        // Determine attendance status
        let attendanceStatus: 'present' | 'late' | 'early_exit' | 'absent' = 'present';

        if (action === 'join') {
            // Check if joining late (more than 10 minutes after start)
            const lateThreshold = 10 * 60 * 1000; // 10 minutes
            if (now.getTime() > startTime.getTime() + lateThreshold) {
                attendanceStatus = 'late';
            }
        } else if (action === 'leave') {
            // Check if leaving early (more than 10 minutes before end)
            const earlyThreshold = 10 * 60 * 1000; // 10 minutes
            if (now.getTime() < endTime.getTime() - earlyThreshold) {
                attendanceStatus = 'early_exit';
            }
        }

        // Check if attendance record exists
        const { data: existing } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('user_id', currentUser.id)
            .single();

        let attendance;

        if (action === 'join') {
            if (existing) {
                // Update existing record
                const { data, error } = await supabaseAdmin
                    .from('attendance')
                    .update({
                        joined_at: now.toISOString(),
                        status: attendanceStatus,
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                attendance = data;
            } else {
                // Create new record
                const { data, error } = await supabaseAdmin
                    .from('attendance')
                    .insert({
                        lesson_id: lessonId,
                        user_id: currentUser.id,
                        joined_at: now.toISOString(),
                        status: attendanceStatus,
                        is_teacher: currentUser.role === 'teacher',
                    })
                    .select()
                    .single();

                if (error) throw error;
                attendance = data;
            }

            // Log the join event
            await supabaseAdmin.from('meeting_logs').insert({
                lesson_id: lessonId,
                event_type: 'participant_joined',
                user_id: currentUser.id,
                metadata: {
                    status: attendanceStatus,
                    is_teacher: currentUser.role === 'teacher',
                },
            });
        } else if (action === 'leave') {
            if (!existing) {
                return NextResponse.json({ error: 'لا يوجد سجل حضور' }, { status: 400 });
            }

            // Update with leave time
            const { data, error } = await supabaseAdmin
                .from('attendance')
                .update({
                    left_at: now.toISOString(),
                    status: attendanceStatus === 'early_exit' ? 'early_exit' : existing.status,
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            attendance = data;

            // Log the leave event
            await supabaseAdmin.from('meeting_logs').insert({
                lesson_id: lessonId,
                event_type: 'participant_left',
                user_id: currentUser.id,
                metadata: {
                    duration_minutes: attendance.duration_minutes,
                    status: attendance.status,
                },
            });
        }

        return NextResponse.json({
            attendance,
            message: action === 'join' ? 'تم تسجيل الحضور' : 'تم تسجيل المغادرة',
        });
    } catch (error) {
        console.error('Error recording attendance:', error);
        return NextResponse.json({ error: 'فشل تسجيل الحضور' }, { status: 500 });
    }
}

// PATCH - Update attendance status (Teacher/Admin only)
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
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف سجل الحضور مطلوب' }, { status: 400 });
        }

        const updates: any = {};
        if (status) updates.status = status;
        if (notes !== undefined) updates.notes = notes;

        const { data: attendance, error } = await supabaseAdmin
            .from('attendance')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating attendance:', error);
            return NextResponse.json({ error: 'فشل تحديث الحضور' }, { status: 500 });
        }

        return NextResponse.json({ attendance, message: 'تم تحديث سجل الحضور' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json({ error: 'فشل تحديث الحضور' }, { status: 500 });
    }
}

// DELETE - Delete attendance record (Admin only)
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'معرف سجل الحضور مطلوب' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('attendance')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting attendance:', error);
            return NextResponse.json({ error: 'فشل حذف سجل الحضور' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'تم حذف سجل الحضور' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json({ error: 'فشل حذف سجل الحضور' }, { status: 500 });
    }
}
