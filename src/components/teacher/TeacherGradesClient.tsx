'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layers, BookOpen, ArrowRight, Plus, X } from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/page-header';

export interface TeacherGradeRecord {
  id: string;
  name: string;
  name_en?: string | null;
  description?: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  course_count?: number;
  courses?: { count: number }[];
}

interface TeacherGradesClientProps {
  locale: string;
  initialGrades: TeacherGradeRecord[];
}

export default function TeacherGradesClient({ locale, initialGrades }: TeacherGradesClientProps) {
  const isArabic = locale === 'ar';
  const [grades, setGrades] = useState<TeacherGradeRecord[]>(initialGrades);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setError(isArabic ? 'اسم الفصل مطلوب' : 'Class name is required');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const baseSlug = newClassName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${baseSlug || 'grade'}-${Date.now()}`;
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName, slug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');

      setGrades((prev) => [...prev, data.grade]);
      setIsModalOpen(false);
      setNewClassName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isArabic ? 'فصولي' : 'My Classes'}
        subtitle={isArabic
          ? 'إدارة الفصول الدراسية والمواد والدروس الخاصة بك'
          : 'Manage your classes, courses, and lessons'}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isArabic ? 'فصل جديد' : 'New Class'}
          </button>
        }
      />

      {grades.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-8 w-8 text-slate-400" />}
          title={isArabic ? 'لا توجد فصول دراسية' : 'No Classes Configured'}
          description={isArabic
            ? 'تحتاج إلى فصول للبدء. اطلب من المسؤول إضافة فصول لك.'
            : 'You need classes to start. Ask an admin to assign classes to you.'}
          action={{ label: isArabic ? 'فصل جديد' : 'New Class', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grades.map((grade) => {
            const courseCount = grade.course_count ?? grade.courses?.[0]?.count ?? 0;
            return (
              <Link
                key={grade.id}
                href={withLocalePrefix(`/teacher/grades/${grade.slug || grade.id}`, locale)}
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
                {grade.description ? (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{grade.description}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                  <BookOpen className="w-3 h-3" />
                  <span>{courseCount} {isArabic ? 'مادة' : 'courses'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isModalOpen ? (
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
                  {error ? <p className="text-red-500 text-sm mt-2">{error}</p> : null}
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
      ) : null}
    </div>
  );
}
