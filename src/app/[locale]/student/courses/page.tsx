import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { BookOpen, Calendar, User } from 'lucide-react';

export default async function StudentCoursesPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('student.courses');

    if (!session || user?.role !== 'student') {
        redirect(`/${locale}`);
    }

    // Fetch active enrollments for the student
    const { data: enrollments, error } = await supabaseAdmin
        .from('enrollments')
        .select(`
            *,
            courses(id, title, description, grade_level, teacher_id),
            teachers(id, name, email),
            lessons(id, title, start_date_time)
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false });

    if (error) {
        console.error('Error fetching enrollments:', error);
        return (
            <div className="p-8 text-center text-red-500">
                {t('errorLoading')}
            </div>
        );
    }

    // For each enrollment, get the next lesson
    const enrollmentsWithNextLesson = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
            const { data: lessons } = await supabaseAdmin
                .from('lessons')
                .select('id, title, start_date_time')
                .eq('course_id', enrollment.course_id)
                .gt('start_date_time', new Date().toISOString())
                .order('start_date_time', { ascending: true })
                .limit(1);

            return {
                ...enrollment,
                nextLesson: lessons?.[0] || null
            };
        })
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {t('title')}
            </h1>

            {enrollmentsWithNextLesson.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        {t('noCourses')}
                    </h2>
                    <p className="text-gray-500 mb-4">
                        {t('noCoursesDescription')}
                    </p>
                    <Link
                        href="/courses"
                        className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                        {t('browseCourses')}
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {enrollmentsWithNextLesson.map((enrollment) => (
                        <Link
                            key={enrollment.id}
                            href={`./courses/${enrollment.course_id}`}
                            className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow block"
                            prefetch={false}
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {enrollment.courses?.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <User className="w-4 h-4" />
                                    <span>{enrollment.teachers?.name}</span>
                                </div>
                            </div>

                            {enrollment.nextLesson ? (
                                <div className="flex items-center gap-2 text-sm text-brand-primary bg-brand-primary/5 rounded-lg p-3">
                                    <Calendar className="w-4 h-4" />
                                    <div>
                                        <div className="font-medium">
                                            {t('nextLesson')}
                                        </div>
                                        <div className="text-gray-700">
                                            {new Date(enrollment.nextLesson.start_date_time).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                                    {t('noUpcomingLessons')}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
