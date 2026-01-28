import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
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
    const prefix = name.replace(/\s/g, '.').toLowerCase(); // unlikely to work with Arabic well for real email but ok or demo
    // Actually better to use latin names for emails or random string
    return `user_${Math.random().toString(36).substring(7)}@eman-ischool.com`;
}

export async function GET() {
    // Security: Verify user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    console.log('Starting seed process...');

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
    }

    try {
        const createdUsers: string[] = [];
        const createdTeachers: string[] = [];
        const createdCourses: string[] = [];
        const createdLessons: string[] = [];
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

        // 4. Enroll Students & Create Lessons
        console.log('Enrolling students and creating lessons...');
        for (const courseId of createdCourses) {
            // Enroll 15 random students per course
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

            // Create 20 lessons (10 past, 10 future)
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1); // Start 1 month ago

            for (let i = 0; i < 20; i++) {
                const lessonDate = new Date(startDate);
                lessonDate.setDate(startDate.getDate() + (i * 3)); // Every 3 days

                const isPast = lessonDate < new Date();
                const status = isPast ? 'completed' : 'scheduled';

                const { data: lesson, error: lessonError } = await supabaseAdmin.from('lessons').insert({
                    course_id: courseId,
                    title: `درس ${i + 1}`,
                    description: `محتوى الدرس رقم ${i + 1}`,
                    start_date_time: lessonDate.toISOString(),
                    end_date_time: new Date(lessonDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour
                    status: status as LessonStatus,
                    // teacher_id is technically on course, but schema might replicate it. 
                    // Let's check schema: lessons has teacher_id.
                    teacher_id: ((await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single()).data as any)?.teacher_id,
                } as any).select().single();

                if (lessonError) {
                    console.error('Error creating lesson', lessonError);
                    continue;
                }

                // 5. Create Attendance for Past Lessons
                if (isPast && lesson) {
                    const attendanceRecords = enrolledStudents.map(studentId => {
                        const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'absent', 'late'];
                        const status = randomArrayElement(statuses);
                        return {
                            lesson_id: (lesson as any).id,
                            user_id: studentId,
                            status: status,
                            duration_minutes: status === 'present' ? 60 : (status === 'late' ? 45 : 0),
                        };
                    });
                    await supabaseAdmin.from('attendance').insert(attendanceRecords as any);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Seeding completed successfully',
            stats: {
                teachers: createdTeachers.length,
                students: studentIds.length,
                courses: createdCourses.length
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
