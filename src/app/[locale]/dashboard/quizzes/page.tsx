'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Search, Plus, FileText, Pencil, Trash2, CheckCircle2, Clock, Filter, Eye } from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { ReferenceTable, ReferenceTableHeader, ReferenceTableBody, ReferenceTableRow, ReferenceTableHead, ReferenceTableCell } from '@/components/admin/ReferenceTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuizRecord {
  id: string;
  title: string;
  bundle: string;
  questions: number;
  duration: number; // in minutes
  dueDate: string;
  status: 'published' | 'draft' | 'closed';
  submissions: number;
}

const mockQuizzes: QuizRecord[] = [
  {
    id: 'q1',
    title: 'اختبار نصف الفصل الدراسي - لغة عربية',
    bundle: 'الصف السادس',
    questions: 20,
    duration: 60,
    dueDate: '2026-04-15',
    status: 'published',
    submissions: 45
  },
  {
    id: 'q2',
    title: 'تقييم وحدة الرياضيات الأولى',
    bundle: 'الصف الرابع',
    questions: 15,
    duration: 45,
    dueDate: '2026-03-20',
    status: 'closed',
    submissions: 120
  },
  {
    id: 'q3',
    title: 'امتحان تجريبي لقواعد النحو',
    bundle: 'الصف السادس',
    questions: 10,
    duration: 30,
    dueDate: '2026-05-01',
    status: 'draft',
    submissions: 0
  }
];

export default function DashboardQuizzesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [quizzes, setQuizzes] = useState<QuizRecord[]>(mockQuizzes);
  const [query, setQuery] = useState('');

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q =>
      q.title.toLowerCase().includes(query.toLowerCase()) ||
      q.bundle.toLowerCase().includes(query.toLowerCase())
    );
  }, [quizzes, query]);

  const getStatusMeta = (status: QuizRecord['status']) => {
    switch (status) {
      case 'published':
        return { label: isArabic ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
      case 'draft':
        return { label: isArabic ? 'مسودة' : 'Draft', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
      case 'closed':
        return { label: isArabic ? 'مغلق' : 'Closed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
    }
  };

  const pageTitle = isArabic ? 'الاختبارات' : 'Quizzes';
  const pageSubtitle = isArabic ? 'إدارة وإنشاء الاختبارات لمواد الدراسة الخاصة بك' : 'Manage and create quizzes for your courses';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h2>
              <p className="text-muted-foreground mt-2">{pageSubtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl h-12 px-5 font-semibold">
                <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {isArabic ? 'اختبار جديد' : 'New Quiz'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{isArabic ? 'إجمالي الاختبارات' : 'Total Quizzes'}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{quizzes.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{isArabic ? 'الاختبارات النشطة' : 'Active Quizzes'}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{quizzes.filter(q => q.status === 'published').length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{isArabic ? 'إجمالي التسليمات' : 'Total Submissions'}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{quizzes.reduce((acc, q) => acc + q.submissions, 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-xl font-semibold leading-none tracking-tight dark:text-white">
                {isArabic ? 'قائمة الاختبارات' : 'Quiz List'}
              </h3>
            </div>

            <div className="p-6 pt-0">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative flex-1 w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
                  <Input
                    type="text"
                    placeholder={isArabic ? 'البحث عن اختبار...' : 'Search quizzes...'}
                    className="pl-8 rtl:pl-3 rtl:pr-8 bg-transparent"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="h-10 px-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">{isArabic ? 'تصفية' : 'Filter'}</span>
                  </Button>
                </div>
              </div>

              {!filteredQuizzes.length ? (
                <EmptyState
                  icon={FileText}
                  title={isArabic ? 'لا توجد اختبارات' : 'No quizzes found'}
                  description={isArabic ? 'لم يتم العثور على أي اختبار يطابق بحثك.' : 'No quiz matches your search criteria.'}
                />
              ) : (
                <div className="rounded-md border overflow-hidden dark:border-gray-800">
                  <ReferenceTable>
                    <ReferenceTableHeader>
                      <ReferenceTableRow>
                        <ReferenceTableHead>{isArabic ? 'عنوان الاختبار' : 'Title'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'المادة/الفصل' : 'Bundle'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'المدة' : 'Duration'}</ReferenceTableHead>
                        <ReferenceTableHead className="text-center">{isArabic ? 'التسليمات' : 'Submissions'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الحالة' : 'Status'}</ReferenceTableHead>
                        <ReferenceTableHead className="text-left rtl:text-right w-[120px]">{isArabic ? 'الإجراءات' : 'Actions'}</ReferenceTableHead>
                      </ReferenceTableRow>
                    </ReferenceTableHeader>
                    <ReferenceTableBody>
                      {filteredQuizzes.map((quiz) => {
                        const statusMeta = getStatusMeta(quiz.status);

                        return (
                          <ReferenceTableRow key={quiz.id}>
                            <ReferenceTableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground dark:text-gray-200">{quiz.title}</span>
                                <span className="text-xs text-muted-foreground mt-1">{quiz.questions} {isArabic ? 'أسئلة' : 'questions'}</span>
                              </div>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground">
                              {quiz.bundle}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground text-sm">
                              {new Date(quiz.dueDate).toLocaleDateString(isArabic ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="font-medium text-slate-700 dark:text-slate-300">
                              {quiz.duration} <span className="text-xs font-normal text-slate-500">{isArabic ? 'دقيقة' : 'min'}</span>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-center font-semibold text-blue-600 dark:text-blue-400">
                              {quiz.submissions}
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta.color} bg-opacity-10 text-opacity-90 border-transparent`}>
                                {statusMeta.label}
                              </span>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-left rtl:text-right">
                              <div className="flex items-center gap-2 rtl:justify-start ltr:justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <Eye className="h-4 w-4 text-slate-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <Pencil className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </ReferenceTableCell>
                          </ReferenceTableRow>
                        );
                      })}
                    </ReferenceTableBody>
                  </ReferenceTable>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
