import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

async function getQuizzes() {
    if (!supabaseAdmin) return [];
    const { data } = await supabaseAdmin
        .from('assessments')
        .select('id, title, short_description, is_published')
        .order('created_at', { ascending: false })
        .limit(50);
    return (data || []).map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.short_description,
        status: q.is_published ? 'active' : 'draft',
    }));
}

export default async function QuizzesListPage() {
    const locale = await getLocale();
    const quizzes = await getQuizzes();

    return (
        <div className="space-y-6">
            <PageHeader
                title="الاختبارات"
                subtitle="إدارة الاختبارات والتقييمات"
            />

            {quizzes.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد اختبارات</h3>
                    <p className="mt-1 text-sm text-gray-600">لم يتم إنشاء أي اختبارات بعد.</p>
                </div>
            )}

            {quizzes.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz: any) => (
                        <Link
                            key={quiz.id}
                            href={`/${locale}/admin/quizzes/${quiz.id}/manage`}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <FileQuestion className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                                    {quiz.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{quiz.description}</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
