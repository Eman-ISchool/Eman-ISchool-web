import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { PageHeader } from '@/components/ui/page-header';
import { PageError } from '@/components/ui/page-error';
import { TeacherCoursesList } from '@/components/teacher/TeacherCoursesList';

export default async function TeacherCoursesPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        redirect('/auth/error?error=AccessDenied');
    }

    const isArabic = locale === 'ar';

    let courses: any[] = [];
    let error: string | null = null;

    if (isSupabaseAdminConfigured && supabaseAdmin) {
        const { data, error: dbError } = await supabaseAdmin
            .from('courses')
            .select(`
                *,
                teacher:users!courses_teacher_id_fkey(id, name, email, image),
                grade:grades(id, name, slug),
                subject:subjects(id, title, slug),
                enrollments:enrollments(count)
            `)
            .eq('teacher_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (dbError) {
            error = dbError.message;
        } else if (data) {
            courses = data;
        }
    }

    const createHref = withLocalePrefix('/teacher/courses/new', locale);

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={isArabic ? 'موادي الدراسية' : 'My Courses'}
                    subtitle={isArabic ? 'إدارة المواد والدروس والطلاب المسجلين' : 'Manage your teaching courses, lessons, and enrolled students'}
                    action={
                        <Link
                            href={createHref}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {isArabic ? 'مادة جديدة' : 'New Course'}
                        </Link>
                    }
                />
                <PageError message={error} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isArabic ? 'موادي الدراسية' : 'My Courses'}
                subtitle={isArabic ? 'إدارة المواد والدروس والطلاب المسجلين' : 'Manage your teaching courses, lessons, and enrolled students'}
                action={
                    <Link
                        href={createHref}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {isArabic ? 'مادة جديدة' : 'New Course'}
                    </Link>
                }
            />

            <TeacherCoursesList
                courses={courses}
                locale={locale}
                createHref={createHref}
                translations={{
                    all: isArabic ? 'الكل' : 'All',
                    published: isArabic ? 'منشور' : 'Published',
                    draft: isArabic ? 'مسودة' : 'Draft',
                    title: isArabic ? 'موادي الدراسية' : 'My Courses',
                    subtitle: isArabic ? 'إدارة المواد والدروس' : 'Manage your courses',
                    createCourse: isArabic ? 'إنشاء مادة' : 'Create Course',
                    emptyTitle: isArabic ? 'لا توجد مواد بعد' : 'No Courses Yet',
                    emptyDescription: isArabic ? 'أنشئ أول مادة لبدء إضافة الدروس وتسجيل الطلاب وجدولة الجلسات المباشرة.' : 'Create your first course to start adding lessons, enrolling students, and scheduling live sessions.',
                    noMatchTitle: isArabic ? 'لا توجد مواد مطابقة' : 'No matching courses',
                    noMatchDescription: isArabic ? 'حاول تغيير الفلتر لرؤية المزيد من المواد.' : 'Try changing the filter to see more courses.',
                }}
            />
        </div>
    );
}
