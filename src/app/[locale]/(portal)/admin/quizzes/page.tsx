'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FileQuestion, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions_count?: number;
  status?: string;
}

export default function QuizzesListPage() {
  const locale = useLocale();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch('/api/admin/quizzes');
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        const data = await res.json();
        setQuizzes(data.quizzes || data.data || data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading quizzes');
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="الاختبارات"
        subtitle="إدارة الاختبارات والتقييمات"
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

      {!loading && !error && quizzes.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">لا توجد اختبارات</h3>
          <p className="mt-1 text-sm text-gray-600">لم يتم إنشاء أي اختبارات بعد.</p>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
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
