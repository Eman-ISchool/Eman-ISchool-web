import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { BookOpen, Calendar, User, ArrowLeft } from 'lucide-react';

export default async function StudentCourseDetailPage({
    params: { locale, id }
}: {
    params: { locale: string; id: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('student.courseDetail');
    const tr = (key: string, fallback: string) => {
        const hasKey = typeof (t as any).has === 'function' ? (t as any).has(key) : true;
        return hasKey ? t(key as any) : fallback;
    };

    if (!session || user?.role !== 'student') {
        redirect(`/${locale}`);
    }

    let course: any = null;
    let enrollment: any = null;
    let lessons: any[] = [];

    {
        const { data: dbCourse, error: courseError } = await supabaseAdmin
            .from('courses')
            .select(`
                *,
                grades(id, title, level),
                teachers(id, name, email, image_url)
            `)
            .eq('id', id)
            .single();

        if (courseError || !dbCourse) {
            return (
                <div className="p-8 text-center text-red-500">
                    {tr('courseNotFound', 'Course not found')}
                </div>
            );
        }
        course = dbCourse;

        // Verify student is enrolled in this course
        const { data: dbEnrollment, error: enrollmentError } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('student_id', user.id)
            .eq('course_id', id)
            .eq('status', 'active')
            .single();
        enrollment = dbEnrollment;
        if (enrollmentError) {
            console.error('Error fetching enrollment:', enrollmentError);
        }

        // Fetch lessons for this course
        const { data: dbLessons, error: lessonsError } = await supabaseAdmin
            .from('lessons')
            .select('*')
            .eq('course_id', id)
            .order('start_date_time', { ascending: true });
        lessons = dbLessons || [];

        if (lessonsError) {
            console.error('Error fetching lessons:', lessonsError);
        }
    }

    if (!course) {
        return (
            <div className="p-8 text-center text-red-500">
                {tr('courseNotFound', 'Course not found')}
            </div>
        );
    }

    // Calculate progress (completed lessons / total lessons)
    const totalLessons = lessons?.length || 0;
    const completedLessons = lessons?.filter(l => l.status === 'completed').length || 0;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-600">
                <Link href={`/${locale}/student/courses`} className="hover:text-brand-primary">
                    {tr('courses', 'Courses')}
                </Link>
                <span className="mx-2">/</span>
                <span className="font-medium">{course.title}</span>
            </nav>

            {/* Back Button */}
            <Link
                href={`/${locale}/student/courses`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-primary mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                {tr('backToCourses', 'Back to Courses')}
            </Link>

            {/* Course Header */}
            <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-start gap-6">
                    {course.thumbnail_url && (
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-32 h-32 object-cover rounded-lg"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {course.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <User className="w-5 h-5" />
                            <span className="font-medium">
                                {course.teachers?.name}
                            </span>
                        </div>
                        {course.description && (
                            <p className="text-gray-600 mb-4">
                                {course.description}
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.grades?.title}</span>
                        </div>
                    </div>
                </div>

                {/* Enrollment Status */}
                {enrollment ? (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">
                                    {tr('enrolledSince', 'Enrolled since')}
                                </div>
                                <div className="text-sm font-medium">
                                    {new Date(enrollment.enrolled_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">
                                    {tr('progress', 'Progress')}
                                </div>
                                <div className="text-2xl font-bold text-brand-primary">
                                    {progress}%
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 pt-4 border-t">
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                {tr('notEnrolled', 'You are not enrolled in this course')}
                            </p>
                            <Link
                                href={`/${locale}/student/courses`}
                                className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                            >
                                {tr('browseCourses', 'Browse courses')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Lessons List */}
            {enrollment && lessons && lessons.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        {tr('lessons', 'Lessons')}
                    </h2>

                    <div className="space-y-4">
                        {lessons.map((lesson) => (
                            <Link
                                key={lesson.id}
                                href={`./lessons/${lesson.id}`}
                                className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {lesson.title}
                                        </h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            {lesson.description}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(lesson.start_date_time).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(lesson.start_date_time).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            lesson.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : lesson.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : lesson.status === 'live'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {tr(`status.${lesson.status}`, lesson.status)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* No Lessons */}
            {enrollment && (!lessons || lessons.length === 0) && (
                <div className="bg-white rounded-lg border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        {tr('noLessons', 'No lessons yet')}
                    </h2>
                    <p className="text-gray-500">
                        {tr('noLessonsDescription', 'Your teacher has not published lessons for this course yet.')}
                    </p>
                </div>
            )}
        </div>
    );
}
