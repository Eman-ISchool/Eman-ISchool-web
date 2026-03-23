import Link from 'next/link';
import { Plus, Layers } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function TeacherSubjectsPage({ params: { locale } }: { params: { locale: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        redirect('/auth/error?error=AccessDenied');
    }

    let subjects: any[] = [];

    if (isSupabaseAdminConfigured && supabaseAdmin) {
        const { data } = await supabaseAdmin
            .from('subjects')
            .select(`*, courses:courses(count)`)
            .eq('teacher_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (data) {
            subjects = data;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
                    <p className="text-gray-500 mt-1">Manage your teaching subjects and related courses</p>
                </div>
                <Link
                    href={withLocalePrefix('/teacher/subjects/new', locale)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Subject
                </Link>
            </div>

            {subjects.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Subjects Configured</h3>
                    <p className="text-gray-500">Create subjects to organize your teaching courses and materials.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subjects.map((subject: any) => (
                        <Link
                            key={subject.id}
                            href={withLocalePrefix(`/teacher/subjects/${subject.id}`, locale)}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                            {subject.image_url ? (
                                <div className="h-32 overflow-hidden">
                                    <img loading="lazy" decoding="async" src={subject.image_url} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                            ) : (
                                <div className="h-32 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                                    <Layers className="w-10 h-10 text-amber-400" />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                    {subject.title}
                                </h3>
                                {subject.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{subject.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${subject.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {subject.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {subject.courses?.[0]?.count || 0} courses
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
