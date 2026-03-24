'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, LayoutGrid, Pencil, Search, Trash2, Users, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CatalogScope = 'courses' | 'bundles' | 'teacherCourses' | 'categories';

type CatalogCard = {
  id: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  teacher: string;
  students: number;
  lessons: number;
  fee: string;
  status: { ar: string; en: string };
  statusClassName: string;
};

const catalogMeta: Record<
  CatalogScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof BookOpen;
  }
> = {
  courses: {
    hero: { ar: 'إدارة المواد والدورات', en: 'Courses workspace' },
    helper: { ar: 'عرض الدورات المنشورة والمسودات بنفس كثافة المرجع.', en: 'Review published and draft courses with reference-like density.' },
    createLabel: { ar: 'دورة جديدة', en: 'New course' },
    icon: BookOpen,
  },
  bundles: {
    hero: { ar: 'الفصول والحزم النشطة', en: 'Bundles workspace' },
    helper: { ar: 'تجميع الفصول، الطاقة الاستيعابية، والمعلم المسؤول.', en: 'Track bundles, capacity, and assigned teachers.' },
    createLabel: { ar: 'فصل جديد', en: 'New bundle' },
    icon: CalendarDays,
  },
  teacherCourses: {
    hero: { ar: 'مسارات المعلم', en: 'Teacher courses' },
    helper: { ar: 'واجهة خاصة بمسارات التدريس الحالية ونشاطها.', en: 'Teacher-facing view of active teaching tracks and load.' },
    createLabel: { ar: 'إسناد مسار', en: 'Assign track' },
    icon: LayoutGrid,
  },
  categories: {
    hero: { ar: 'تصنيفات المحتوى والمراحل', en: 'Categories workspace' },
    helper: { ar: 'إدارة التصنيفات الأكاديمية ومجموعات الفصول والمسارات المرتبطة بها.', en: 'Manage academic categories, bundle groups, and linked tracks.' },
    createLabel: { ar: 'تصنيف جديد', en: 'New category' },
    icon: LayoutGrid,
  },
};

const apiEndpointByScope: Record<CatalogScope, string> = {
  courses: '/api/courses',
  bundles: '/api/admin/bundles',
  teacherCourses: '/api/courses',
  categories: '/api/admin/categories',
};

function mapApiToCatalogCard(item: Record<string, unknown>, scope: CatalogScope): CatalogCard {
  const id = String(item.id || '');
  const nameAr = String(item.name_ar || item.name || item.title || '');
  const nameEn = String(item.name_en || item.name || item.title || '');
  const descAr = String(item.description_ar || item.grade_name || item.description || '');
  const descEn = String(item.description_en || item.grade_name || item.description || '');
  const teacher = String(item.teacher_name || item.teacher || '');
  const students = Number(item.student_count || item.students || item.enrollment_count || 0);
  const lessons = Number(item.lesson_count || item.lessons || 0);
  const fee = item.fee ? `AED ${item.fee}` : item.price ? `AED ${item.price}` : '-';
  const isPublished = item.is_published === true || item.status === 'published' || item.status === 'active';

  if (scope === 'categories') {
    return {
      id,
      title: { ar: nameAr, en: nameEn },
      subtitle: { ar: descAr, en: descEn },
      teacher: '-',
      students,
      lessons,
      fee: '-',
      status: isPublished ? { ar: 'نشط', en: 'Active' } : { ar: 'مراجعة', en: 'Review' },
      statusClassName: isPublished ? 'bg-[#edfdf3] text-[#15803d]' : 'bg-[#fff7ed] text-[#c2410c]',
    };
  }

  return {
    id,
    title: { ar: nameAr, en: nameEn },
    subtitle: { ar: descAr, en: descEn },
    teacher,
    students,
    lessons,
    fee: String(fee),
    status: isPublished ? { ar: 'منشور', en: 'Published' } : { ar: 'مسودة', en: 'Draft' },
    statusClassName: isPublished ? 'bg-[#edfdf3] text-[#15803d]' : 'bg-[#eef2ff] text-[#4338ca]',
  };
}

export default function ReferenceCatalogWorkspace({ scope }: { scope: CatalogScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = catalogMeta[scope];
  const [rows, setRows] = useState<CatalogCard[]>([]);
  const [rawCategories, setRawCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  // Category CRUD state
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormNameEn, setCatFormNameEn] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);
  const [catDeleting, setCatDeleting] = useState(false);

  const showNoticeTyped = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotice(message);
    setNoticeType(type);
    window.setTimeout(() => setNotice(null), 3000);
  }, []);

  const fetchRows = useCallback(() => {
    setLoading(true);
    fetch(apiEndpointByScope[scope])
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.courses || data?.bundles || data?.categories || [];
        if (scope === 'categories') setRawCategories(items);
        setRows(items.map((item: Record<string, unknown>) => mapApiToCatalogCard(item, scope)));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [scope]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Category CRUD handlers
  const openCatCreateForm = useCallback(() => {
    setCatEditId(null);
    setCatFormName('');
    setCatFormNameEn('');
    setCatFormDesc('');
    setCatFormOpen(true);
  }, []);

  const openCatEditForm = useCallback((id: string) => {
    const raw = rawCategories.find((c) => String(c.id) === id);
    setCatEditId(id);
    setCatFormName(String(raw?.name_ar || raw?.name || ''));
    setCatFormNameEn(String(raw?.name_en || ''));
    setCatFormDesc(String(raw?.description || ''));
    setCatFormOpen(true);
  }, [rawCategories]);

  const closeCatForm = useCallback(() => {
    setCatFormOpen(false);
    setCatEditId(null);
    setCatFormName('');
    setCatFormNameEn('');
    setCatFormDesc('');
  }, []);

  const submitCatForm = useCallback(async () => {
    if (!catFormName.trim()) {
      showNoticeTyped(isArabic ? 'اسم التصنيف مطلوب.' : 'Category name is required.', 'error');
      return;
    }
    setCatSubmitting(true);
    try {
      const isEdit = catEditId !== null;
      const endpoint = '/api/admin/categories';
      const payload: Record<string, string> = isEdit
        ? { id: catEditId, name_ar: catFormName.trim(), name_en: catFormNameEn.trim() || catFormName.trim() }
        : { name_ar: catFormName.trim(), name_en: catFormNameEn.trim() || catFormName.trim() };
      if (catFormDesc.trim()) payload.description = catFormDesc.trim();

      const res = await fetch(endpoint, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        showNoticeTyped(result?.error || (isArabic ? 'حدث خطأ أثناء الحفظ.' : 'An error occurred while saving.'), 'error');
        return;
      }
      showNoticeTyped(
        isEdit
          ? (isArabic ? 'تم تحديث التصنيف بنجاح.' : 'Category updated successfully.')
          : (isArabic ? 'تم إنشاء التصنيف بنجاح.' : 'Category created successfully.'),
        'success',
      );
      closeCatForm();
      fetchRows();
    } catch {
      showNoticeTyped(isArabic ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.', 'error');
    } finally {
      setCatSubmitting(false);
    }
  }, [catEditId, catFormName, catFormNameEn, catFormDesc, isArabic, showNoticeTyped, closeCatForm, fetchRows]);

  const confirmDeleteCat = useCallback(async (id: string) => {
    setCatDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) {
        showNoticeTyped(result?.error || (isArabic ? 'فشل حذف التصنيف.' : 'Failed to delete category.'), 'error');
        return;
      }
      showNoticeTyped(isArabic ? 'تم حذف التصنيف بنجاح.' : 'Category deleted successfully.', 'success');
      setCatDeleteConfirm(null);
      fetchRows();
    } catch {
      showNoticeTyped(isArabic ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.', 'error');
    } finally {
      setCatDeleting(false);
    }
  }, [isArabic, showNoticeTyped, fetchRows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.subtitle.ar, row.subtitle.en, row.teacher]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'live' && (row.status.en === 'Published' || row.status.en === 'Active')) ||
        (filter === 'draft' && row.status.en !== 'Published' && row.status.en !== 'Active');

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const showNotice = (message: string) => {
    setNotice(message);
    setNoticeType('success');
    window.setTimeout(() => setNotice(null), 2500);
  };

  const totalStudents = rows.reduce((total, row) => total + row.students, 0);
  const totalLessons = rows.reduce((total, row) => total + row.lessons, 0);
  const summaryCards =
    scope === 'categories'
      ? [
          [isArabic ? 'إجمالي التصنيفات' : 'Total categories', rows.length, 'bg-[#eef4ff] text-[#2563eb]'],
          [isArabic ? 'الدورات المرتبطة' : 'Linked courses', totalStudents, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'الفصول المرتبطة' : 'Linked bundles', totalLessons, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'التصنيفات النشطة' : 'Active categories', rows.filter((row) => row.status.en === 'Published' || row.status.en === 'Active').length, 'bg-[#f5f3ff] text-[#7c3aed]'],
        ]
      : [
          [isArabic ? 'إجمالي المسارات' : 'Total tracks', rows.length, 'bg-[#eef4ff] text-[#2563eb]'],
          [isArabic ? 'الطلاب' : 'Students', totalStudents, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'الدروس' : 'Lessons', totalLessons, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'المسارات النشطة' : 'Live tracks', rows.filter((row) => row.status.en === 'Published' || row.status.en === 'Active').length, 'bg-[#f5f3ff] text-[#7c3aed]'],
        ];

  const statLabels =
    scope === 'categories'
      ? {
          first: isArabic ? 'الدورات' : 'Courses',
          second: isArabic ? 'الفصول' : 'Bundles',
          third: isArabic ? 'القواعد' : 'Rules',
        }
      : {
          first: isArabic ? 'الطلاب' : 'Students',
          second: isArabic ? 'الدروس' : 'Lessons',
          third: isArabic ? 'الرسوم' : 'Fee',
        };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#2563eb]">
                <meta.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">{meta.hero[isArabic ? 'ar' : 'en']}</h2>
                <p className="mt-1 text-sm text-slate-500">{meta.helper[isArabic ? 'ar' : 'en']}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-300"
                onClick={() => showNotice(isArabic ? 'تم تجهيز تقرير العرض.' : 'View report prepared.')}
              >
                {isArabic ? 'عرض التقرير' : 'View report'}
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
                onClick={() =>
                  scope === 'categories'
                    ? openCatCreateForm()
                    : showNotice(
                        isArabic ? `تم فتح نموذج ${meta.createLabel.ar}.` : `${meta.createLabel.en} form opened.`,
                      )
                }
              >
                {meta.createLabel[isArabic ? 'ar' : 'en']}
              </Button>
            </div>
          </div>

          {notice ? (
            <div className={`mt-4 rounded-[1.3rem] border px-4 py-3 text-sm ${
              noticeType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}>
              {notice}
            </div>
          ) : null}

          {/* Category Create/Edit Form */}
          {scope === 'categories' && catFormOpen ? (
            <div className="mt-4 rounded-[1.75rem] border border-blue-200 bg-blue-50/50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {catEditId
                    ? (isArabic ? 'تعديل التصنيف' : 'Edit category')
                    : (isArabic ? 'إنشاء تصنيف جديد' : 'Create new category')}
                </h3>
                <button type="button" onClick={closeCatForm} className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    {isArabic ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                  </label>
                  <Input
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    placeholder={isArabic ? 'مثال: الصف الأول' : 'e.g. Grade 1'}
                    className="h-11 rounded-xl border-slate-200 bg-white"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    {isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}
                  </label>
                  <Input
                    value={catFormNameEn}
                    onChange={(e) => setCatFormNameEn(e.target.value)}
                    placeholder={isArabic ? 'مثال: Grade 1' : 'e.g. Grade 1'}
                    className="h-11 rounded-xl border-slate-200 bg-white"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'الوصف (اختياري)' : 'Description (optional)'}
                </label>
                <Input
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  placeholder={isArabic ? 'وصف قصير للتصنيف' : 'Short description'}
                  className="h-11 rounded-xl border-slate-200 bg-white"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
                  disabled={catSubmitting}
                  onClick={submitCatForm}
                >
                  {catSubmitting
                    ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
                    : catEditId
                      ? (isArabic ? 'حفظ التعديلات' : 'Save changes')
                      : (isArabic ? 'إنشاء التصنيف' : 'Create category')}
                </Button>
                <Button type="button" variant="outline" className="rounded-full border-slate-300" onClick={closeCatForm}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Category Delete Confirmation */}
          {scope === 'categories' && catDeleteConfirm ? (
            <div className="mt-4 rounded-[1.75rem] border border-red-200 bg-red-50/50 p-5">
              <h3 className="text-lg font-bold text-red-800">
                {isArabic ? 'تأكيد الحذف' : 'Confirm deletion'}
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {isArabic
                  ? 'هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this category? This action cannot be undone.'}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  className="rounded-full bg-red-600 hover:bg-red-700"
                  disabled={catDeleting}
                  onClick={() => confirmDeleteCat(catDeleteConfirm)}
                >
                  {catDeleting ? (isArabic ? 'جارٍ الحذف...' : 'Deleting...') : (isArabic ? 'نعم، حذف' : 'Yes, delete')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => setCatDeleteConfirm(null)}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-[1.6rem] bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isArabic ? 'ابحث بالعنوان أو المعلم' : 'Search by title or teacher'}
                className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['all', isArabic ? 'الكل' : 'All'],
                ['live', isArabic ? 'نشط' : 'Live'],
                ['draft', isArabic ? 'مسودات' : 'Draft'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as 'all' | 'live' | 'draft')}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    filter === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-48 animate-pulse rounded-[1.75rem] bg-slate-100" />
                ))}
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                {isArabic ? 'لا توجد بيانات حالياً.' : 'No data available.'}
              </div>
            ) : null}
            {filteredRows.map((row) => (
              <article key={row.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{row.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-2 text-sm text-slate-500">{row.subtitle[isArabic ? 'ar' : 'en']}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      {isArabic ? 'المعلم:' : 'Teacher:'} {row.teacher}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                    {row.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.first}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.students}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.second}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.lessons}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-400">{statLabels.third}</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.fee}</p>
                    </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-400">{isArabic ? 'حالة النشر' : 'Status'}</p>
                    <p className="mt-2 font-semibold text-slate-900">{row.status[isArabic ? 'ar' : 'en']}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {scope === 'categories' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-300"
                        onClick={() => openCatEditForm(row.id)}
                      >
                        <Pencil className="me-1.5 h-3.5 w-3.5" />
                        {isArabic ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setCatDeleteConfirm(row.id)}
                      >
                        <Trash2 className="me-1.5 h-3.5 w-3.5" />
                        {isArabic ? 'حذف' : 'Delete'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-300"
                        onClick={() =>
                          showNotice(
                            isArabic ? `تم فتح عرض ${row.title.ar}.` : `${row.title.en} preview opened.`,
                          )
                        }
                      >
                        {isArabic ? 'معاينة' : 'Preview'}
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full bg-slate-950 hover:bg-slate-800"
                        onClick={() =>
                          showNotice(
                            isArabic ? `تم فتح إعدادات ${row.title.ar}.` : `${row.title.en} settings opened.`,
                          )
                        }
                      >
                        {isArabic ? 'الإعدادات' : 'Settings'}
                      </Button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">
            {isArabic ? 'ملخص التشغيل' : 'Operations summary'}
          </h2>
          <div className="mt-5 space-y-3">
            {[
              [isArabic ? 'المقاعد المشغولة' : 'Occupied seats', `${totalStudents}`],
              [isArabic ? 'الدروس المجدولة' : 'Scheduled lessons', `${totalLessons}`],
              [isArabic ? 'المعلمين المرتبطين' : 'Assigned teachers', `${new Set(rows.map((row) => row.teacher)).size}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4 text-[#2563eb]" />
              {isArabic ? 'إشارات سريعة' : 'Quick notes'}
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
              <li>{isArabic ? 'مراجعة الطاقة الاستيعابية قبل فتح تسجيل جديد.' : 'Review capacity before opening new enrollment.'}</li>
              <li>{isArabic ? 'تحقق من المسودات غير المنشورة هذا الأسبوع.' : 'Check unpublished drafts this week.'}</li>
              <li>{isArabic ? 'وازن توزيع المعلمين بين الحزم النشطة.' : 'Balance teacher allocation across active bundles.'}</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
