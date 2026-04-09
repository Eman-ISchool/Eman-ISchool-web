import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { CourseLearningHub } from '@/components/courses/CourseLearningHub';
import { PublishCourseButton } from '@/components/teacher/PublishCourseButton';
import CourseMetricsWidget from '@/components/teacher/CourseMetricsWidget';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AccessDenied } from '@/components/teacher/AccessDenied';

export default async function CourseDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('teacher.courseDetails');

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    // Check ownership first - requires course data
    const courseRes = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
    const course = courseRes.data;

    if (!course) {
        notFound();
    }

    if (course.teacher_id !== user.id && user.role !== 'admin') {
        return <AccessDenied locale={locale} />;
    }

    // Fetch subjects and other data in parallel
    let subjects: any[] = [];
    let metrics = { enrolledStudents: 0, upcomingLessons: 0, materialsCount: 0, assignmentsCount: 0 };

    {
        const [subjectsRes] = await Promise.all([
            supabaseAdmin
                .from('subjects')
                .select(`
                    id,
                    title,
                    sort_order,
                    lessons (
                        id,
                        title,
                        start_date_time,
                        sort_order
                    )
                `)
                .eq('course_id', id)
                .order('sort_order', { ascending: true })
        ]);

        subjects = subjectsRes.data || [];

        // Fetch course metrics
        const [res1, res2, res3, res4] = await Promise.all([
            supabaseAdmin
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', id)
                .eq('status', 'active'),
            supabaseAdmin
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', id)
                .gt('start_date_time', new Date().toISOString()),
            supabaseAdmin
                .from('materials')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', id),
            supabaseAdmin
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', id),
        ]);

        metrics.enrolledStudents = res1.count || 0;
        metrics.upcomingLessons = res2.count || 0;
        metrics.materialsCount = res3.count || 0;
        metrics.assignmentsCount = res4.count || 0;
    }

    // Sort lessons manually if needed or rely on DB sort if possible (supabase supports nested sort but it's tricky in one query sometimes.
    // Usually lessons(order('sort_order')) works.
    // Let's assume default order or handle sorting in client if strict. For now standard fetch.

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={withLocalePrefix('/temp-teacher/courses', locale)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {course.title}
                            <span className={`text-xs px-2 py-1 rounded border ${course.is_published ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                {course.is_published ? t('publish') : 'Draft'}
                                {/* Note: 'Draft' translation might need update if I used 'draft' key logic */}
                            </span>
                        </h1>
                        <p className="text-gray-500">{course.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={withLocalePrefix(`/temp-teacher/courses/${id}/edit`, locale)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('edit')}
                        </Link>
                    </Button>
                    <PublishCourseButton
                        courseId={id}
                        isPublished={course.is_published}
                        locale={locale}
                    />
                </div>
            </div>

            {/* Course Metrics Widget */}
            <CourseMetricsWidget
                courseId={id}
                enrolledStudents={metrics.enrolledStudents}
                upcomingLessons={metrics.upcomingLessons}
                materialsCount={metrics.materialsCount}
                assignmentsCount={metrics.assignmentsCount}
            />

            {/* Course Content Management via Learning Hub */}
            <div className="mt-6">
                <CourseLearningHub
                    course={course}
                    subjects={subjects || []}
                    locale={locale}
                />
            </div>
        </div>
    );
}
