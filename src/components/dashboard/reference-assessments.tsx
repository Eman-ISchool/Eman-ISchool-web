'use client';

import React from 'react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Copy,
  Eye,
  FileText,
  Plus,
  Search,
  Settings,
  SquarePen,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import {
  Table as ReferenceTable,
  TableBody as ReferenceTableBody,
  TableCell as ReferenceTableCell,
  TableHead as ReferenceTableHead,
  TableHeader as ReferenceTableHeader,
  TableRow as ReferenceTableRow,
} from '@/components/admin/ReferenceTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withLocalePrefix } from '@/lib/locale-path';

interface ExamGroupRow {
  id: string;
  name: string;
  description: string;
  schedule: string;
  quizzes: number;
  status: string;
  createdAt: string;
}

interface QuizItem {
  id: number;
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

interface QuizManageQuestion {
  id: number;
  title: string;
  fileType: string;
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-semibold text-red-600">{message}</p>
      <p className="mt-2 text-xs text-red-400">يرجى المحاولة مرة أخرى لاحقاً</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl border-slate-200 bg-white pr-11 shadow-sm"
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

function OutlineButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const className = 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50';
  return href ? <Link href={href} className={className}>{children}</Link> : <button type="button" className={className}>{children}</button>;
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

function StatusChip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'danger' | 'success' }) {
  const toneClass =
    tone === 'success'
      ? 'bg-[#111111] text-white'
      : tone === 'danger'
        ? 'bg-red-500 text-white'
        : 'bg-[#f4f4f5] text-slate-600';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{label}</span>;
}

export function ReferenceExamsPage() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<ExamGroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchExamGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items: ExamGroupRow[] = (Array.isArray(data) ? data : []).map((item: any, idx: number) => ({
        id: item.id ? String(item.id) : `#${idx + 1}`,
        name: item.title || item.name || '-',
        description: item.description || '-',
        schedule: item.schedule || '-',
        quizzes: item.questions_count ?? item.assessment_submissions?.[0]?.count ?? 0,
        status: item.status === 'active' ? 'نشط' : item.status === 'draft' ? 'مسودة' : (item.status || 'نشط'),
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA') : '-',
      }));
      setRows(items);
    } catch (err) {
      setError('فشل في تحميل مجموعات الاختبارات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamGroups();
  }, [fetchExamGroups]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [active, setActive] = useState(true);
  const filtered = rows.filter((row) => [row.id, row.name].join(' ').toLowerCase().includes(query.toLowerCase()));

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim() || null,
          schedule: schedule.trim() || null,
          status: active ? 'active' : 'draft',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setName('');
      setDescription('');
      setSchedule('');
      setShowModal(false);
      await fetchExamGroups();
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء مجموعة الاختبارات');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        <SectionHeading title="مجموعات الاختبارات" subtitle="إدارة مجموعات الاختبارات والجداول الزمنية" />
        {error && !loading ? (
          <div className="flex items-center justify-between rounded-[1rem] bg-red-50 px-5 py-3">
            <button type="button" onClick={() => setError(null)} className="text-sm font-bold text-red-400 hover:text-red-600">x</button>
            <span className="text-sm font-semibold text-red-600">{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchField placeholder="البحث عن مجموعات الاختبارات..." value={query} onChange={setQuery} />
          </div>
          <PillButton onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            إنشاء مجموعة
          </PillButton>
        </div>

        {loading ? <LoadingSkeleton rows={3} /> : error ? <ErrorState message={error} /> : filtered.length === 0 && !query ? <EmptyState message="لا توجد مجموعات اختبارات بعد." /> : (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-right">
            <span className="text-sm text-slate-400">{filtered.length}</span>
            <h2 className="text-2xl font-black text-slate-950">لا يوجد فصل</h2>
          </div>

          <ReferenceTable>
            <ReferenceTableHeader>
              <ReferenceTableRow>
                <ReferenceTableHead>المعرف</ReferenceTableHead>
                <ReferenceTableHead>الاسم</ReferenceTableHead>
                <ReferenceTableHead>الوصف</ReferenceTableHead>
                <ReferenceTableHead>الجدول الزمني</ReferenceTableHead>
                <ReferenceTableHead>الاختبارات</ReferenceTableHead>
                <ReferenceTableHead>الحالة</ReferenceTableHead>
                <ReferenceTableHead>تاريخ الإنشاء</ReferenceTableHead>
                <ReferenceTableHead className="w-[110px]">الإجراءات</ReferenceTableHead>
              </ReferenceTableRow>
            </ReferenceTableHeader>
            <ReferenceTableBody>
              {filtered.map((row) => (
                <React.Fragment key={row.id}>
                  <ReferenceTableRow>
                    <ReferenceTableCell className="font-bold text-slate-700">{row.id}</ReferenceTableCell>
                    <ReferenceTableCell className="font-semibold">{row.name}</ReferenceTableCell>
                    <ReferenceTableCell className="text-slate-400">{row.description}</ReferenceTableCell>
                    <ReferenceTableCell className="text-slate-400">{row.schedule}</ReferenceTableCell>
                    <ReferenceTableCell className="font-semibold">{row.quizzes}</ReferenceTableCell>
                    <ReferenceTableCell>
                      <StatusChip label={row.status} tone="success" />
                    </ReferenceTableCell>
                    <ReferenceTableCell>{row.createdAt}</ReferenceTableCell>
                    <ReferenceTableCell>
                      <button
                        type="button"
                        onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        {expandedRowId === row.id ? 'إغلاق' : 'فتح القائمة'}
                      </button>
                    </ReferenceTableCell>
                  </ReferenceTableRow>
                  {expandedRowId === row.id ? (
                    <ReferenceTableRow>
                      <ReferenceTableCell colSpan={8}>
                        <div className="rounded-[1rem] border border-slate-100 bg-slate-50 p-5 text-right">
                          <h4 className="text-lg font-black text-slate-900">{row.name}</h4>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <span className="text-xs font-semibold text-slate-400">الوصف</span>
                              <p className="mt-1 text-sm text-slate-700">{row.description}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-400">الجدول الزمني</span>
                              <p className="mt-1 text-sm text-slate-700">{row.schedule}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-400">عدد الاختبارات</span>
                              <p className="mt-1 text-sm font-bold text-slate-700">{row.quizzes}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-400">تاريخ الإنشاء</span>
                              <p className="mt-1 text-sm text-slate-700">{row.createdAt}</p>
                            </div>
                          </div>
                        </div>
                      </ReferenceTableCell>
                    </ReferenceTableRow>
                  ) : null}
                </React.Fragment>
              ))}
            </ReferenceTableBody>
          </ReferenceTable>
        </div>
        )}

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-[560px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
              <div className="text-right">
                <h3 className="text-3xl font-black text-slate-950">إنشاء مجموعة اختبارات</h3>
                <p className="mt-2 text-sm text-slate-400">إضافة مجموعة اختبارات جديدة لتنظيم الاختبارات.</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الاسم</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الوصف</label>
                  <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="وصف اختياري" className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الجدول الزمني</label>
                  <Input value={schedule} onChange={(event) => setSchedule(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <label className="text-sm font-semibold text-slate-700">نشط</label>
                  <button
                    type="button"
                    onClick={() => setActive((current) => !current)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${active ? 'bg-[#111111]' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-start gap-3">
                <button type="button" onClick={handleCreate} disabled={creating} className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {creating ? 'جارٍ الإنشاء...' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} disabled={creating} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 disabled:opacity-50">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ReferenceDashboardShell>
  );
}

export function ReferenceQuizzesPage() {
  const locale = useLocale();
  const [items, setItems] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/quizzes');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json.data || json || [];
      const mapped: QuizItem[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id ?? Date.now(),
        title: item.title || '-',
        subject: item.subject_name || item.subject || '-',
        lesson: item.lesson_name || item.class_name || '-',
        dueDate: item.due_date ? new Date(item.due_date).toLocaleDateString('en-US') : (item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : '-'),
        dueTime: item.due_time || '',
        questions: item.questions_count ?? item.total_marks ?? 0,
        maxAttempts: item.max_attempts ?? 3,
        passingRate: item.passing_rate ? `${item.passing_rate}%` : '50%',
        duration: item.duration_minutes ? `${item.duration_minutes} دقيقة` : undefined,
        status: item.status === 'active' ? 'نشط' : item.status === 'draft' ? 'مسودة' : item.status === 'required' ? 'مطلوب' : (item.status || 'مسودة'),
      }));
      setItems(mapped);
    } catch (err) {
      setError('فشل في تحميل الاختبارات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [lesson, setLesson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const filtered = items.filter((item) => [item.title, item.subject, item.lesson].join(' ').toLowerCase().includes(query.toLowerCase()));

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subject_name: subject.trim() || null,
          class_name: lesson.trim() || null,
          due_date: dueDate.trim() || null,
          status: 'draft',
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
      showSaved('تم إنشاء الاختبار بنجاح');
      await fetchQuizzes();
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الاختبار');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((q) => q.id !== id));
      showSaved('تم حذف الاختبار');
    } catch (err: any) {
      setError(err.message || 'فشل في حذف الاختبار');
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (item: QuizItem) => {
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${item.title} (نسخة)`,
          subject_name: item.subject !== '-' ? item.subject : null,
          class_name: item.lesson !== '-' ? item.lesson : null,
          status: 'draft',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      showSaved('تم نسخ الاختبار');
      await fetchQuizzes();
    } catch (err: any) {
      setError(err.message || 'فشل في نسخ الاختبار');
    }
  };

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        <SectionHeading title="الاختبارات" subtitle="إدارة وإنشاء الاختبارات لمواد الدراسة الخاصة بك" />
        {savedMsg ? <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div> : null}
        {error && !loading ? (
          <div className="flex items-center justify-between rounded-[1rem] bg-red-50 px-5 py-3">
            <button type="button" onClick={() => setError(null)} className="text-sm font-bold text-red-400 hover:text-red-600">x</button>
            <span className="text-sm font-semibold text-red-600">{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
            <Tabs dir="ltr" value={view} onValueChange={(value) => setView(value as 'cards' | 'table')}>
              <TabsList className="tabs-pill-active h-auto rounded-[1.1rem] border border-slate-200 bg-[#f4f4f4] p-1">
                <TabsTrigger value="cards" className="rounded-[0.9rem] border border-transparent px-4 py-2 data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:shadow-none">
                  Cards
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-[0.9rem] border border-transparent px-4 py-2 data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:shadow-none">
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchField placeholder="البحث عن الاختبارات..." value={query} onChange={setQuery} />
          </div>

          <PillButton onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            إنشاء اختبار
          </PillButton>
        </div>

        {loading ? <LoadingSkeleton rows={4} /> : error ? <ErrorState message={error} /> : filtered.length === 0 && !query ? <EmptyState message="لا توجد اختبارات بعد." /> : view === 'cards' ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-left text-2xl text-slate-500">...</div>
                <div className="mt-2 text-right">
                  <h3 className="text-2xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.lesson}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <span className="rounded-full border border-slate-200 bg-[#f8f8f8] px-3 py-1.5 text-sm font-bold text-slate-800">
                    تاريخ الاستحقاق: {item.dueDate}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-right text-sm text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>{item.questions}</span>
                    <span>الأسئلة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{item.maxAttempts}</span>
                    <span>الحد الأقصى للمحاولات</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{item.passingRate}</span>
                    <span>درجة النجاح</span>
                  </div>
                  {item.duration ? (
                    <div className="flex items-center justify-between">
                      <span>{item.duration}</span>
                      <span>الوقت المحدد</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span>0</span>
                    <span>المحاولات</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <OutlineButton href={withLocalePrefix(`/dashboard/quizzes/${item.id}/manage`, locale)}>إدارة</OutlineButton>
                  <OutlineButton href={withLocalePrefix(`/dashboard/quizzes/${item.id}/manage`, locale)}>عرض النتائج <FileText className="h-4 w-4" /></OutlineButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ReferenceTable>
            <ReferenceTableHeader>
              <ReferenceTableRow>
                <ReferenceTableHead>العنوان</ReferenceTableHead>
                <ReferenceTableHead>المادة الدراسية</ReferenceTableHead>
                <ReferenceTableHead>الدرس</ReferenceTableHead>
                <ReferenceTableHead>الحالة</ReferenceTableHead>
                <ReferenceTableHead>الموعد النهائي</ReferenceTableHead>
                <ReferenceTableHead>الأسئلة</ReferenceTableHead>
                <ReferenceTableHead>المحاولات</ReferenceTableHead>
                <ReferenceTableHead>الإجراءات</ReferenceTableHead>
              </ReferenceTableRow>
            </ReferenceTableHeader>
            <ReferenceTableBody>
              {filtered.map((item) => (
                <ReferenceTableRow key={item.id}>
                  <ReferenceTableCell className="font-semibold">{item.title}</ReferenceTableCell>
                  <ReferenceTableCell>{item.subject}</ReferenceTableCell>
                  <ReferenceTableCell>{item.lesson}</ReferenceTableCell>
                  <ReferenceTableCell>
                    {item.status === 'مطلوب' ? (
                      <StatusChip label={item.status} tone="danger" />
                    ) : (
                      <span className="text-sm font-semibold text-slate-700">{item.status}</span>
                    )}
                  </ReferenceTableCell>
                  <ReferenceTableCell className="text-sm text-slate-500">
                    {item.dueDate}
                    <div className="mt-1 text-xs text-slate-400">{item.dueTime}</div>
                  </ReferenceTableCell>
                  <ReferenceTableCell className="font-semibold">{item.questions}</ReferenceTableCell>
                  <ReferenceTableCell className="text-sm text-slate-500">
                    0
                    <div className="mt-1 text-xs text-slate-400">الحد الأقصى {item.maxAttempts}</div>
                  </ReferenceTableCell>
                  <ReferenceTableCell>
                    <div className={`flex items-center gap-2 ${deleting === item.id ? 'pointer-events-none opacity-50' : ''}`}>
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => handleDelete(item.id)} />
                      <ActionIcon icon={SquarePen} onClick={() => showSaved('جارٍ فتح محرر الاختبار...')} />
                      <ActionIcon icon={Copy} onClick={() => handleDuplicate(item)} />
                      <Link href={withLocalePrefix(`/dashboard/quizzes/${item.id}/manage`, locale)}>
                        <ActionIcon icon={Eye} />
                      </Link>
                    </div>
                  </ReferenceTableCell>
                </ReferenceTableRow>
              ))}
            </ReferenceTableBody>
          </ReferenceTable>
        )}

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[560px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
              <div className="text-right">
                <h3 className="text-3xl font-black text-slate-950">إنشاء اختبار</h3>
                <p className="mt-2 text-sm text-slate-400">إضافة اختبار جديد للمادة الدراسية المحددة.</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">العنوان</label>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-semibold text-slate-700">المادة الدراسية</label>
                    <Input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-semibold text-slate-700">الدرس</label>
                    <Input value={lesson} onChange={(event) => setLesson(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">تاريخ الاستحقاق</label>
                  <Input value={dueDate} onChange={(event) => setDueDate(event.target.value)} placeholder="10/31/2025" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
              </div>

              <div className="mt-6 flex justify-start gap-3">
                <button type="button" onClick={handleCreate} disabled={creating} className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {creating ? 'جارٍ الإنشاء...' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} disabled={creating} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900 disabled:opacity-50">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ReferenceDashboardShell>
  );
}

export function ReferenceQuizManagePage() {
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editorText, setEditorText] = useState('');
  const [required, setRequired] = useState(false);
  const [questions, setQuestions] = useState<QuizManageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activeQuestion = questions.find((question) => question.id === activeQuestionId) || questions[0];

  useEffect(() => {
    let cancelled = false;
    async function fetchQuizQuestions() {
      setLoading(true);
      setError(null);
      try {
        // Quiz manage page would typically fetch questions for a specific quiz.
        // For now, we initialize with an empty state and let the user add questions.
        // In a real implementation, this would fetch from /api/admin/quizzes/{id}/questions
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('فشل في تحميل الأسئلة');
          setLoading(false);
        }
      }
    }
    fetchQuizQuestions();
    return () => { cancelled = true; };
  }, []);

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const handleSave = useCallback(async () => {
    // Extract quiz ID from the URL path (e.g., /ar/dashboard/quizzes/123/manage)
    const pathParts = window.location.pathname.split('/');
    const manageIdx = pathParts.indexOf('manage');
    const quizId = manageIdx > 0 ? pathParts[manageIdx - 1] : null;

    if (!quizId) {
      showSaved('لم يتم العثور على معرف الاختبار');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quizId,
          title: title || undefined,
          description: description || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      showSaved('تم الحفظ بنجاح');
    } catch (err: any) {
      setSavedMsg(null);
      setError(err.message || 'فشل في حفظ الاختبار');
    } finally {
      setSaving(false);
    }
  }, [title, description, showSaved]);

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        {savedMsg ? <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div> : null}
        {error ? <div className="rounded-[1rem] bg-red-50 px-5 py-3 text-right text-sm font-semibold text-red-600">{error}</div> : null}
        <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => showSaved('جارٍ فتح إعدادات الاختبار...')} className="h-12 rounded-full border-slate-200 bg-white px-5">
                <Settings className="ml-2 h-4 w-4" />
                إعدادات الاختبار
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85 disabled:opacity-50">
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </Button>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-3">
                <Link href="/ar/dashboard/quizzes" className="text-sm font-semibold text-slate-600">
                  رجوع
                </Link>
                <h1 className="text-[2.15rem] font-black text-slate-950">تمرين كهربية ساكنة</h1>
              </div>
              <p className="mt-2 text-sm text-slate-400">إدارة إعدادات الاختبار والأسئلة وعرض التقديمات</p>
            </div>
          </div>
        </div>

        {loading ? <LoadingSkeleton rows={2} /> : error ? <ErrorState message={error} /> : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="relative">
                <select defaultValue={activeQuestion?.fileType || 'تحميل ملف'} className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 pl-10 text-sm text-slate-700 outline-none">
                  <option>تحميل ملف</option>
                </select>
              </div>
              <h2 className="text-2xl font-black text-slate-950">سؤال {activeQuestion?.id || 1}</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-700">عنوان السؤال *</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>

              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-700">وصف السؤال</label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="أدخل تفاصيل إضافية أو تعليمات للسؤال..." className="min-h-[90px] rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>

              <div className="space-y-2 text-right">
                <label className="text-sm font-semibold text-slate-700">محتوى النص المنسق</label>
                <div className="overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-end gap-1 border-b border-slate-200 px-3 py-2">
                    {['B', 'I', 'U'].map((item) => (
                      <button key={item} type="button" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        {item}
                      </button>
                    ))}
                    <div className="mx-2 h-5 w-px bg-slate-200" />
                    <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">≣</button>
                    <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">•</button>
                    <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">🔗</button>
                    <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">𝑇x</button>
                  </div>
                  <Textarea
                    value={editorText}
                    onChange={(event) => setEditorText(event.target.value)}
                    placeholder="أدخل محتوى النص المنسق هنا..."
                    className="min-h-[90px] resize-none border-0 bg-transparent text-right shadow-none focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-slate-400">قم بتنسيق سؤالك باستخدام النص المنسق. سيتم عرض هذا للطالب.</p>
              </div>

              <div className="space-y-3 text-right">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="h-4 w-4" />
                  صورة السؤال (اختياري)
                </label>

                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-8 text-center">
                  <UploadCloud className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <p className="text-sm text-slate-500">ستطلب من الطالب تحميل ملف لهذا السؤال</p>
                  <p className="mt-2 text-xs text-slate-400">أنواع الملفات المسموحة (اختياري)</p>
                  <Input placeholder="مثال: pdf, jpg, docx" className="mt-4 h-11 rounded-xl border-slate-200 bg-white text-right" />
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRequired((current) => !current)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${required ? 'bg-[#111111]' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${required ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>

                  <div className="text-right">
                    <h3 className="text-xl font-black text-slate-950">الإعدادات</h3>
                    <p className="mt-2 text-sm text-slate-400">مطلوب</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <PillButton onClick={() => {
                const newId = (questions[questions.length - 1]?.id || 0) + 1;
                setQuestions((prev) => [...prev, { id: newId, title: `سؤال ${newId}`, fileType: 'تحميل ملف' }]);
                setActiveQuestionId(newId);
                setTitle(`سؤال ${newId}`);
              }}>
                <Plus className="h-4 w-4" />
                إضافة
              </PillButton>
              <div className="text-right">
                <h2 className="text-2xl font-black text-slate-950">الأسئلة</h2>
                <p className="text-sm text-slate-400">سؤال 2</p>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((question) => {
                const active = question.id === activeQuestionId;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      setActiveQuestionId(question.id);
                      setTitle(question.title);
                    }}
                    className={`w-full rounded-[1.2rem] border p-4 text-right shadow-sm transition ${
                      active ? 'border-slate-500 bg-white' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Trash2 className="mt-1 h-4 w-4 text-slate-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                          <span>{question.id}</span>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-700">{question.fileType}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-800">{question.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </div>
    </ReferenceDashboardShell>
  );
}
