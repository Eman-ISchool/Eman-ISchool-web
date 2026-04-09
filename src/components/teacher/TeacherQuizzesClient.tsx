'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Copy,
  Eye,
  FileText,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withLocalePrefix } from '@/lib/locale-path';

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  lesson: string;
  dueDate: string;
  dueTime?: string;
  questions: number;
  maxAttempts: number;
  passingRate: string;
  duration?: string;
  status: string;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-right">
      <h1 className="text-[2.15rem] font-black leading-none text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl border-slate-200 bg-white pe-11 shadow-sm"
      />
    </div>
  );
}

function PillButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-black/85"
    >
      {children}
    </button>
  );
}

function StatusChip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'danger' | 'success' }) {
  const toneClass =
    tone === 'success'
      ? 'bg-[#111111] text-white'
      : tone === 'danger'
        ? 'bg-red-500 text-white'
        : 'bg-[#f4f4f5] text-slate-600';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{label}</span>;
}

function ActionIcon({ icon: Icon, tone = 'default', onClick }: { icon: typeof Eye; tone?: 'default' | 'danger'; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        tone === 'danger'
          ? 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export default function TeacherQuizzesClient() {
  const { data: session, status: sessionStatus } = useSession();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const user = session?.user as any;

  const [items, setItems] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const fetchQuizzes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessments?teacherId=${user.id}&type=quiz`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped: QuizItem[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        title: item.title || '-',
        subject: item.subject?.title || item.subject_name || '-',
        lesson: item.lesson_name || item.class_name || '-',
        dueDate: item.due_date
          ? new Date(item.due_date).toLocaleDateString('en-US')
          : item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-US')
            : '-',
        dueTime: item.due_time || '',
        questions: item.questions_count ?? 0,
        maxAttempts: item.attempt_limit ?? 3,
        passingRate: item.passing_rate ? `${item.passing_rate}%` : '50%',
        duration: item.duration_minutes ? `${item.duration_minutes} ${isArabic ? 'دقيقة' : 'min'}` : undefined,
        status: item.is_published ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'مسودة' : 'Draft'),
      }));
      setItems(mapped);
    } catch {
      setError(isArabic ? 'فشل في تحميل الاختبارات' : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isArabic]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchQuizzes();
    }
  }, [sessionStatus, fetchQuizzes]);

  // Create form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [lesson, setLesson] = useState('');
  const [dueDate, setDueDate] = useState('');

  const filtered = items.filter((item) =>
    [item.title, item.subject, item.lesson].join(' ').toLowerCase().includes(query.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: null,
          schedule: null,
          status: 'draft',
          assessment_type: 'quiz',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setTitle('');
      setSubject('');
      setLesson('');
      setDueDate('');
      setShowCreateModal(false);
      showSaved(isArabic ? 'تم إنشاء الاختبار بنجاح' : 'Quiz created successfully');
      await fetchQuizzes();
    } catch (err: any) {
      setError(err.message || (isArabic ? 'فشل في إنشاء الاختبار' : 'Failed to create quiz'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this quiz?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((q) => q.id !== id));
      showSaved(isArabic ? 'تم حذف الاختبار' : 'Quiz deleted');
    } catch (err: any) {
      setError(err.message || (isArabic ? 'فشل في حذف الاختبار' : 'Failed to delete quiz'));
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (item: QuizItem) => {
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${item.title} (${isArabic ? 'نسخة' : 'Copy'})`,
          status: 'draft',
          assessment_type: 'quiz',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      showSaved(isArabic ? 'تم نسخ الاختبار' : 'Quiz duplicated');
      await fetchQuizzes();
    } catch (err: any) {
      setError(err.message || (isArabic ? 'فشل في نسخ الاختبار' : 'Failed to duplicate quiz'));
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[1.2rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="space-y-2 text-right">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title={isArabic ? 'الاختبارات' : 'Quizzes'}
        subtitle={isArabic ? 'إدارة وإنشاء الاختبارات لمواد الدراسة الخاصة بك' : 'Manage and create quizzes for your study materials'}
      />

      {savedMsg && (
        <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div>
      )}
      {error && !loading && (
        <div className="flex items-center justify-between rounded-[1rem] bg-red-50 px-5 py-3">
          <button type="button" onClick={() => setError(null)} className="text-sm font-bold text-red-400 hover:text-red-600">x</button>
          <span className="text-sm font-semibold text-red-600">{error}</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <Tabs dir="ltr" value={view} onValueChange={(v) => setView(v as 'cards' | 'table')}>
            <TabsList className="tabs-pill-active h-auto rounded-[1.1rem] border border-slate-200 bg-[#f4f4f4] p-1">
              <TabsTrigger
                value="cards"
                className="rounded-[0.9rem] border border-transparent px-4 py-2 data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:shadow-none"
              >
                {isArabic ? 'بطاقات' : 'Cards'}
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="rounded-[0.9rem] border border-transparent px-4 py-2 data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:shadow-none"
              >
                {isArabic ? 'جدول' : 'Table'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchField placeholder={isArabic ? 'البحث عن الاختبارات...' : 'Search quizzes...'} value={query} onChange={setQuery} />
        </div>

        <PillButton onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          {isArabic ? 'إنشاء اختبار' : 'Create Quiz'}
        </PillButton>
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <p className="mt-2 text-xs text-red-400">{isArabic ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later'}</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state matching FutureLab */
        <div className="flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-14 text-center">
          <h3 className="text-xl font-black text-slate-900">
            {query
              ? (isArabic ? 'لم يتم العثور على نتائج' : 'No results found')
              : (isArabic ? 'لم يتم العثور على اختبارات' : 'No quizzes found')}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {query
              ? (isArabic ? 'جرب البحث بكلمات مختلفة' : 'Try different search terms')
              : (isArabic ? 'ابدأ بإنشاء أول اختبار لك' : 'Start by creating your first quiz')}
          </p>
          {!query && (
            <div className="mt-6">
              <PillButton onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                {isArabic ? 'إنشاء اختبار' : 'Create Quiz'}
              </PillButton>
            </div>
          )}
        </div>
      ) : view === 'cards' ? (
        /* Cards view */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ActionIcon icon={Trash2} tone="danger" onClick={() => handleDelete(item.id)} />
                  <ActionIcon icon={Copy} onClick={() => handleDuplicate(item)} />
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.subject !== '-' ? item.subject : item.lesson}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <span className="rounded-full border border-slate-200 bg-[#f8f8f8] px-3 py-1.5 text-sm font-bold text-slate-800">
                  {isArabic ? 'تاريخ الاستحقاق' : 'Due'}: {item.dueDate}
                </span>
              </div>

              <div className="mt-5 space-y-2 text-right text-sm text-slate-500">
                <div className="flex items-center justify-between">
                  <span>{item.questions}</span>
                  <span>{isArabic ? 'الأسئلة' : 'Questions'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{item.maxAttempts}</span>
                  <span>{isArabic ? 'الحد الأقصى للمحاولات' : 'Max Attempts'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{item.passingRate}</span>
                  <span>{isArabic ? 'درجة النجاح' : 'Passing Rate'}</span>
                </div>
                {item.duration && (
                  <div className="flex items-center justify-between">
                    <span>{item.duration}</span>
                    <span>{isArabic ? 'الوقت المحدد' : 'Duration'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <StatusChip label={item.status} tone={item.status === 'نشط' || item.status === 'Active' ? 'success' : 'default'} />
                  <span>{isArabic ? 'الحالة' : 'Status'}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href={withLocalePrefix(`/teacher/quizzes/${item.id}/manage`, locale)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  {isArabic ? 'إدارة' : 'Manage'}
                </Link>
                <Link
                  href={withLocalePrefix(`/teacher/assessments/${item.id}/results`, locale)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  {isArabic ? 'عرض النتائج' : 'View Results'} <FileText className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-right">
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'العنوان' : 'Title'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'المادة الدراسية' : 'Subject'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'الموعد النهائي' : 'Due Date'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'الأسئلة' : 'Questions'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'المحاولات' : 'Attempts'}</th>
                <th className="px-4 py-3 font-semibold text-slate-600">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-right">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-slate-500">{item.subject}</td>
                  <td className="px-4 py-3">
                    <StatusChip label={item.status} tone={item.status === 'نشط' || item.status === 'Active' ? 'success' : 'default'} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.dueDate}
                    {item.dueTime && <div className="mt-1 text-xs text-slate-400">{item.dueTime}</div>}
                  </td>
                  <td className="px-4 py-3 font-semibold">{item.questions}</td>
                  <td className="px-4 py-3 text-slate-500">
                    0
                    <div className="mt-1 text-xs text-slate-400">{isArabic ? 'الحد الأقصى' : 'Max'} {item.maxAttempts}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-2 ${deleting === item.id ? 'pointer-events-none opacity-50' : ''}`}>
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => handleDelete(item.id)} />
                      <ActionIcon icon={Copy} onClick={() => handleDuplicate(item)} />
                      <Link href={withLocalePrefix(`/teacher/quizzes/${item.id}/manage`, locale)}>
                        <ActionIcon icon={Eye} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create quiz modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[560px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
            <div className="text-right">
              <h3 className="text-3xl font-black text-slate-950">{isArabic ? 'إنشاء اختبار' : 'Create Quiz'}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {isArabic ? 'إضافة اختبار جديد للمادة الدراسية المحددة.' : 'Add a new quiz for the selected subject.'}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'العنوان' : 'Title'}</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'المادة الدراسية' : 'Subject'}</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الدرس' : 'Lesson'}</label>
                  <Input value={lesson} onChange={(e) => setLesson(e.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-start gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating ? (isArabic ? 'جارٍ الإنشاء...' : 'Creating...') : (isArabic ? 'إنشاء' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 disabled:opacity-50"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
