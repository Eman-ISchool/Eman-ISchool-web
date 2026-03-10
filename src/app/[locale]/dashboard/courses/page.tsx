'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  Eye,
  Grid2x2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Video,
  List,
  Radio,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ViewMode = 'cards' | 'table';

interface CourseRecord {
  id: string;
  title: string;
  instructor: string;
  bundle: string;
  description: string;
  lessons: number;
  status: 'published' | 'draft';
}

const initialCourses: CourseRecord[] = [
  {
    id: 'course-1',
    title: 'Basics',
    instructor: 'أ. رحمة خليل',
    bundle: 'برنامج التأسيس للأطفال',
    description: 'تدريب تمهيدي للقراءة والكتابة وبناء المهارات الأولى.',
    lessons: 12,
    status: 'published',
  },
  {
    id: 'course-2',
    title: 'Phonatics',
    instructor: 'أ. رحمة خليل',
    bundle: 'برنامج التأسيس للأطفال',
    description: 'تركيز على أصوات الحروف والتكرار الصوتي والمفردات الأساسية.',
    lessons: 10,
    status: 'published',
  },
  {
    id: 'course-3',
    title: 'المعلم الإلكتروني',
    instructor: 'د. رحمة خليل',
    bundle: 'كورس المعلم الإلكتروني',
    description: 'وحدة تشغيلية مخصصة لمتابعة المحتوى والدروس والأنشطة الصفية.',
    lessons: 18,
    status: 'published',
  },
];

const emptyCardIds = ['empty-1', 'empty-2', 'empty-3'];

export default function DashboardCoursesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [courses, setCourses] = useState(initialCourses);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [previewCourse, setPreviewCourse] = useState<CourseRecord | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<CourseRecord | null>(null);
  const [draftCourse, setDraftCourse] = useState<CourseRecord>({
    id: '',
    title: '',
    instructor: '',
    bundle: '',
    description: '',
    lessons: 8,
    status: 'draft',
  });

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) =>
      [course.title, course.instructor, course.bundle, course.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [courses, query]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setShowFormModal(true);
    setDraftCourse({
      id: '',
      title: '',
      instructor: '',
      bundle: '',
      description: '',
      lessons: 8,
      status: 'draft',
    });
  };

  const openEditModal = (course: CourseRecord) => {
    setEditingCourse(course);
    setShowFormModal(true);
    setDraftCourse(course);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCourse(null);
    setDraftCourse({
      id: '',
      title: '',
      instructor: '',
      bundle: '',
      description: '',
      lessons: 8,
      status: 'draft',
    });
  };

  const showTemporaryNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CourseRecord = {
      ...draftCourse,
      id: editingCourse?.id || `course-${Date.now()}`,
    };

    if (editingCourse) {
      setCourses((current) => current.map((course) => (course.id === editingCourse.id ? payload : course)));
      showTemporaryNotice(isArabic ? 'تم تحديث المادة الدراسية.' : 'Course updated.');
    } else {
      setCourses((current) => [payload, ...current]);
      showTemporaryNotice(isArabic ? 'تم إنشاء مادة دراسية جديدة.' : 'Course created.');
    }

    closeFormModal();
  };

  const handleDelete = () => {
    if (!deleteCourse) {
      return;
    }

    setCourses((current) => current.filter((course) => course.id !== deleteCourse.id));
    setDeleteCourse(null);
    showTemporaryNotice(isArabic ? 'تم حذف المادة الدراسية.' : 'Course deleted.');
  };

  const pageTitle = isArabic ? 'المواد الدراسية' : 'Courses';
  const pageSubtitle = isArabic ? 'إدارة والوصول إلى المواد الدراسية' : 'Manage and access courses';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground text-slate-500">{pageSubtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder={isArabic ? 'بحث' : 'Search'}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 rtl:pl-3 rtl:pr-8"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <input type="file" accept=".csv" className="hidden" />
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2"
              onClick={() => showTemporaryNotice('dashboard.courses.actions.import')}
            >
              <Upload className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isArabic ? 'استيراد' : 'Import'}
            </Button>
            <Button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isArabic ? 'مادة جديدة' : 'New course'}
            </Button>
          </div>

          {notice ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-6">
              {notice}
            </div>
          ) : null}

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden border-slate-200 bg-white"
              >
                <div className="h-40 bg-cover bg-center bg-gray-100 dark:bg-gray-800" style={{ backgroundImage: 'none' }}>
                  <div className="h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold tracking-tight text-xl">{course.title}</h3>
                  </div>
                </div>

                <div className="p-6 pt-0 pb-2">
                  <div className="space-y-3 shrink-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-800">{course.instructor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground text-slate-500">{course.bundle}</span>
                    </div>
                  </div>
                </div>

                <div className="items-center p-6 flex justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewCourse(course)}
                    >
                      <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                  </div>

                  <div className="flex gap-2 text-slate-500">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                      onClick={() => openEditModal(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => setDeleteCourse(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCourses.length === courses.length
              ? emptyCardIds.map((id) => (
                <div key={id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden border-dashed border-slate-200 bg-white">
                  <div className="h-full min-h-[300px] flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600">
                    <BookOpen className="h-12 w-12" />
                  </div>
                </div>
              ))
              : null}
          </section>
        </div>
      </div>

      {showFormModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="text-right">
                <h2 className="text-2xl font-black text-slate-950">
                  {editingCourse
                    ? isArabic
                      ? 'تعديل المادة الدراسية'
                      : 'Edit course'
                    : isArabic
                      ? 'إنشاء مادة دراسية'
                      : 'Create course'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isArabic ? 'مطابقة عملية لبنية النموذج الظاهرة في المرجع.' : 'A reference-style course form.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{isArabic ? 'اسم المادة' : 'Course name'}</Label>
                  <Input
                    required
                    value={draftCourse.title}
                    onChange={(event) => setDraftCourse((current) => ({ ...current, title: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{isArabic ? 'المدرس' : 'Instructor'}</Label>
                  <Input
                    required
                    value={draftCourse.instructor}
                    onChange={(event) => setDraftCourse((current) => ({ ...current, instructor: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{isArabic ? 'الفصل' : 'Bundle'}</Label>
                  <Input
                    required
                    value={draftCourse.bundle}
                    onChange={(event) => setDraftCourse((current) => ({ ...current, bundle: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{isArabic ? 'عدد الدروس' : 'Lessons'}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={draftCourse.lessons}
                    onChange={(event) =>
                      setDraftCourse((current) => ({
                        ...current,
                        lessons: Number(event.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{isArabic ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={draftCourse.description}
                  onChange={(event) => setDraftCourse((current) => ({ ...current, description: event.target.value }))}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeFormModal}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {previewCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-950">{previewCourse.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{previewCourse.description}</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>{previewCourse.instructor}</span>
                <span>{isArabic ? 'المدرس' : 'Instructor'}</span>
              </div>
              <div className="flex justify-between">
                <span>{previewCourse.bundle}</span>
                <span>{isArabic ? 'الفصل' : 'Bundle'}</span>
              </div>
              <div className="flex justify-between">
                <span>{previewCourse.lessons}</span>
                <span>{isArabic ? 'الدروس' : 'Lessons'}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setPreviewCourse(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isArabic ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-950">{isArabic ? 'حذف المادة الدراسية' : 'Delete course'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isArabic
                ? `هل أنت متأكد من حذف "${deleteCourse.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Delete "${deleteCourse.title}"? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDeleteCourse(null)}>
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="button" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDelete}>
                {isArabic ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ReferenceDashboardShell>
  );
}
