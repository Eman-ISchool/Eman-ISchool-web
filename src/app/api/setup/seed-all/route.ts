import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { LessonStatus, AttendanceStatus, EnrollmentStatus } from '@/types/database';
import bcrypt from 'bcryptjs';

const AFN = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'سارة', 'نورة', 'ليلى', 'فاطمة', 'مريم', 'يوسف', 'إبراهيم', 'حسن', 'حسين', 'عبدالله'];
const ALN = ['المنصور', 'الخالدي', 'العتيبي', 'الشمري', 'المطيري', 'القحطاني', 'السعيد', 'الغامدي', 'الزهراني', 'العمري', 'الحربي', 'الدوسري'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rn() { return `${pick(AFN)} ${pick(ALN)}`; }
function re() { return `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@eman-ischool.com`; }
function rd(d: number) { const t = new Date(); t.setDate(t.getDate() - Math.floor(Math.random() * d)); return t; }
function ph() { return `9665${Math.floor(10000000 + Math.random() * 90000000)}`; }
const ts = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No admin client' }, { status: 500 });

    try {
        const log: string[] = [];
        const errors: string[] = [];
        const teacherIds: string[] = [];
        const studentIds: string[] = [];
        const parentUserIds: string[] = [];
        const testIds: Record<string, string> = {};

        // ─── 0. Test Users ──────────────────────────────────────
        const testUsers = [
            { email: 'admin@test.com', password: 'TestAdmin123!', name: 'Admin User', role: 'admin' },
            { email: 'teacher@test.com', password: 'TestTeacher123!', name: 'Test Teacher', role: 'teacher' },
            { email: 'student@test.com', password: 'TestStudent123!', name: 'Test Student', role: 'student' },
        ];
        for (const u of testUsers) {
            const pw = await bcrypt.hash(u.password, 10);
            const { data: ex } = await supabaseAdmin.from('users').select('id').eq('email', u.email).maybeSingle();
            if (ex) {
                await supabaseAdmin.from('users').update({ password_hash: pw, is_active: true, name: u.name } as any).eq('email', u.email);
                testIds[u.role] = (ex as any).id;
            } else {
                const { data } = await supabaseAdmin.from('users').insert({ email: u.email, name: u.name, role: u.role, password_hash: pw, is_active: true } as any).select().single();
                if (data) testIds[u.role] = (data as any).id;
            }
            if (u.role === 'teacher' && testIds[u.role]) teacherIds.push(testIds[u.role]);
            if (u.role === 'student' && testIds[u.role]) studentIds.push(testIds[u.role]);
        }
        // Parent test user - try parent role, fallback to admin
        {
            const pw = await bcrypt.hash('TestParent123!', 10);
            const { data: ex } = await supabaseAdmin.from('users').select('id').eq('email', 'parent@test.com').maybeSingle();
            if (ex) { testIds['parent'] = (ex as any).id; parentUserIds.push((ex as any).id); }
            else {
                const { data } = await supabaseAdmin.from('users').insert({ email: 'parent@test.com', name: 'Test Parent', role: 'parent', password_hash: pw, is_active: true } as any).select().single();
                if (data) { testIds['parent'] = (data as any).id; parentUserIds.push((data as any).id); }
                else {
                    const { data: d2 } = await supabaseAdmin.from('users').insert({ email: 'parent@test.com', name: 'Test Parent', role: 'admin', password_hash: pw, is_active: true } as any).select().single();
                    if (d2) { testIds['parent'] = (d2 as any).id; parentUserIds.push((d2 as any).id); }
                }
            }
        }
        log.push(`Test users: ${Object.keys(testIds).length}`);

        // ─── 1. Teachers ────────────────────────────────────────
        const tBatch = Array.from({ length: 8 }, () => ({
            email: re(), name: `أ. ${rn()}`, role: 'teacher', is_active: true, phone: ph(),
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=t${Math.random()}`,
        }));
        const { data: tD, error: tE } = await supabaseAdmin.from('users').insert(tBatch as any).select();
        if (tE) errors.push(`teachers: ${tE.message}`);
        if (tD) teacherIds.push(...tD.map((t: any) => t.id));
        log.push(`Teachers: ${teacherIds.length}`);

        // ─── 2. Students ────────────────────────────────────────
        const sBatch = Array.from({ length: 60 }, () => ({
            email: re(), name: rn(), role: 'student', is_active: true, phone: ph(),
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=s${Math.random()}`,
        }));
        const { data: sD, error: sE } = await supabaseAdmin.from('users').insert(sBatch as any).select();
        if (sE) errors.push(`students: ${sE.message}`);
        if (sD) studentIds.push(...sD.map((s: any) => s.id));
        log.push(`Students: ${studentIds.length}`);

        // ─── 3. Parent-like Users ───────────────────────────────
        // Try parent role, fallback to admin
        const pBatch = Array.from({ length: 25 }, () => ({
            email: re(), name: rn(), role: 'parent', is_active: true, phone: ph(),
        }));
        const { data: pD } = await supabaseAdmin.from('users').insert(pBatch as any).select();
        if (pD) {
            parentUserIds.push(...pD.map((p: any) => p.id));
        } else {
            const pBatch2 = Array.from({ length: 25 }, () => ({ email: re(), name: rn(), role: 'admin', is_active: true, phone: ph() }));
            const { data: pD2 } = await supabaseAdmin.from('users').insert(pBatch2 as any).select();
            if (pD2) parentUserIds.push(...pD2.map((p: any) => p.id));
        }
        log.push(`Parents: ${parentUserIds.length}`);

        // ─── 4. Grades ──────────────────────────────────────────
        const gradeRows = [
            { name: 'الأول الابتدائي', name_en: 'Grade 1', slug: 'grade-1' },
            { name: 'الثاني الابتدائي', name_en: 'Grade 2', slug: 'grade-2' },
            { name: 'الثالث الابتدائي', name_en: 'Grade 3', slug: 'grade-3' },
            { name: 'الرابع الابتدائي', name_en: 'Grade 4', slug: 'grade-4' },
            { name: 'الخامس الابتدائي', name_en: 'Grade 5', slug: 'grade-5' },
            { name: 'السادس الابتدائي', name_en: 'Grade 6', slug: 'grade-6' },
            { name: 'الأول المتوسط', name_en: 'Grade 7', slug: 'grade-7' },
            { name: 'الثاني المتوسط', name_en: 'Grade 8', slug: 'grade-8' },
        ];
        const gradeIds: string[] = [];
        for (const g of gradeRows) {
            const { data: ex } = await supabaseAdmin.from('grades').select('id').eq('slug', g.slug).maybeSingle();
            if (ex) { gradeIds.push((ex as any).id); continue; }
            const { data } = await supabaseAdmin.from('grades').insert({ ...g, sort_order: gradeIds.length + 1, is_active: true } as any).select().single();
            if (data) gradeIds.push((data as any).id);
        }
        log.push(`Grades: ${gradeIds.length}`);

        // ─── 5. Subjects ────────────────────────────────────────
        const subjData = [
            { title: 'القرآن الكريم', slug: 'quran' }, { title: 'اللغة العربية', slug: 'arabic' },
            { title: 'الفقه الإسلامي', slug: 'fiqh' }, { title: 'التاريخ الإسلامي', slug: 'islamic-history' },
            { title: 'الحديث الشريف', slug: 'hadith' }, { title: 'الرياضيات', slug: 'math' },
            { title: 'العلوم', slug: 'science' }, { title: 'اللغة الإنجليزية', slug: 'english' },
        ];
        const subjectIds: string[] = [];
        for (let i = 0; i < subjData.length; i++) {
            const s = subjData[i];
            const { data: ex } = await supabaseAdmin.from('subjects').select('id').eq('slug', s.slug).maybeSingle();
            if (ex) { subjectIds.push((ex as any).id); continue; }
            const { data } = await supabaseAdmin.from('subjects').insert({ ...s, description: s.title, teacher_id: pick(teacherIds), sort_order: i + 1, is_active: true } as any).select().single();
            if (data) subjectIds.push((data as any).id);
        }
        log.push(`Subjects: ${subjectIds.length}`);

        // ─── 6. Courses ─────────────────────────────────────────
        const gLabels = ['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي'];
        const courseIds: string[] = [];
        const courseTeachers: Record<string, string> = {};
        const cTemplates = [
            'القرآن - حفظ جزء عم', 'القرآن - تجويد', 'العربية - نحو وصرف', 'العربية - القراءة',
            'الفقه - العبادات', 'التاريخ - السيرة', 'الحديث - الأربعون النووية',
            'الرياضيات - الحساب', 'العلوم - الأحياء', 'الإنجليزية - مستوى 1',
            'الإنجليزية - مستوى 2', 'القرآن - التفسير', 'الرياضيات - الجبر',
            'العلوم - الفيزياء', 'العربية - الإنشاء',
        ];
        for (const t of cTemplates) {
            const gl = pick(gLabels);
            const tid = pick(teacherIds);
            const { data, error } = await supabaseAdmin.from('courses').insert({
                title: `${t} - ${gl}`, slug: `c-${ts()}`,
                description: `دورة شاملة في ${t} لطلاب ${gl}`,
                price: pick([150, 200, 250, 300, 400, 500]), teacher_id: tid,
                is_published: true, max_students: pick([20, 25, 30]),
                subject: t.split(' - ')[0], grade_level: gl,
                duration_hours: pick([15, 20, 25, 30]),
                image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=Course',
            } as any).select().single();
            if (error) errors.push(`course: ${error.message}`);
            if (data) { courseIds.push((data as any).id); courseTeachers[(data as any).id] = tid; }
        }
        log.push(`Courses: ${courseIds.length}`);

        // ─── 7. Enrollments ─────────────────────────────────────
        let enrollTotal = 0;
        for (const cid of courseIds) {
            const enrolled = [...studentIds].sort(() => 0.5 - Math.random()).slice(0, 12 + Math.floor(Math.random() * 8));
            const eBatch = enrolled.map(sid => ({
                student_id: sid, course_id: cid,
                status: pick(['active', 'active', 'active', 'completed', 'pending'] as EnrollmentStatus[]),
                progress_percent: Math.floor(Math.random() * 100),
            }));
            const { data: eD, error: eE } = await supabaseAdmin.from('enrollments').insert(eBatch as any).select();
            if (eE) { errors.push(`enrollments: ${eE.message}`); break; }
            if (eD) enrollTotal += eD.length;
        }
        log.push(`Enrollments: ${enrollTotal}`);

        // ─── 8. Lessons + Attendance ────────────────────────────
        const lessonIds: string[] = [];
        for (const cid of courseIds) {
            const base = new Date(); base.setMonth(base.getMonth() - 2);
            const tid = courseTeachers[cid] || pick(teacherIds);
            // NO sort_order - column doesn't exist
            const lessonBatch = Array.from({ length: 12 }, (_, i) => {
                const d = new Date(base); d.setDate(base.getDate() + i * 5);
                const past = d < new Date();
                const hasMeet = Math.random() > 0.3;
                return {
                    course_id: cid, title: `الدرس ${i + 1}`, description: `محتوى الدرس ${i + 1}`,
                    start_date_time: d.toISOString(), end_date_time: new Date(d.getTime() + 3600000).toISOString(),
                    status: (past ? pick(['completed', 'completed', 'completed', 'cancelled'] as LessonStatus[]) : 'scheduled') as LessonStatus,
                    teacher_id: tid,
                    meet_link: hasMeet ? `https://meet.google.com/abc-${Math.random().toString(36).substring(2, 6)}-xyz` : null,
                    meeting_provider: hasMeet ? 'google_meet' : null,
                };
            });
            const { data: lD, error: lE } = await supabaseAdmin.from('lessons').insert(lessonBatch as any).select();
            if (lE) { errors.push(`lessons: ${lE.message}`); break; }
            if (lD) {
                lessonIds.push(...lD.map((l: any) => l.id));
                // Attendance - minimal columns only (no duration_seconds)
                const pastLessons = lD.filter((l: any) => new Date(l.start_date_time) < new Date());
                const attBatch: any[] = [];
                for (const les of pastLessons) {
                    for (const sid of studentIds.slice(0, 8)) {
                        const st = pick(['present', 'present', 'present', 'present', 'absent', 'late'] as AttendanceStatus[]);
                        attBatch.push({ lesson_id: (les as any).id, user_id: sid, status: st });
                    }
                }
                if (attBatch.length > 0) {
                    const { error: aE } = await supabaseAdmin.from('attendance').insert(attBatch as any);
                    if (aE && !errors.includes(`attendance: ${aE.message}`)) errors.push(`attendance: ${aE.message}`);
                }
            }
        }
        log.push(`Lessons: ${lessonIds.length}`);

        // ─── 9. Lesson Meetings (actual table is lesson_meetings) ──
        if (lessonIds.length > 0) {
            const meetBatch = lessonIds.slice(-40).filter(() => Math.random() > 0.3).map(lid => ({
                lesson_id: lid,
                meet_url: `https://meet.google.com/live-${Math.random().toString(36).substring(2, 8)}`,
                status: pick(['active', 'active', 'invalid']),
                provider: 'google_calendar',
                created_by_teacher_id: pick(teacherIds),
            }));
            // Try lesson_meetings first, fallback to meetings
            let { error: mE } = await supabaseAdmin.from('lesson_meetings').insert(meetBatch as any);
            if (mE) {
                // Fallback: try meetings table with different columns
                const meetBatch2 = lessonIds.slice(-40).filter(() => Math.random() > 0.3).map(lid => ({
                    lesson_id: lid,
                    meet_link: `https://meet.google.com/live-${Math.random().toString(36).substring(2, 8)}`,
                    status: pick(['created', 'active', 'ended']),
                    created_by: pick(teacherIds),
                }));
                const { error: mE2 } = await supabaseAdmin.from('meetings').insert(meetBatch2 as any);
                if (mE2) errors.push(`meetings: ${mE2.message}`);
                else log.push(`Meetings: ${meetBatch2.length}`);
            } else {
                log.push(`LessonMeetings: ${meetBatch.length}`);
            }
        }

        // ─── 10. Materials (minimal columns) ────────────────────
        if (courseIds.length > 0) {
            const matBatch: any[] = [];
            const mts = [{ t: 'كتاب المنهج', ty: 'book' }, { t: 'ملف تمارين', ty: 'file' }, { t: 'فيديو شرح', ty: 'video' }, { t: 'رابط مرجعي', ty: 'link' }, { t: 'ملزمة', ty: 'file' }];
            for (const cid of courseIds) {
                for (let i = 0; i < 4; i++) {
                    const m = pick(mts);
                    matBatch.push({
                        title: m.t, description: `${m.t} - مادة تعليمية`, type: m.ty,
                        course_id: cid,
                        url: m.ty === 'link' ? 'https://example.com/resource' : `https://storage.example.com/${Math.random().toString(36).substring(7)}.pdf`,
                    });
                }
            }
            const { error: matE } = await supabaseAdmin.from('materials').insert(matBatch as any);
            if (matE) errors.push(`materials: ${matE.message}`);
            else log.push(`Materials: ${matBatch.length}`);
        }

        // ─── 11. Enrollment Applications ────────────────────────
        const appUsers = parentUserIds.length > 0 ? parentUserIds : [testIds['admin'] || studentIds[0]];
        if (gradeIds.length > 0) {
            const appBatch = Array.from({ length: 80 }, () => ({
                user_id: pick(appUsers), grade_id: pick(gradeIds),
                student_details: { name: rn(), phone: ph() },
                parent_details: { name: rn(), phone: ph() },
                payment_method: pick(['stripe', 'bank_transfer', 'cash']),
                total_amount: pick([150, 200, 300, 500, 800]), currency: 'AED',
                status: pick(['pending', 'approved', 'approved', 'approved', 'payment_pending', 'payment_completed', 'rejected']),
                created_at: rd(120).toISOString(),
            }));
            const { data: appD, error: appE } = await supabaseAdmin.from('enrollment_applications').insert(appBatch as any).select();
            if (appE) errors.push(`applications: ${appE.message}`);
            log.push(`Applications: ${appD?.length || 0}`);
        }

        // ─── 12. Assessments + Questions ────────────────────────
        const asmtRows = [
            { title: 'اختبار منتصف الفصل - العربية', assessment_type: 'exam', duration_minutes: 60 },
            { title: 'اختبار نهاية الفصل - القرآن', assessment_type: 'exam', duration_minutes: 90 },
            { title: 'اختبار قصير - الفقه', assessment_type: 'quiz', duration_minutes: 15 },
            { title: 'اختبار شامل - التاريخ', assessment_type: 'exam', duration_minutes: 120 },
            { title: 'اختبار سريع - الحديث', assessment_type: 'quiz', duration_minutes: 20 },
            { title: 'تقييم شفهي - القرآن', assessment_type: 'quiz', duration_minutes: 10 },
            { title: 'اختبار تحريري - الرياضيات', assessment_type: 'exam', duration_minutes: 45 },
            { title: 'اختبار الوحدة 1 - العلوم', assessment_type: 'quiz', duration_minutes: 30 },
            { title: 'اختبار الوحدة 2 - الإنجليزية', assessment_type: 'quiz', duration_minutes: 25 },
            { title: 'الاختبار النهائي الشامل', assessment_type: 'exam', duration_minutes: 120 },
            { title: 'اختبار التجويد', assessment_type: 'quiz', duration_minutes: 30 },
            { title: 'اختبار قواعد النحو', assessment_type: 'exam', duration_minutes: 60 },
        ].map(a => ({
            ...a, teacher_id: pick(teacherIds),
            course_id: courseIds.length > 0 ? pick(courseIds) : null,
            lesson_id: lessonIds.length > 0 ? pick(lessonIds) : null,
            short_description: `${a.title} - وصف`, is_published: true,
            attempt_limit: a.assessment_type === 'quiz' ? 3 : 1,
        }));
        const asmtIds: string[] = [];
        const { data: aD, error: aE } = await supabaseAdmin.from('assessments').insert(asmtRows as any).select();
        if (aE) errors.push(`assessments: ${aE.message}`);
        if (aD) asmtIds.push(...aD.map((a: any) => a.id));

        if (asmtIds.length > 0) {
            // Questions - all multiple_choice to avoid check constraint
            const qBatch: any[] = [];
            for (const aid of asmtIds) {
                qBatch.push(
                    { assessment_id: aid, question_type: 'multiple_choice', question_text: 'ما هو الحرف الأول في الأبجدية؟', is_mandatory: true, options_json: [{ id: '1', text: 'ألف', is_correct: true }, { id: '2', text: 'باء', is_correct: false }], points: 10, sort_order: 1 },
                    { assessment_id: aid, question_type: 'multiple_choice', question_text: 'كم عدد سور القرآن؟', is_mandatory: true, options_json: [{ id: '1', text: '100', is_correct: false }, { id: '2', text: '114', is_correct: true }], points: 10, sort_order: 2 },
                    { assessment_id: aid, question_type: 'multiple_choice', question_text: 'من خاتم الأنبياء؟', is_mandatory: true, options_json: [{ id: '1', text: 'موسى', is_correct: false }, { id: '2', text: 'محمد ﷺ', is_correct: true }], points: 10, sort_order: 3 },
                    { assessment_id: aid, question_type: 'multiple_choice', question_text: 'ما ناتج 7 × 8؟', is_mandatory: true, options_json: [{ id: '1', text: '54', is_correct: false }, { id: '2', text: '56', is_correct: true }], points: 10, sort_order: 4 },
                );
            }
            const { error: qE } = await supabaseAdmin.from('assessment_questions').insert(qBatch as any);
            if (qE) errors.push(`questions: ${qE.message}`);

            // Submissions - minimal columns (no total_score, no teacher_feedback)
            const subBatch: any[] = [];
            for (const aid of asmtIds) {
                for (const sid of studentIds.slice(0, 12)) {
                    subBatch.push({
                        assessment_id: aid, student_id: sid,
                        status: pick(['submitted', 'graded', 'graded', 'graded']),
                        score: Math.floor(30 + Math.random() * 71),
                        submitted_at: rd(30).toISOString(),
                    });
                }
            }
            const { error: subE } = await supabaseAdmin.from('assessment_submissions').insert(subBatch as any);
            if (subE) errors.push(`submissions: ${subE.message}`);
            log.push(`Assessments: ${asmtIds.length}, Q: ${qBatch.length}, Sub: ${subBatch.length}`);
        }

        // ─── 13. Invoices + Payments ────────────────────────────
        // Try parent_id first, fallback to user_id
        if (parentUserIds.length > 0 || testIds['admin']) {
            const invUsers = parentUserIds.length > 0 ? parentUserIds : [testIds['admin']];
            // Try to discover invoice columns by inserting minimal record first
            const testInv = {
                invoice_number: `INV-test-${ts()}`,
                status: 'pending',
                currency: 'AED',
            };
            const { error: testE } = await supabaseAdmin.from('invoices').insert(testInv as any);
            if (testE) {
                errors.push(`invoices-probe: ${testE.message}`);
            }
            // Now try full batch
            const invBatch: any[] = [];
            for (let i = 0; i < 40; i++) {
                const amt = pick([150, 200, 300, 500, 800]);
                const da = rd(90);
                const paid = Math.random() > 0.35;
                invBatch.push({
                    invoice_number: `INV-${ts()}-${i}`,
                    status: paid ? 'paid' : pick(['pending', 'overdue', 'pending']),
                    currency: 'AED',
                    due_date: new Date(da.getTime() + 30 * 864e5).toISOString(),
                    paid_at: paid ? da.toISOString() : null,
                    created_at: da.toISOString(),
                });
            }
            const { data: invD, error: invE } = await supabaseAdmin.from('invoices').insert(invBatch as any).select();
            if (invE) errors.push(`invoices: ${invE.message}`);
            if (invD) log.push(`Invoices: ${invD.length}`);
        }

        // ─── 14. Orders ─────────────────────────────────────────
        {
            // Try each status individually to find valid ones
            const orderBatch = Array.from({ length: 20 }, (_, i) => ({
                order_number: `ORD-${ts()}-${i}`,
                type: pick(['enrollment', 'invoice_request', 'support', 'class_change', 'refund', 'general']),
                status: 'pending', // safe default
                user_id: pick([...parentUserIds, ...studentIds.slice(0, 5)]),
                title: pick(['طلب تغيير فصل', 'طلب استرداد', 'طلب تسجيل', 'استفسار عام', 'طلب شهادة']),
                description: 'تفاصيل الطلب',
                metadata: {},
                created_at: rd(60).toISOString(),
            }));
            const { error: oE } = await supabaseAdmin.from('orders').insert(orderBatch as any);
            if (oE) errors.push(`orders: ${oE.message}`);
            else log.push('Orders: 20');
        }

        // ─── 15. Support Tickets ────────────────────────────────
        {
            const ticketBatch = Array.from({ length: 15 }, (_, i) => ({
                ticket_number: `TKT-${ts()}-${i}`,
                user_id: pick([...parentUserIds, ...studentIds.slice(0, 5)]),
                category: pick(['technical', 'billing', 'enrollment', 'general']),
                subject: pick(['مشكلة تسجيل', 'استفسار رسوم', 'طلب تغيير', 'مشكلة تقنية', 'استفسار منهج']),
                status: pick(['open', 'in_progress', 'resolved', 'closed']),
                priority: pick(['low', 'medium', 'high']),
                created_at: rd(45).toISOString(),
            }));
            const { data: tkD, error: tkE } = await supabaseAdmin.from('support_tickets').insert(ticketBatch as any).select();
            if (tkE) errors.push(`tickets: ${tkE.message}`);
            if (tkD) log.push(`Tickets: ${tkD.length}`);
        }

        // ─── 16. Discounts ──────────────────────────────────────
        {
            let dCount = 0;
            const discRows = [
                { name: 'خصم الأخوة 10%', type: 'sibling', discount_type: 'percentage', value: 10 },
                { name: 'خصم الأخوة 15%', type: 'sibling', discount_type: 'percentage', value: 15 },
                { name: 'خصم الأخوة 20%', type: 'sibling', discount_type: 'percentage', value: 20 },
            ];
            for (const d of discRows) {
                const { error } = await supabaseAdmin.from('discounts').insert({
                    ...d, is_active: true, max_uses: 100, used_count: Math.floor(Math.random() * 20),
                    created_by: testIds['admin'] || teacherIds[0],
                } as any);
                if (!error) dCount++;
                else if (!errors.find(e => e.startsWith('discount'))) errors.push(`discount: ${error.message}`);
            }
            log.push(`Discounts: ${dCount}`);
        }

        return NextResponse.json({ success: true, log, errors: errors.length > 0 ? errors : 'none' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
    }
}
