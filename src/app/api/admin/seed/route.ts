import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { UserRole, LessonStatus, AttendanceStatus, EnrollmentStatus } from '@/types/database';
import bcrypt from 'bcryptjs';

// Helper to generate UUIDs (simplified v4-like for demo if needed, but Supabase generates them usually.
// However, we need them for FKs before insertion if we batch, or we insert and get back ID.)
// We will insert and select return.

// Test user credentials - use these for automated testing
const TEST_USERS = [
    { email: 'admin@test.com', password: 'TestAdmin123!', name: 'Test Admin', role: 'admin' as UserRole },
    { email: 'teacher@test.com', password: 'TestTeacher123!', name: 'Test Teacher', role: 'teacher' as UserRole },
    { email: 'student@test.com', password: 'TestStudent123!', name: 'Test Student', role: 'student' as UserRole },
    { email: 'parent@test.com', password: 'TestParent123!', name: 'Test Parent', role: 'parent' as UserRole },
];

const ARABIC_FIRST_NAMES = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'سارة', 'نورة', 'ليلى', 'فاطمة', 'مريم', 'يوسف', 'إبراهيم', 'حسن', 'حسين', 'عبدالله'];
const ARABIC_LAST_NAMES = ['المنصور', 'الخالدي', 'العتيبي', 'الشمري', 'المطيري', 'القحطاني', 'السعيد', 'الغامدي', 'الزهراني', 'العمري', 'الحربي', 'الدوسري'];

function randomArrayElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
    return `${randomArrayElement(ARABIC_FIRST_NAMES)} ${randomArrayElement(ARABIC_LAST_NAMES)}`;
}

function randomEmail(name: string) {
    // simplistic email gen
    return `user_${Math.random().toString(36).substring(7)}@eman-ischool.com`;
}

export async function POST() {
    return runSeed();
}

export async function GET() {
    return runSeed();
}

async function runSeed() {
    console.log('Starting seed process (no auth required for dev)...');

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
    }

    try {
        const createdTeachers: string[] = [];
        const createdCourses: string[] = [];
        const testUserIds: Record<string, string> = {};

        // 0. Create Test Users with known credentials (for automated testing)
        console.log('Creating test users with known credentials...');
        for (const testUser of TEST_USERS) {
            // Check if user already exists
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', testUser.email)
                .single();

            if (existingUser) {
                // Update existing user with new password hash
                const passwordHash = await bcrypt.hash(testUser.password, 10);
                await supabaseAdmin
                    .from('users')
                    .update({ password_hash: passwordHash, is_active: true })
                    .eq('email', testUser.email);
                testUserIds[testUser.role] = (existingUser as any).id;
                console.log(`Updated existing test user: ${testUser.email}`);
            } else {
                // Create new test user
                const passwordHash = await bcrypt.hash(testUser.password, 10);
                const { data, error } = await supabaseAdmin.from('users').insert({
                    email: testUser.email,
                    name: testUser.name,
                    role: testUser.role,
                    password_hash: passwordHash,
                    is_active: true,
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testUser.role}`,
                } as any).select().single();

                if (error) {
                    console.error(`Error creating test user ${testUser.email}:`, error);
                } else if (data) {
                    testUserIds[testUser.role] = (data as any).id;
                    console.log(`Created test user: ${testUser.email}`);
                    if (testUser.role === 'teacher') {
                        createdTeachers.push((data as any).id);
                    }
                }
            }
        }

        // 1. Create Teachers (5)
        console.log('Creating teachers...');
        for (let i = 0; i < 5; i++) {
            const name = randomName();
            const { data, error } = await supabaseAdmin.from('users').insert({
                email: randomEmail(name),
                name: `أ. ${name}`,
                role: 'teacher' as UserRole,
                is_active: true,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            } as any).select().single();

            if (error) console.error('Error creating teacher:', error);
            if (data) createdTeachers.push((data as any).id);
        }

        // 2. Create Students (50)
        console.log('Creating students...');
        const studentIds: string[] = [];
        const studentsToInsert = [];
        for (let i = 0; i < 50; i++) {
            const name = randomName();
            studentsToInsert.push({
                email: randomEmail(name),
                name: name,
                role: 'student' as UserRole,
                is_active: true,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            });
        }

        // Batch insert students
        const { data: studentsData, error: studentsError } = await supabaseAdmin.from('users').insert(studentsToInsert as any).select();
        if (studentsError) console.error('Error creating students:', studentsError);
        if (studentsData) studentIds.push(...studentsData.map((s: any) => s.id));

        // 3. Create Courses
        console.log('Creating courses...');
        const subjects = ['القرآن الكريم', 'اللغة العربية', 'الفقه', 'التاريخ الإسلامي', 'الحديث الشريف'];
        const grades = ['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي'];

        for (const teacherId of createdTeachers) {
            // Each teacher gets 2 courses
            for (let i = 0; i < 2; i++) {
                const subject = randomArrayElement(subjects);
                const grade = randomArrayElement(grades);
                const { data, error } = await supabaseAdmin.from('courses').insert({
                    title: `${subject} - ${grade}`,
                    slug: `course-${Math.random().toString(36).substring(7)}`,
                    description: `دورة شاملة في ${subject} لطلاب ${grade}`,
                    price: 100 + Math.floor(Math.random() * 400),
                    teacher_id: teacherId,
                    is_published: true,
                    max_students: 30,
                    subject: subject,
                    grade_level: grade,
                    duration_hours: 20,
                    image_url: 'https://placehold.co/600x400/2563eb/ffffff?text=Course',
                } as any).select().single();

                if (error) console.error('Error creating course:', error);
                if (data) createdCourses.push((data as any).id);
            }
        }

        // 4. Create Grades
        console.log('Creating grades...');
        const gradeNames = [
            { name: 'الأول الابتدائي', name_en: 'Grade 1', slug: 'grade-1' },
            { name: 'الثاني الابتدائي', name_en: 'Grade 2', slug: 'grade-2' },
            { name: 'الثالث الابتدائي', name_en: 'Grade 3', slug: 'grade-3' },
            { name: 'الرابع الابتدائي', name_en: 'Grade 4', slug: 'grade-4' },
            { name: 'الخامس الابتدائي', name_en: 'Grade 5', slug: 'grade-5' },
            { name: 'السادس الابتدائي', name_en: 'Grade 6', slug: 'grade-6' },
        ];
        const createdGrades: string[] = [];
        for (const g of gradeNames) {
            const { data: existing } = await supabaseAdmin.from('grades').select('id').eq('slug', g.slug).single();
            if (existing) {
                createdGrades.push((existing as any).id);
            } else {
                const { data, error } = await supabaseAdmin.from('grades').insert({
                    name: g.name,
                    name_en: g.name_en,
                    slug: g.slug,
                    sort_order: createdGrades.length + 1,
                    is_active: true,
                } as any).select().single();
                if (error) console.error('Error creating grade:', error);
                if (data) createdGrades.push((data as any).id);
            }
        }

        // 5. Create Parents
        console.log('Creating parents...');
        const parentIds: string[] = [];
        for (let i = 0; i < 20; i++) {
            const name = randomName();
            const { data, error } = await supabaseAdmin.from('users').insert({
                email: randomEmail(name),
                name: name,
                role: 'parent' as UserRole,
                is_active: true,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=parent${Math.random()}`,
            } as any).select().single();
            if (error) console.error('Error creating parent:', error);
            if (data) parentIds.push((data as any).id);
        }
        if (testUserIds['parent']) parentIds.push(testUserIds['parent']);

        // 6. Enroll Students & Create Lessons
        console.log('Enrolling students and creating lessons...');
        const createdLessons: string[] = [];
        for (const courseId of createdCourses) {
            const shuffledStudents = [...studentIds].sort(() => 0.5 - Math.random());
            const enrolledStudents = shuffledStudents.slice(0, 15);

            for (const studentId of enrolledStudents) {
                await supabaseAdmin.from('enrollments').insert({
                    student_id: studentId,
                    course_id: courseId,
                    status: 'active' as EnrollmentStatus,
                    progress_percent: Math.floor(Math.random() * 100),
                } as any);
            }

            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);

            for (let i = 0; i < 20; i++) {
                const lessonDate = new Date(startDate);
                lessonDate.setDate(startDate.getDate() + (i * 3));

                const isPast = lessonDate < new Date();
                const status = isPast ? 'completed' : 'scheduled';

                const { data: lesson, error: lessonError } = await supabaseAdmin.from('lessons').insert({
                    course_id: courseId,
                    title: `درس ${i + 1}`,
                    description: `محتوى الدرس رقم ${i + 1}`,
                    start_date_time: lessonDate.toISOString(),
                    end_date_time: new Date(lessonDate.getTime() + 60 * 60 * 1000).toISOString(),
                    status: status as LessonStatus,
                    teacher_id: ((await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single()).data as any)?.teacher_id,
                } as any).select().single();

                if (lessonError) {
                    console.error('Error creating lesson', lessonError);
                    continue;
                }

                if (lesson) {
                    createdLessons.push((lesson as any).id);
                }

                if (isPast && lesson) {
                    const attendanceRecords = enrolledStudents.map(studentId => {
                        const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'absent', 'late'];
                        const attStatus = randomArrayElement(statuses);
                        return {
                            lesson_id: (lesson as any).id,
                            user_id: studentId,
                            status: attStatus,
                            duration_minutes: attStatus === 'present' ? 60 : (attStatus === 'late' ? 45 : 0),
                        };
                    });
                    await supabaseAdmin.from('attendance').insert(attendanceRecords as any);
                }
            }
        }

        // 7. Create Enrollment Applications (matching reference site)
        console.log('Creating enrollment applications...');
        const applicationStatuses = ['pending', 'approved', 'approved', 'approved', 'payment_pending', 'payment_completed', 'rejected'] as const;
        const courseTitles = ['كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الأول', 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الثاني', 'كورس القرآن الكريم', 'كورس اللغة العربية'];
        const phonePrefix = ['96655', '96653', '96689', '96660', '24991', '97472', '97466'];

        for (let i = 0; i < 68; i++) {
            const studentName = randomName();
            const parentName = randomName();
            const appStatus = randomArrayElement([...applicationStatuses]);
            const phoneNum = randomArrayElement(phonePrefix) + Math.floor(1000000 + Math.random() * 9000000);
            const parentPhone = randomArrayElement(phonePrefix) + Math.floor(1000000 + Math.random() * 9000000);
            const gradeId = createdGrades.length > 0 ? randomArrayElement(createdGrades) : null;
            const courseTitle = randomArrayElement(courseTitles);
            const amount = 150;
            const daysAgo = Math.floor(Math.random() * 120);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);

            await supabaseAdmin.from('enrollment_applications').insert({
                user_id: parentIds.length > 0 ? randomArrayElement(parentIds) : testUserIds['parent'],
                grade_id: gradeId,
                student_details: {
                    name: studentName,
                    phone: phoneNum.toString(),
                    email: `${studentName.replace(/\s/g, '').toLowerCase()}@email.com`,
                    dateOfBirth: '2015-03-15',
                    address: 'الإمارات العربية المتحدة',
                    previousEducation: courseTitle,
                },
                parent_details: {
                    name: parentName,
                    phone: parentPhone.toString(),
                    email: `${parentName.replace(/\s/g, '').toLowerCase()}@email.com`,
                },
                payment_method: randomArrayElement(['stripe', 'bank_transfer', 'cash']),
                total_amount: amount,
                currency: 'AED',
                status: appStatus,
                created_at: createdAt.toISOString(),
            } as any);
        }

        // 8. Create Assessments (exams and quizzes)
        console.log('Creating assessments...');
        const createdAssessments: string[] = [];
        if (createdCourses.length > 0 && createdTeachers.length > 0) {
            const assessmentData = [
                { title: 'اختبار منتصف الفصل - اللغة العربية', type: 'exam', duration: 60 },
                { title: 'اختبار نهاية الفصل - اللغة العربية', type: 'exam', duration: 90 },
                { title: 'اختبار قصير - القرآن الكريم', type: 'quiz', duration: 15 },
                { title: 'اختبار شامل - الفقه', type: 'exam', duration: 120 },
                { title: 'اختبار سريع - الحديث', type: 'quiz', duration: 20 },
                { title: 'تقييم شفهي - اللغة العربية', type: 'quiz', duration: 10 },
                { title: 'اختبار تحريري - التاريخ الإسلامي', type: 'exam', duration: 45 },
                { title: 'اختبار الوحدة الأولى', type: 'quiz', duration: 30 },
            ];

            for (const a of assessmentData) {
                const courseId = randomArrayElement(createdCourses);
                const teacherId = randomArrayElement(createdTeachers);
                const { data, error } = await supabaseAdmin.from('assessments').insert({
                    teacher_id: teacherId,
                    course_id: courseId,
                    lesson_id: createdLessons.length > 0 ? randomArrayElement(createdLessons) : null,
                    title: a.title,
                    short_description: `${a.title} - وصف مختصر`,
                    duration_minutes: a.duration,
                    is_published: true,
                    assessment_type: a.type,
                    attempt_limit: a.type === 'quiz' ? 3 : 1,
                    late_submissions_allowed: a.type === 'quiz',
                } as any).select().single();

                if (error) console.error('Error creating assessment:', error);
                if (data) createdAssessments.push((data as any).id);
            }

            // Create questions for each assessment
            console.log('Creating assessment questions...');
            for (const assessmentId of createdAssessments) {
                const questions = [
                    {
                        question_type: 'multiple_choice',
                        question_text: 'ما هو الحرف الأول في الأبجدية العربية؟',
                        is_mandatory: true,
                        options_json: [
                            { id: '1', text: 'ألف', is_correct: true },
                            { id: '2', text: 'باء', is_correct: false },
                            { id: '3', text: 'تاء', is_correct: false },
                            { id: '4', text: 'ثاء', is_correct: false },
                        ],
                        points: 10,
                        sort_order: 1,
                    },
                    {
                        question_type: 'multiple_choice',
                        question_text: 'كم عدد سور القرآن الكريم؟',
                        is_mandatory: true,
                        options_json: [
                            { id: '1', text: '100', is_correct: false },
                            { id: '2', text: '114', is_correct: true },
                            { id: '3', text: '120', is_correct: false },
                            { id: '4', text: '130', is_correct: false },
                        ],
                        points: 10,
                        sort_order: 2,
                    },
                    {
                        question_type: 'text',
                        question_text: 'اكتب فقرة قصيرة عن أهمية تعلم اللغة العربية.',
                        is_mandatory: true,
                        options_json: null,
                        points: 20,
                        sort_order: 3,
                    },
                ];

                for (const q of questions) {
                    await supabaseAdmin.from('assessment_questions').insert({
                        assessment_id: assessmentId,
                        ...q,
                    } as any);
                }
            }
        }

        // 9. Create Exam Simulations (for exam simulation page)
        console.log('Creating exam simulations...');
        if (createdCourses.length > 0) {
            const examSimData = [
                { title: 'محاكاة اختبار منتصف الفصل', description: 'اختبار تجريبي لاختبار منتصف الفصل', duration: 60, total_score: 100 },
                { title: 'محاكاة اختبار نهاية الفصل', description: 'اختبار تجريبي لاختبار نهاية الفصل', duration: 90, total_score: 100 },
                { title: 'اختبار تشخيصي', description: 'اختبار لتقييم مستوى الطالب', duration: 30, total_score: 50 },
            ];
            for (const es of examSimData) {
                await supabaseAdmin.from('exam_simulations').insert({
                    course_id: randomArrayElement(createdCourses),
                    title: es.title,
                    description: es.description,
                    duration_minutes: es.duration,
                    total_score: es.total_score,
                } as any);
            }
        }

        // 10. Create Bundles
        console.log('Creating bundles...');
        const bundleData = [
            { name: 'الباقة الأساسية', description: 'تشمل المواد الأساسية', price: 500 },
            { name: 'الباقة المتقدمة', description: 'تشمل جميع المواد مع دروس إضافية', price: 800 },
            { name: 'باقة القرآن', description: 'حفظ وتجويد القرآن الكريم', price: 300 },
            { name: 'باقة اللغات', description: 'اللغة العربية والإنجليزية', price: 600 },
        ];
        for (const b of bundleData) {
            await supabaseAdmin.from('bundles').insert({
                name: b.name,
                description: b.description,
                price: b.price,
                status: 'active',
            } as any);
        }

        // 11. Create Invoices and Payments
        console.log('Creating invoices and payments...');
        if (parentIds.length > 0) {
            for (let i = 0; i < 15; i++) {
                const parentId = randomArrayElement(parentIds);
                const totalAmount = randomArrayElement([150, 300, 500, 800]);
                const daysAgo = Math.floor(Math.random() * 90);
                const invoiceDate = new Date();
                invoiceDate.setDate(invoiceDate.getDate() - daysAgo);
                const isPaid = Math.random() > 0.3;

                const { data: invoice } = await supabaseAdmin.from('invoices').insert({
                    invoice_number: `INV-2026-${String(i + 1).padStart(4, '0')}`,
                    parent_id: parentId,
                    status: isPaid ? 'paid' : randomArrayElement(['pending', 'overdue', 'draft']),
                    subtotal: totalAmount,
                    discount_amount: 0,
                    tax_amount: 0,
                    total: totalAmount,
                    currency: 'AED',
                    due_date: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    paid_at: isPaid ? invoiceDate.toISOString() : null,
                    created_at: invoiceDate.toISOString(),
                } as any).select().single();

                if (invoice && isPaid) {
                    await supabaseAdmin.from('payments').insert({
                        invoice_id: (invoice as any).id,
                        parent_id: parentId,
                        amount: totalAmount,
                        currency: 'AED',
                        status: 'succeeded',
                        payment_method: randomArrayElement(['stripe', 'bank_transfer', 'cash']),
                        created_at: invoiceDate.toISOString(),
                    } as any);
                }
            }
        }

        // 12. Create Support Tickets
        console.log('Creating support tickets...');
        const ticketSubjects = [
            'مشكلة في تسجيل الدخول',
            'استفسار عن الرسوم الدراسية',
            'طلب تغيير الفصل',
            'مشكلة تقنية في المنصة',
            'استفسار عن المنهج الدراسي',
        ];
        for (let i = 0; i < 10; i++) {
            const userId = randomArrayElement([...parentIds, ...studentIds.slice(0, 5)]);
            await supabaseAdmin.from('support_tickets').insert({
                ticket_number: `TKT-${String(i + 1).padStart(4, '0')}`,
                user_id: userId,
                category: randomArrayElement(['technical', 'billing', 'enrollment', 'general']),
                subject: randomArrayElement(ticketSubjects),
                status: randomArrayElement(['open', 'in_progress', 'resolved', 'closed']),
                priority: randomArrayElement(['low', 'medium', 'high']),
            } as any);
        }

        // 13. Create Discounts/Coupons
        console.log('Creating discounts...');
        const discountData = [
            { name: 'خصم الأخوة', type: 'sibling', discount_type: 'percentage', value: 10 },
            { name: 'كوبون العيد', type: 'coupon', discount_type: 'fixed', value: 50 },
            { name: 'عرض التسجيل المبكر', type: 'promotional', discount_type: 'percentage', value: 15 },
        ];
        for (const d of discountData) {
            await supabaseAdmin.from('discounts').insert({
                name: d.name,
                type: d.type,
                discount_type: d.discount_type,
                value: d.value,
                is_active: true,
                max_uses: 100,
                used_count: Math.floor(Math.random() * 30),
                created_by: testUserIds['admin'] || createdTeachers[0],
            } as any);
        }

        return NextResponse.json({
            success: true,
            message: 'Seeding completed successfully',
            stats: {
                teachers: createdTeachers.length,
                students: studentIds.length,
                parents: parentIds.length,
                courses: createdCourses.length,
                grades: createdGrades.length,
                lessons: createdLessons.length,
                enrollmentApplications: 68,
                assessments: createdAssessments.length,
                invoices: 15,
                supportTickets: 10,
            },
            testCredentials: TEST_USERS.map(u => ({
                email: u.email,
                password: u.password,
                role: u.role
            }))
        });
    } catch (error: any) {
        console.error('Seeding fatal error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
