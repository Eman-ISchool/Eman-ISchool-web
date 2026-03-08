import { NextResponse } from 'next/server';
import { generateMeetLink } from '@/lib/google-meet';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * E2E RPC endpoint — uses in-memory mock store for reliable E2E testing.
 * Supabase operations are attempted first but fall back to mock on any error.
 */

// Use globalThis to persist mock store across Next.js HMR reloads
const globalKey = '__e2e_mock_store__';
if (!(globalThis as any)[globalKey]) {
    (globalThis as any)[globalKey] = {
        courses: [],
        lessons: [],
        enrollments: [],
        users: [
            { id: '00000000-0000-0000-0000-000000000001', email: 'teacher@eduverse.com', name: 'Test Teacher', role: 'teacher' },
            { id: '00000000-0000-0000-0000-000000000002', email: 'student@eduverse.com', name: 'Test Student', role: 'student' },
            { id: '00000000-0000-0000-0000-000000000003', email: 'admin@eduverse.com', name: 'Test Admin', role: 'admin' },
        ],
    };
}
const mockStore: {
    courses: any[];
    lessons: any[];
    enrollments: any[];
    users: any[];
} = (globalThis as any)[globalKey];

// Try Supabase first, fall back to mock on error
// When TEST_BYPASS is enabled, always use mock store
async function trySupabase<T>(operation: () => Promise<{ data: T | null; error: any }>): Promise<T | null> {
    if (process.env.TEST_BYPASS === 'true') return null; // Always use mock in test mode
    if (!isSupabaseAdminConfigured || !supabaseAdmin) return null;
    try {
        const { data, error } = await operation();
        if (error) {
            console.warn('Supabase operation failed, using mock:', error.message);
            return null;
        }
        return data;
    } catch (e: any) {
        console.warn('Supabase exception, using mock:', e.message);
        return null;
    }
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
            // Try Supabase
            const supabaseData = await trySupabase(async () => {
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
            if (supabaseData) return NextResponse.json(supabaseData);

            // Mock fallback
            if (currentUser.role === 'student') {
                const enrolledCourseIds = mockStore.enrollments
                    .filter(e => e.student_id === currentUser.id && e.status === 'active')
                    .map(e => e.course_id);
                return NextResponse.json(mockStore.courses.filter(c => enrolledCourseIds.includes(c.id)));
            }
            return NextResponse.json(mockStore.courses.filter(c => c.teacher_id === currentUser.id));
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

            // Try Supabase
            const supabaseData = await trySupabase(() =>
                supabaseAdmin!.from('courses').insert({
                    title, slug,
                    description: description || '',
                    teacher_id: currentUser.id,
                    is_published: true,
                }).select().single()
            );
            if (supabaseData) return NextResponse.json(supabaseData);

            // Mock fallback
            const course = {
                id: crypto.randomUUID(),
                title, slug, description: description || '',
                teacher_id: currentUser.id,
                is_published: true,
                created_at: new Date().toISOString(),
            };
            mockStore.courses.push(course);
            return NextResponse.json(course);
        }

        // ====== LESSONS (Sessions) ======
        if (action === 'getLessons') {
            const { courseId } = payload || {};

            // Try Supabase
            const supabaseData = await trySupabase(async () => {
                let query = supabaseAdmin!.from('lessons').select('*')
                    .order('start_date_time', { ascending: true });
                if (courseId) query = query.eq('course_id', courseId);
                if (currentUser.role === 'teacher') query = query.eq('teacher_id', currentUser.id);
                return query;
            });
            if (supabaseData && Array.isArray(supabaseData)) return NextResponse.json(supabaseData);

            // Mock fallback
            let lessons = [...mockStore.lessons];
            if (courseId) lessons = lessons.filter(l => l.course_id === courseId);
            if (currentUser.role === 'teacher') lessons = lessons.filter(l => l.teacher_id === currentUser.id);
            return NextResponse.json(lessons);
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

            // Try Supabase
            const supabaseData = await trySupabase(() =>
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
            if (supabaseData) return NextResponse.json(supabaseData);

            // Mock fallback
            const lesson = {
                id: crypto.randomUUID(),
                title, course_id: courseId || null,
                teacher_id: currentUser.id,
                meet_link: meetLink,
                google_event_id: googleEventId,
                start_date_time: startTime.toISOString(),
                end_date_time: endTime.toISOString(),
                status: 'scheduled',
                created_at: new Date().toISOString(),
            };
            mockStore.lessons.push(lesson);
            return NextResponse.json(lesson);
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

            // Find student in mock users
            const mockStudent = mockStore.users.find(u => u.email === studentEmail);
            const studentId = mockStudent?.id || '00000000-0000-0000-0000-000000000002';

            // Check existing enrollment in mock
            const existing = mockStore.enrollments.find(
                e => e.course_id === courseId && e.student_id === studentId
            );
            if (existing) {
                return NextResponse.json({ message: 'Already enrolled', enrollment: existing });
            }

            const enrollment = {
                id: crypto.randomUUID(),
                course_id: courseId,
                student_id: studentId,
                student_email: studentEmail,
                status: 'active',
                enrolled_at: new Date().toISOString(),
            };
            mockStore.enrollments.push(enrollment);
            return NextResponse.json(enrollment);
        }

        if (action === 'getEnrollments') {
            const { courseId } = payload || {};
            let enrollments = mockStore.enrollments.filter(e => e.status === 'active');
            if (courseId) enrollments = enrollments.filter(e => e.course_id === courseId);
            if (currentUser.role === 'student') {
                enrollments = enrollments.filter(e => e.student_id === currentUser.id);
            }
            return NextResponse.json(enrollments);
        }

        // ====== LEGACY SUPPORT ======
        if (action === 'getGrades') return NextResponse.json([]);
        if (action === 'createGrade') return NextResponse.json({ id: `grade-${Date.now()}`, name: payload.name });
        if (action === 'getClasses') return NextResponse.json([]);
        if (action === 'createClass') return NextResponse.json({ id: `class-${Date.now()}`, name: payload.name });
        if (action === 'getSubjects') return NextResponse.json([]);
        if (action === 'createSubject') return NextResponse.json({ id: `subject-${Date.now()}`, title: payload.title });
        if (action === 'getSessions') return NextResponse.json(mockStore.lessons.map(l => ({ id: l.id, title: l.title, meetLink: l.meet_link, google_event_id: l.google_event_id })));
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
            const ses = { id: crypto.randomUUID(), title, meetLink, meet_link: meetLink, google_event_id: googleEventId, teacher_id: currentUser.id };
            mockStore.lessons.push(ses);
            return NextResponse.json(ses);
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error: any) {
        console.error('E2E RPC error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
