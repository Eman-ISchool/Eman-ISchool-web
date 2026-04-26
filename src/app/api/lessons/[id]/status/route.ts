import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
// PATCH - Update lesson status (live/completed) and manage meetings
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح. يرجى تسجيل الدخول.' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات معلم أو مدير.' }, { status: 403 });
    }

    try {
        const lessonId = params.id;
        const body = await req.json();
        const { status } = body;

        // Validate status
        if (!status || !['live', 'completed'].includes(status)) {
            return NextResponse.json({
                error: 'الحالة غير صالحة. يجب أن تكون "live" أو "completed"'
            }, { status: 400 });
        }

        // Fetch the lesson to verify ownership
        const { data: lesson, error: fetchError } = await supabaseAdmin
            .from('lessons')
            .select('id, title, teacher_id, course_id, status')
            .eq('id', lessonId)
            .single();

        if (fetchError || !lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        // Verify teacher owns the lesson
        if (currentUser.role !== 'admin' && lesson.teacher_id !== currentUser.id) {
            return NextResponse.json({
                error: 'غير مصرح. يمكنك فقط تغيير حالة دروسك الخاصة.'
            }, { status: 403 });
        }

        // Handle status transitions
        if (status === 'live') {
            // Set lesson to live and create/update meetings record
            const now = new Date().toISOString();

            // Update lesson status
            const { error: updateError } = await supabaseAdmin
                .from('lessons')
                .update({ status: 'live' })
                .eq('id', lessonId);

            if (updateError) {
                console.error('Error updating lesson status:', updateError);
                return NextResponse.json({ error: 'فشل تحديث حالة الدرس' }, { status: 500 });
            }

            // Upsert meetings record
            const { error: meetingError } = await supabaseAdmin
                .from('meetings')
                .upsert({
                    lesson_id: lessonId,
                    status: 'active',
                    started_at: now,
                }, {
                    onConflict: 'lesson_id'
                });

            if (meetingError) {
                console.error('Error creating/updating meeting:', meetingError);
                // Don't fail the request if meeting upsert fails, lesson status is already updated
            }

            return NextResponse.json({
                success: true,
                message: 'تم بدء الدرس بنجاح',
                lesson: { ...lesson, status: 'live' }
            });

        } else if (status === 'completed') {
            // Set lesson to completed and end the meeting
            const now = new Date().toISOString();

            // Update lesson status
            const { error: updateError } = await supabaseAdmin
                .from('lessons')
                .update({ status: 'completed' })
                .eq('id', lessonId);

            if (updateError) {
                console.error('Error updating lesson status:', updateError);
                return NextResponse.json({ error: 'فشل تحديث حالة الدرس' }, { status: 500 });
            }

            // Update meetings record
            const { error: meetingError } = await supabaseAdmin
                .from('meetings')
                .update({
                    status: 'ended',
                    ended_at: now,
                })
                .eq('lesson_id', lessonId);

            if (meetingError) {
                console.error('Error ending meeting:', meetingError);
                // Don't fail the request if meeting update fails, lesson status is already updated
            }

            return NextResponse.json({
                success: true,
                message: 'تم إنهاء الدرس بنجاح',
                lesson: { ...lesson, status: 'completed' }
            });
        }

        return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });

    } catch (error) {
        console.error('Error updating lesson status:', error);
        return NextResponse.json({
            error: 'حدث خطأ أثناء تحديث حالة الدرس. يرجى المحاولة مرة أخرى.'
        }, { status: 500 });
    }
}
