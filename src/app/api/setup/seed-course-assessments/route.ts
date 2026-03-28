import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No admin' }, { status: 500 });

    const log: string[] = [];
    const errors: string[] = [];

    // Get all courses with their teacher_id
    const { data: courses } = await supabaseAdmin.from('courses').select('id, teacher_id, title').limit(300);
    if (!courses || courses.length === 0) return NextResponse.json({ error: 'No courses found' });
    log.push(`Found ${courses.length} courses`);

    // Check which courses already have assessments
    const { data: existingAssessments } = await supabaseAdmin
        .from('assessments').select('course_id').not('course_id', 'is', null);
    const coursesWithAssessments = new Set((existingAssessments || []).map((a: any) => a.course_id));

    const coursesNeedingAssessments = courses.filter((c: any) => !coursesWithAssessments.has(c.id));
    log.push(`Courses needing assessments: ${coursesNeedingAssessments.length}`);

    // Get some student IDs for submissions
    const { data: students } = await supabaseAdmin.from('users').select('id').eq('role', 'student').limit(15);
    const studentIds = (students || []).map((s: any) => s.id);

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Create assessments for each course that doesn't have any
    let aCount = 0, qCount = 0, sCount = 0;
    for (const course of coursesNeedingAssessments) {
        const tid = course.teacher_id;
        if (!tid) continue;

        // Create 2-4 assessments per course
        const assessmentRows = [
            { title: `اختبار منتصف الفصل - ${course.title}`, assessment_type: 'exam', duration_minutes: 60 },
            { title: `واجب الوحدة الأولى - ${course.title}`, assessment_type: 'quiz', duration_minutes: 20 },
            { title: `اختبار نهاية الفصل - ${course.title}`, assessment_type: 'exam', duration_minutes: 90 },
            { title: `واجب المراجعة - ${course.title}`, assessment_type: 'quiz', duration_minutes: 15 },
        ].map(a => ({
            ...a,
            teacher_id: tid,
            course_id: course.id,
            short_description: `${a.title} - وصف`,
            is_published: true,
            attempt_limit: a.assessment_type === 'quiz' ? 3 : 1,
        }));

        const { data: aD, error: aE } = await supabaseAdmin.from('assessments').insert(assessmentRows).select('id');
        if (aE) { errors.push(`assessments for ${course.id}: ${aE.message}`); continue; }
        if (!aD) continue;
        aCount += aD.length;

        // Create questions for each assessment
        const qBatch: any[] = [];
        for (const a of aD) {
            qBatch.push(
                { assessment_id: a.id, question_type: 'multiple_choice', question_text: 'ما هو الحرف الأول في الأبجدية؟', is_mandatory: true, options_json: [{ id: '1', text: 'ألف', is_correct: true }, { id: '2', text: 'باء', is_correct: false }], points: 10, sort_order: 1 },
                { assessment_id: a.id, question_type: 'multiple_choice', question_text: 'كم عدد سور القرآن؟', is_mandatory: true, options_json: [{ id: '1', text: '100', is_correct: false }, { id: '2', text: '114', is_correct: true }], points: 10, sort_order: 2 },
                { assessment_id: a.id, question_type: 'multiple_choice', question_text: 'ما ناتج 7 × 8؟', is_mandatory: true, options_json: [{ id: '1', text: '54', is_correct: false }, { id: '2', text: '56', is_correct: true }], points: 10, sort_order: 3 },
            );
        }
        const { error: qE } = await supabaseAdmin.from('assessment_questions').insert(qBatch);
        if (qE) errors.push(`questions: ${qE.message}`);
        else qCount += qBatch.length;

        // Create submissions for each assessment
        if (studentIds.length > 0) {
            const sBatch: any[] = [];
            for (const a of aD) {
                for (const sid of studentIds.slice(0, 8)) {
                    sBatch.push({
                        assessment_id: a.id, student_id: sid,
                        status: pick(['submitted', 'graded', 'graded']),
                        score: Math.floor(30 + Math.random() * 71),
                        submitted_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
                    });
                }
            }
            const { error: sE } = await supabaseAdmin.from('assessment_submissions').insert(sBatch);
            if (sE) errors.push(`submissions: ${sE.message}`);
            else sCount += sBatch.length;
        }
    }

    log.push(`Created: ${aCount} assessments, ${qCount} questions, ${sCount} submissions`);

    return NextResponse.json({ success: true, log, errors: errors.length > 0 ? errors : 'none' });
}
