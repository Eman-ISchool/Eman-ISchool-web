import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyEnrolledStudents } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
// GET - List materials
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const subjectId = searchParams.get('subjectId');
    const courseId = searchParams.get('courseId');

    let query = supabaseAdmin
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

    // Teachers and admins can view all materials
    if (user.role === 'teacher' || user.role === 'admin') {
        if (lessonId) query = query.eq('lesson_id', lessonId);
        if (subjectId) query = query.eq('subject_id', subjectId);
        if (courseId) query = query.eq('course_id', courseId);
        
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    // Students can only view materials for courses they're enrolled in
    if (user.role === 'student') {
        // Get student's enrolled courses
        const { data: enrollments } = await supabaseAdmin
            .from('enrollments')
            .select('course_id')
            .eq('student_id', user.id)
            .eq('status', 'active');
        
        const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
        
        // If filtering by lessonId, verify student is enrolled in that lesson's course
        if (lessonId) {
            const { data: lesson } = await supabaseAdmin
                .from('lessons')
                .select('course_id')
                .eq('id', lessonId)
                .single();
            
            if (!lesson || !enrolledCourseIds.includes(lesson.course_id)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
        
        // If filtering by courseId, verify student is enrolled
        if (courseId && !enrolledCourseIds.includes(courseId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        // If filtering by subjectId, verify through course enrollment
        if (subjectId) {
            const { data: subject } = await supabaseAdmin
                .from('subjects')
                .select('course_id')
                .eq('id', subjectId)
                .single();
            
            if (!subject || !enrolledCourseIds.includes(subject.course_id)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
        
        // Apply filters
        if (lessonId) query = query.eq('lesson_id', lessonId);
        if (subjectId) query = query.eq('subject_id', subjectId);
        if (courseId) query = query.eq('course_id', courseId);
        
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST - Create material
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    if (user.role !== 'teacher' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, type, fileUrl, lessonId, subjectId, courseId } = body;

        if (!title || !type || !fileUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('materials')
            .insert({
                title,
                type, // file, link, image, video
                file_url: fileUrl,
                lesson_id: lessonId || null,
                subject_id: subjectId || null,
                course_id: courseId || null,
                uploaded_by: user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Notify enrolled students about new material
        if (courseId) {
            await notifyEnrolledStudents(
                courseId,
                'material_uploaded',
                'New Material Available',
                `A new material "${title}" has been uploaded to your course.`,
                `/student/lessons/${lessonId || ''}`
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating material:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
