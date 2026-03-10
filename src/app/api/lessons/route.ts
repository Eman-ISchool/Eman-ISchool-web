import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyEnrolledStudents } from '@/lib/notifications';
import { generateMeetLink, toGoogleMeetApiError } from '@/lib/google-meet';

// GET - Fetch lessons with filters
export async function GET(req: Request) {
    try {
        if (process.env.TEST_BYPASS === 'true') {
            const { getMockDb } = require('@/lib/mockDb');
            const db = getMockDb();
            // Optionally apply some filters if needed, but for E2E just returning everything is fine
            return NextResponse.json(db.lessons || []);
        }

        // Check if Supabase is configured
        if (!supabaseAdmin) {
            console.warn('Supabase admin client not configured');
            return NextResponse.json([]);
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const upcoming = searchParams.get('upcoming');
        const courseId = searchParams.get('courseId');
        const subjectId = searchParams.get('subjectId');
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

        if (subjectId) {
            query = query.eq('subject_id', subjectId);
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

        // T020: Add meeting metadata to SELECT and check enrollment for students
        // Fetch current user for enrollment check
        const session = await getServerSession(authOptions);
        const currentUser = session ? await getCurrentUser(session) : null;
        const isStudent = currentUser && currentUser.role === 'student';
        let enrollmentChecked = false;
        let isEnrolled = false;

        // Check enrollment if caller is a student
        if (isStudent && courseId) {
            const { data: enrollment, error: enrollmentError } = await supabaseAdmin
                .from('enrollments')
                .select('id')
                .eq('course_id', courseId)
                .eq('student_id', currentUser.id)
                .eq('status', 'active')
                .single();

            if (!enrollmentError && enrollment) {
                isEnrolled = true;
            }
            enrollmentChecked = true;
        }

        // Transform data to match expected frontend format
        if (isStudent && courseId && enrollmentChecked && !isEnrolled) {
            return NextResponse.json({
                error: 'You are not enrolled in this course'
            }, { status: 403 });
        }

        const transformedLessons = lessons?.map(lesson => {
            const lessonData: any = {
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
            };

            // Add meeting metadata fields
            lessonData.meetingTitle = lesson.meeting_title;
            lessonData.meetingProvider = lesson.meeting_provider;
            lessonData.meetingDurationMin = lesson.meeting_duration_min;

            // Hide meeting data from unenrolled students for general lesson queries
            if (isStudent && !isEnrolled) {
                lessonData.meetLink = null;
                lessonData.meetingTitle = null;
                lessonData.meetingProvider = null;
                lessonData.meetingDurationMin = null;
            }

            return lessonData;
        }) || [];

        return NextResponse.json(transformedLessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

// POST - Create a new lesson
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || (!isTeacherOrAdmin(currentUser.role) && !isAdmin(currentUser.role))) {
        return NextResponse.json({ error: 'Forbidden. Supervisors cannot create new lessons.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, description, startDateTime, endDateTime, courseId, subjectId, status: requestedStatus } = body;
        const providedMeetLink = String(body.meetLink || body.meet_link || '').trim();

        // Validate required fields
        if (!title || !startDateTime || !endDateTime) {
            return NextResponse.json({
                error: 'Please fill in all required fields (title, start time, end time)'
            }, { status: 400 });
        }

        // Validate dates
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const now = new Date();
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }
        if (end <= start) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        if (!courseId) {
            return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
        }

        let course: any = null;
        if (process.env.TEST_BYPASS === 'true') {
            const { getMockDb } = require('@/lib/mockDb');
            const db = getMockDb();
            const mockCourses = Array.isArray(db.courses) ? db.courses : [];
            course = mockCourses.find((candidate: any) => candidate.id === courseId);
            if (!course) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            if (currentUser.role === 'teacher' && course.teacher_id !== currentUser.id) {
                return NextResponse.json({ error: 'Forbidden. You can only create lessons for your own courses.' }, { status: 403 });
            }
        } else {
            const { data: dbCourse, error: courseError } = await supabaseAdmin
                .from('courses')
                .select('id, teacher_id')
                .eq('id', courseId)
                .single();

            if (courseError || !dbCourse) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            if (currentUser.role === 'teacher' && dbCourse.teacher_id !== currentUser.id) {
                return NextResponse.json({ error: 'Forbidden. You can only create lessons for your own courses.' }, { status: 403 });
            }
            course = dbCourse;

            // T026: Schedule conflict validation
            const { data: overlappingLessons, error: overlapError } = await supabaseAdmin
                .from('lessons')
                .select('id, title')
                .eq('teacher_id', currentUser.id)
                .neq('status', 'cancelled')
                // Overlap condition: existing.start < new.end AND existing.end > new.start
                .or(`and(start_date_time.lt.${endDateTime},end_date_time.gt.${startDateTime})`)
                .limit(1);

            if (!overlapError && overlappingLessons && overlappingLessons.length > 0) {
                return NextResponse.json({
                    error: `Schedule conflict: You already have a lesson ("${overlappingLessons[0].title}") scheduled during this time.`
                }, { status: 409 });
            }
        }

        // T006: Past session detection - set status to "completed" when start time is in past
        const isPastSession = start < now;
        const lessonStatus = requestedStatus || (isPastSession ? 'completed' : 'scheduled');

        // Auto-generate Google Meet link if none provided.
        // The link must come from Google Calendar conferenceData flow.
        const allowManualMeet = process.env.TEST_BYPASS === 'true' || process.env.ALLOW_MANUAL_MEET_LINK === 'true';
        let meetLink = providedMeetLink && providedMeetLink.startsWith('https://meet.google.com/') && allowManualMeet
            ? providedMeetLink
            : '';
        let googleEventId = '';
        if (!meetLink) {
            try {
                const meetResult = await generateMeetLink({
                    summary: title,
                    description: description || 'Eduverse Live Session',
                    startTime: startDateTime,
                    endTime: endDateTime,
                });
                meetLink = meetResult.meetLink;
                googleEventId = meetResult.google_event_id;
            } catch (meetError: any) {
                const googleError = toGoogleMeetApiError(meetError);
                console.error('Meet link generation failed:', googleError.detail);
                return NextResponse.json({
                    error: googleError.error,
                    code: googleError.code,
                    detail: googleError.detail,
                }, { status: googleError.status });
            }
        }

        if (process.env.TEST_BYPASS === 'true') {
            const { getMockDb, saveMockDb } = require('@/lib/mockDb');
            const db = getMockDb();
            if (!db.lessons) db.lessons = [];
            if (!db.lesson_meetings) db.lesson_meetings = [];

            const newLesson = {
                id: `lesson-${Date.now()}`,
                title,
                description: description || '',
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                meet_link: meetLink || null,
                google_event_id: googleEventId || null,
                status: lessonStatus,
                course_id: courseId || null,
                subject_id: subjectId || null,
                teacher_id: currentUser.id,
                _id: `lesson-${Date.now()}`,
                message: 'Lesson created successfully'
            };
            db.lessons.push(newLesson);
            db.lesson_meetings.push({
                lesson_id: newLesson.id,
                provider: 'google_calendar',
                meet_url: meetLink,
                event_id: googleEventId || null,
                created_by_teacher_id: currentUser.id,
                status: 'active',
            });
            saveMockDb(db);
            return NextResponse.json(newLesson);
        }

        // Insert lesson into Supabase
        const { data: lesson, error: insertError } = await supabaseAdmin
            .from('lessons')
            .insert({
                title,
                description: description || '',
                start_date_time: startDateTime,
                end_date_time: endDateTime,
                meet_link: meetLink || null,
                google_event_id: googleEventId || null,
                status: lessonStatus,
                course_id: courseId || null,
                subject_id: subjectId || null,
                teacher_id: currentUser.id,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating lesson:', insertError);
            return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
        }

        // Persist canonical meeting row. If this fails, rollback lesson insert.
        const { error: meetingError } = await supabaseAdmin
            .from('lesson_meetings')
            .upsert({
                lesson_id: lesson.id,
                provider: 'google_calendar',
                meet_url: meetLink,
                event_id: googleEventId || null,
                created_by_teacher_id: currentUser.id,
                status: 'active',
            }, { onConflict: 'lesson_id' });

        if (meetingError) {
            await supabaseAdmin.from('lessons').delete().eq('id', lesson.id);
            console.error('Error persisting lesson_meetings row:', meetingError);
            return NextResponse.json({
                error: 'Google Meet persistence failed. Lesson was not created.',
                code: 'GOOGLE_CALENDAR_ERROR',
            }, { status: 503 });
        }

        return NextResponse.json({
            _id: lesson.id,
            ...lesson,
            message: 'Lesson created successfully',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({
            error: 'An error occurred while creating the lesson. Please try again.'
        }, { status: 500 });
    }
}

// PATCH - Update a lesson
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
        }

        // T017: Verify ownership before update - fetch lesson first
        const { data: existingLesson, error: fetchError } = await supabaseAdmin
            .from('lessons')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check ownership: only owning teacher, admin, or supervisor can update
        if (existingLesson.teacher_id !== currentUser.id && !isAdmin(currentUser.role) && currentUser.role !== 'supervisor') {
            return NextResponse.json({ error: 'Forbidden. You can only edit your own lessons.' }, { status: 403 });
        }

        // Map frontend field names to database field names
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.startDateTime) dbUpdates.start_date_time = updates.startDateTime;
        if (updates.endDateTime) dbUpdates.end_date_time = updates.endDateTime;
        if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.meetLink !== undefined) dbUpdates.meet_link = updates.meetLink;

        // T019: Add meeting metadata fields
        if (updates.meetingTitle !== undefined) dbUpdates.meeting_title = updates.meetingTitle;
        if (updates.meetingProvider !== undefined) dbUpdates.meeting_provider = updates.meetingProvider;
        if (updates.meetingDurationMin !== undefined) dbUpdates.meeting_duration_min = updates.meetingDurationMin;

        // T019: Validate meetLink starts with https:// when provided
        if (updates.meetLink !== undefined && !updates.meetLink.startsWith('https://')) {
            return NextResponse.json({ error: 'Meet link must start with https://' }, { status: 400 });
        }

        const { data: lesson, error } = await supabaseAdmin
            .from('lessons')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating lesson:', error);
            return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
        }

        // T055: Notify enrolled students when Meet link changes
        if (updates.meetLink !== undefined && updates.meetLink !== (lesson.meet_link || '')) {
            await notifyEnrolledStudents(
                lesson.course_id,
                'class_reminder',
                'Meet Link Updated',
                `The Meet link for lesson "${lesson.title}" has been updated.`,
                `/student/lessons/${id}`
            );
        }

        return NextResponse.json({
            _id: lesson.id,
            ...lesson,
            message: 'Lesson updated successfully',
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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || (!isTeacherOrAdmin(currentUser.role) && !isAdmin(currentUser.role))) {
        return NextResponse.json({ error: 'Forbidden. Supervisors cannot delete lessons.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
        }

        // T018: Verify ownership before delete - fetch lesson first
        const { data: existingLesson, error: fetchError } = await supabaseAdmin
            .from('lessons')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check ownership: only owning teacher or admin can delete
        if (existingLesson.teacher_id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden. You can only delete your own lessons.' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('lessons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting lesson:', error);
            return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}
