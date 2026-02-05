import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createGoogleMeet } from '@/lib/meet';
import { getValidGoogleToken } from '@/lib/google-token';

// GET - Fetch lessons with filters
export async function GET(req: Request) {
    try {
        // Check if Supabase is configured
        if (!supabaseAdmin) {
            console.warn('Supabase admin client not configured');
            return NextResponse.json([]);
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const upcoming = searchParams.get('upcoming');
        const courseId = searchParams.get('courseId');
        const teacherId = searchParams.get('teacherId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('lessons')
            .select(`
                *,
                course:courses(id, title, slug),
                teacher:users!lessons_teacher_id_fkey(id, name, email, image)
            `)
            .order('start_date_time', { ascending: true });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (upcoming === 'true') {
            query = query.gte('end_date_time', new Date().toISOString());
        }

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        // Apply pagination after filters
        if (limit) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data: lessons, error } = await query;

        if (error) {
            console.error('Supabase Error fetching lessons:', error);
            // Return empty array instead of error to prevent crashing frontend
            return NextResponse.json([]);
        }

        // Transform data to match expected frontend format
        const transformedLessons = lessons?.map(lesson => ({
            _id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            startDateTime: lesson.start_date_time,
            endDateTime: lesson.end_date_time,
            meetLink: lesson.meet_link,
            status: lesson.status,
            course: lesson.course,
            teacher: lesson.teacher,
            googleEventId: lesson.google_event_id,
            googleCalendarLink: lesson.google_calendar_link,
        })) || [];

        return NextResponse.json(transformedLessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'فشل جلب الدروس' }, { status: 500 });
    }
}

// POST - Create a new lesson
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح. يرجى تسجيل الدخول.' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات معلم أو مدير.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, description, startDateTime, endDateTime, courseId, skipMeetGeneration, status: requestedStatus } = body;

        // Validate required fields
        if (!title || !startDateTime || !endDateTime) {
            return NextResponse.json({
                error: 'يرجى ملء جميع الحقول المطلوبة (العنوان، وقت البدء، وقت الانتهاء)'
            }, { status: 400 });
        }

        // Validate dates
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const now = new Date();
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'تنسيق التاريخ غير صالح' }, { status: 400 });
        }
        if (end <= start) {
            return NextResponse.json({ error: 'وقت الانتهاء يجب أن يكون بعد وقت البدء' }, { status: 400 });
        }

        // T006: Past session detection - set status to "completed" when start time is in past
        const isPastSession = start < now;
        const lessonStatus = requestedStatus || (isPastSession ? 'completed' : 'scheduled');

        // T005: Handle skipMeetGeneration flag (FR-019)
        const shouldGenerateMeet = !skipMeetGeneration && !isPastSession;

        let meetLink: string | null = null;
        let googleEventId: string | null = null;
        let googleCalendarLink: string | null = null;

        if (shouldGenerateMeet) {
            // Get valid Google token (from database, with auto-refresh)
            const tokenResult = await getValidGoogleToken(currentUser.id);

            if (!tokenResult.success || !tokenResult.accessToken) {
                // No valid Google token - require Google connection
                return NextResponse.json({
                    error: tokenResult.error || 'يجب ربط حساب Google لإنشاء رابط Meet. يرجى تسجيل الدخول باستخدام Google.',
                    requiresGoogleAuth: true,
                    code: 'GOOGLE_AUTH_REQUIRED'
                }, { status: 403 });
            }

            // Create Google Meet event using stored token
            const meetResult = await createGoogleMeet(tokenResult.accessToken, {
                summary: title,
                description: description || `درس: ${title}`,
                startTime: startDateTime,
                endTime: endDateTime,
            });

            if (!meetResult.success) {
                // Meet creation failed - check if re-auth needed
                if (meetResult.requiresReauth) {
                    return NextResponse.json({
                        error: 'انتهت صلاحية ربط Google. يرجى إعادة تسجيل الدخول باستخدام Google.',
                        requiresGoogleAuth: true,
                        code: 'GOOGLE_REAUTH_REQUIRED'
                    }, { status: 403 });
                }

                return NextResponse.json({
                    error: `فشل إنشاء رابط Meet: ${meetResult.error}`,
                }, { status: 500 });
            }

            meetLink = meetResult.meetLink || null;
            googleEventId = meetResult.eventId || null;
            googleCalendarLink = meetResult.htmlLink || null;
        }

        // Insert lesson into Supabase with or without Google Meet link
        const { data: lesson, error: insertError } = await supabaseAdmin
            .from('lessons')
            .insert({
                title,
                description: description || '',
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                meet_link: meetLink,
                google_event_id: googleEventId,
                google_calendar_link: googleCalendarLink,
                status: lessonStatus,
                course_id: courseId || null,
                teacher_id: currentUser.id,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating lesson:', insertError);
            return NextResponse.json({ error: 'فشل إنشاء الدرس' }, { status: 500 });
        }

        if (shouldGenerateMeet) {
            // Log the meeting creation only if we tried to generate meeting
            await supabaseAdmin.from('meeting_logs').insert({
                lesson_id: lesson.id,
                event_type: 'scheduled',
                user_id: currentUser.id,
                metadata: {
                    meet_link: meetLink,
                    google_event_id: googleEventId,
                },
            });
        }

        return NextResponse.json({
            _id: lesson.id,
            ...lesson,
            meetLink: meetLink,
            message: shouldGenerateMeet ? 'تم إنشاء الدرس بنجاح مع رابط Google Meet' : 'تم إنشاء الدرس بنجاح',
        });
    } catch (error: any) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({
            error: 'حدث خطأ أثناء إنشاء الدرس. يرجى المحاولة مرة أخرى.'
        }, { status: 500 });
    }
}

// PATCH - Update a lesson
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
            return NextResponse.json({ error: 'معرف الدرس مطلوب' }, { status: 400 });
        }

        // Map frontend field names to database field names
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.startDateTime) dbUpdates.start_date_time = updates.startDateTime;
        if (updates.endDateTime) dbUpdates.end_date_time = updates.endDateTime;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.meetLink) dbUpdates.meet_link = updates.meetLink;

        const { data: lesson, error } = await supabaseAdmin
            .from('lessons')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating lesson:', error);
            return NextResponse.json({ error: 'فشل تحديث الدرس' }, { status: 500 });
        }

        return NextResponse.json({
            _id: lesson.id,
            ...lesson,
            message: 'تم تحديث الدرس بنجاح',
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'فشل تحديث الدرس' }, { status: 500 });
    }
}

// DELETE - Delete a lesson
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
            return NextResponse.json({ error: 'معرف الدرس مطلوب' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('lessons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting lesson:', error);
            return NextResponse.json({ error: 'فشل حذف الدرس' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'تم حذف الدرس بنجاح' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'فشل حذف الدرس' }, { status: 500 });
    }
}
