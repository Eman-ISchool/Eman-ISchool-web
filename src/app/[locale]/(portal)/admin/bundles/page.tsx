'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Layers3, Plus, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface Bundle {
  id: string;
  name: string;
  description?: string;
  courses_count?: number;
  status?: string;
}

export default function BundlesListPage() {
  const locale = useLocale();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBundles() {
      try {
        const res = await fetch('/api/admin/bundles');
        if (!res.ok) throw new Error('Failed to fetch bundles');
        const data = await res.json();
        setBundles(data.bundles || data.data || data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading bundles');
      } finally {
        setLoading(false);
      }
    }
    fetchBundles();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحزم الدراسية"
        subtitle="إدارة الحزم والمسارات التعليمية"
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && bundles.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Layers3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد حزم</h3>
          <p className="mt-1 text-sm text-gray-600">لم يتم إنشاء أي حزم دراسية بعد.</p>
        </div>
      )}

      {!loading && bundles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
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
