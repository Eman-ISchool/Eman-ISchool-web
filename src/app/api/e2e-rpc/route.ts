import { NextResponse } from 'next/server';
import { generateMeetLink } from '@/lib/google-meet';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
/**
 * E2E RPC endpoint — all operations go through Supabase.
 */

// Execute a Supabase operation; throws on error.
async function trySupabase<T>(operation: () => Promise<{ data: T | null; error: any }>): Promise<T> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    const { data, error } = await operation();
    if (error) {
        throw new Error(`Supabase operation failed: ${error.message}`);
    }
    return data as T;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const currentUser = await getCurrentUser(session);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, payload } = await req.json();

        // ====== COURSES ======
        if (action === 'getCourses') {
            const data = await trySupabase(async () => {
                let query = supabaseAdmin!.from('courses').select('*');
                if (currentUser.role === 'teacher') {
                    query = query.eq('teacher_id', currentUser.id);
                } else if (currentUser.role === 'student') {
                    const { data: enrollments } = await supabaseAdmin!
                        .from('enrollments')
                        .select('course_id')
                        .eq('student_id', currentUser.id)
                        .eq('status', 'active');
                    const courseIds = enrollments?.map((e: any) => e.course_id) || [];
                    if (courseIds.length === 0) return { data: [], error: null };
                    query = query.in('id', courseIds);
                }
                return query.order('created_at', { ascending: false });
            });
            return NextResponse.json(data);
        }

        if (action === 'createCourse') {
            if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
                return NextResponse.json({ error: 'Only teachers can create courses' }, { status: 403 });
            }
            const { title, description } = payload;
            if (!title) {
                return NextResponse.json({ error: 'Title is required' }, { status: 400 });
            }
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

            const data = await trySupabase(() =>
                supabaseAdmin!.from('courses').insert({
                    title, slug,
                    description: description || '',
                    teacher_id: currentUser.id,
                    is_published: true,
                }).select().single()
            );
            return NextResponse.json(data);
        }

        // ====== LESSONS (Sessions) ======
        if (action === 'getLessons') {
            const { courseId } = payload || {};

            const data = await trySupabase(async () => {
                let query = supabaseAdmin!.from('lessons').select('*')
                    .order('start_date_time', { ascending: true });
                if (courseId) query = query.eq('course_id', courseId);
                if (currentUser.role === 'teacher') query = query.eq('teacher_id', currentUser.id);
                return query;
            });
            return NextResponse.json(data);
        }

        if (action === 'createLesson') {
            if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
                return NextResponse.json({ error: 'Only teachers can create lessons' }, { status: 403 });
            }
            const { title, courseId, meetLink: providedMeetLink } = payload;
            if (!title) {
                return NextResponse.json({ error: 'Title is required' }, { status: 400 });
            }

            const startTime = new Date();
            startTime.setHours(startTime.getHours() + 1);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            // Auto-generate meet link
            let meetLink = providedMeetLink || '';
            let googleEventId = '';
            if (!meetLink) {
                try {
                    const meetResult = await generateMeetLink({
                        summary: title,
                        description: 'Eduverse Live Session',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    });
                    meetLink = meetResult.meetLink;
                    googleEventId = meetResult.google_event_id;
                } catch (e: any) {
                    console.error('Meet link generation failed:', e.message);
                    return NextResponse.json({ error: 'Failed to generate Meet link: ' + e.message }, { status: 500 });
                }
            }
            if (!meetLink) {
                return NextResponse.json({ error: 'Generated meet link was empty' }, { status: 500 });
            }

            const data = await trySupabase(() =>
                supabaseAdmin!.from('lessons').insert({
                    title, description: '',
                    start_date_time: startTime.toISOString(),
                    end_date_time: endTime.toISOString(),
                    meet_link: meetLink,
                    google_event_id: googleEventId || null,
                    status: 'scheduled',
                    course_id: courseId || null,
                    teacher_id: currentUser.id,
                }).select().single()
            );
            return NextResponse.json(data);
        }

        // ====== ENROLLMENTS ======
        if (action === 'enrollStudent') {
            if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
                return NextResponse.json({ error: 'Only teachers can enroll students' }, { status: 403 });
            }
            const { courseId, studentEmail } = payload;
            if (!courseId || !studentEmail) {
                return NextResponse.json({ error: 'courseId and studentEmail are required' }, { status: 400 });
            }

            // Find student by email in Supabase
            const student = await trySupabase(() =>
                supabaseAdmin!.from('users')
                    .select('id')
                    .eq('email', studentEmail)
                    .single()
            );

            const studentId = (student as any).id;

            // Check existing enrollment
            const existingEnrollments = await trySupabase(() =>
                supabaseAdmin!.from('enrollments')
                    .select('*')
                    .eq('course_id', courseId)
                    .eq('student_id', studentId)
            );

            if (Array.isArray(existingEnrollments) && existingEnrollments.length > 0) {
                return NextResponse.json({ message: 'Already enrolled', enrollment: existingEnrollments[0] });
            }

            const enrollment = await trySupabase(() =>
                supabaseAdmin!.from('enrollments')
                    .insert({
                        course_id: courseId,
                        student_id: studentId,
                        status: 'active',
                    })
                    .select()
                    .single()
            );
            return NextResponse.json(enrollment);
        }

        if (action === 'getEnrollments') {
            const { courseId } = payload || {};
            const data = await trySupabase(async () => {
                let query = supabaseAdmin!.from('enrollments')
                    .select('*')
                    .eq('status', 'active');
                if (courseId) query = query.eq('course_id', courseId);
                if (currentUser.role === 'student') query = query.eq('student_id', currentUser.id);
                return query;
            });
            return NextResponse.json(data);
        }

        // ====== LEGACY SUPPORT ======
        if (action === 'getGrades') {
            const data = await trySupabase(() => supabaseAdmin!.from('grades').select('*'));
            return NextResponse.json(data);
        }
        if (action === 'createGrade') {
            const data = await trySupabase(() =>
                supabaseAdmin!.from('grades').insert({ name: payload.name }).select().single()
            );
            return NextResponse.json(data);
        }
        if (action === 'getClasses') {
            const data = await trySupabase(() => supabaseAdmin!.from('classes').select('*'));
            return NextResponse.json(data);
        }
        if (action === 'createClass') {
            const data = await trySupabase(() =>
                supabaseAdmin!.from('classes').insert({ name: payload.name }).select().single()
            );
            return NextResponse.json(data);
        }
        if (action === 'getSubjects') {
            const data = await trySupabase(() => supabaseAdmin!.from('subjects').select('*'));
            return NextResponse.json(data);
        }
        if (action === 'createSubject') {
            const data = await trySupabase(() =>
                supabaseAdmin!.from('subjects').insert({ title: payload.title }).select().single()
            );
            return NextResponse.json(data);
        }
        if (action === 'getSessions') {
            const data = await trySupabase(() =>
                supabaseAdmin!.from('lessons').select('id, title, meet_link, google_event_id')
                    .eq('teacher_id', currentUser.id)
            );
            return NextResponse.json(data);
        }
        if (action === 'createSession') {
            const { title, meetLink: manualMeetLink } = payload;
            const startTime = new Date();
            startTime.setHours(startTime.getHours() + 1);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            let meetLink = manualMeetLink || '';
            let googleEventId = '';
            if (!meetLink) {
                try {
                    const meetResult = await generateMeetLink({
                        summary: title || 'Live Session',
                        description: 'Created by Eduverse',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    });
                    meetLink = meetResult.meetLink;
                    googleEventId = meetResult.google_event_id;
                } catch (e: any) {
                    return NextResponse.json({ error: 'Failed to generate Meet link' }, { status: 500 });
                }
            }
            if (!meetLink) return NextResponse.json({ error: 'Empty meet link' }, { status: 500 });
            const data = await trySupabase(() =>
                supabaseAdmin!.from('lessons').insert({
                    title, description: '',
                    start_date_time: startTime.toISOString(),
                    end_date_time: endTime.toISOString(),
                    meet_link: meetLink,
                    google_event_id: googleEventId || null,
                    status: 'scheduled',
                    teacher_id: currentUser.id,
                }).select().single()
            );
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error: any) {
        console.error('E2E RPC error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
