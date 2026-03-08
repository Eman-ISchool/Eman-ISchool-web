import Link from 'next/link';
import { Plus, BookOpen, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function TeacherCoursesPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        redirect('/auth/error?error=AccessDenied');
    }

    let courses: any[] = [];

    if (isSupabaseAdminConfigured && supabaseAdmin) {
        const { data } = await supabaseAdmin
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

        if (data) {
            courses = data;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage your teaching courses, lessons, and enrolled students</p>
                </div>
                <Link
                    href={withLocalePrefix('/teacher/courses/new', locale)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Course
                </Link>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Courses Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first course to start adding lessons, enrolling students, and scheduling live sessions.</p>
                    <Link
                        href={withLocalePrefix('/teacher/courses/new', locale)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Course
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map((course: any) => (
                        <Link
                            key={course.id || course._id}
                            href={withLocalePrefix(`/teacher/courses/${course.id || course._id}`, locale)}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                            prefetch={false}
                        >
                            <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                    {course.title}
                                </h3>
                                {course.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    {course.subject && (
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                            {course.subject?.title || course.subject}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {course.enrollments?.[0]?.count || course.enrollmentCount || 0}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
