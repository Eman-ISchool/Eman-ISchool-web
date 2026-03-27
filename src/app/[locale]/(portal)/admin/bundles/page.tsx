import Link from 'next/link';
import { Layers3 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

async function getBundles() {
    if (!supabaseAdmin) return [];
    const { data } = await supabaseAdmin
        .from('courses')
        .select('id, title, description, is_published, enrollments:enrollments(count)')
        .order('created_at', { ascending: false })
        .limit(50);
    return (data || []).map((c: any) => ({
        id: c.id,
        name: c.title,
        description: c.description,
        courses_count: c.enrollments?.[0]?.count ?? 0,
        status: c.is_published ? 'active' : 'draft',
    }));
}

export default async function BundlesListPage() {
    const locale = await getLocale();
    const bundles = await getBundles();

    return (
        <div className="space-y-6">
            <PageHeader
                title="الحزم الدراسية"
                subtitle="إدارة الحزم والمسارات التعليمية"
            />

            {bundles.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <Layers3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد حزم</h3>
                    <p className="mt-1 text-sm text-gray-600">لم يتم إنشاء أي حزم دراسية بعد.</p>
                </div>
            )}

            {bundles.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bundles.map((bundle: any) => (
                        <Link
                            key={bundle.id}
                            href={`/${locale}/admin/bundles/${bundle.id}`}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                                    <Layers3 className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                                    {bundle.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{bundle.description}</p>
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
