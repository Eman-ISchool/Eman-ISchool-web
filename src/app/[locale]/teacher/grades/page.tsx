'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Layers, BookOpen, ArrowRight, Plus, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';

interface GradeRecord {
  id: string;
  name: string;
  name_en?: string | null;
  description?: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  courses?: { count: number }[];
}

export default function TeacherGradesPage() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchGrades = async () => {
      try {
        const res = await fetch('/api/grades');
        if (res.ok) {
          const data = await res.json();
          setGrades(data.grades || data || []);
        }
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [status]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setError(isArabic ? 'اسم الفصل مطلوب' : 'Class name is required');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const slug = newClassName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName, slug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');

      // Update list without refresh
      setGrades((prev) => [...prev, data.grade]);
      setIsModalOpen(false);
      setNewClassName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isArabic ? 'فصولي' : 'My Classes'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isArabic
              ? 'إدارة الفصول الدراسية والمواد والدروس الخاصة بك'
              : 'Manage your classes, courses, and lessons'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isArabic ? 'فصل جديد' : 'New Class'}
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isArabic ? 'لا توجد فصول دراسية' : 'No Classes Configured'}
          </h3>
          <p className="text-gray-500">
            {isArabic
              ? 'تحتاج إلى فصول للبدء. اطلب من المسؤول إضافة فصول لك.'
              : 'You need classes to start. Ask an admin to assign classes to you.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grades.map((grade) => {
            const courseCount = grade.courses?.[0]?.count || 0;
            return (
              <Link
                key={grade.id}
                href={withLocalePrefix(`/teacher/grades/${grade.slug}`, locale)}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
                prefetch={false}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-emerald-500" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                  {isArabic ? grade.name : (grade.name_en || grade.name)}
                </h3>
                {grade.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{grade.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                  <BookOpen className="w-3 h-3" />
                  <span>{courseCount} {isArabic ? 'مادة' : 'courses'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {isArabic ? 'إنشاء فصل جديد' : 'Create New Class'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'اسم الفصل *' : 'Class Name *'}
                  </label>
                  <input
                    id="className"
                    type="text"
                    value={newClassName}
                    onChange={(e) => {
                      setNewClassName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder={isArabic ? 'مثال: الصف الثامن أ' : 'e.g. Grade 8A'}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none"
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (isArabic ? 'جاري الإنشاء...' : 'Creating...') : (isArabic ? 'إنشاء' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
