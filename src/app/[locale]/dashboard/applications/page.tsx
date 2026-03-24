'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Download, Printer, Filter } from 'lucide-react';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Table as ReferenceTable, TableHeader as ReferenceTableHeader, TableBody as ReferenceTableBody, TableRow as ReferenceTableRow, TableHead as ReferenceTableHead, TableCell as ReferenceTableCell } from '@/components/admin/ReferenceTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ApplicationRecord,
  filterDashboardApplications,
  getApplicationStatusMeta,
} from '@/lib/dashboard-applications';
import { withLocalePrefix } from '@/lib/locale-path';

const PAGE_SIZE = 10;

export default function DashboardApplicationsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [grade, setGrade] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/enrollment-applications', { cache: 'no-store' });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load applications');
        }

        if (active) {
          setApplications(payload.applications || []);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : isArabic
                ? 'تعذر تحميل الطلبات.'
                : 'Unable to load applications.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [isArabic]);

  const filteredApplications = useMemo(() => {
    return filterDashboardApplications(applications, {
      query,
      status,
      grade,
      fromDate: '',
      toDate: '',
    });
  }, [applications, grade, query, status]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const currentPageItems = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, status, grade]);

  const pageTitle = isArabic ? 'الطلبات' : 'Applications';
  const pageSubtitle = isArabic ? 'إدارة ومتابعة الطلبات' : 'Manage and track applications';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-2">{pageSubtitle}</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight dark:text-white">
                {pageTitle}
              </h3>
            </div>

            <div className="p-6 pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
                    <Input
                      type="text"
                      placeholder={isArabic ? 'بحث باسم الطالب أو ولي الأمر...' : 'Search student or guardian...'}
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
                    <Button variant="outline" className="h-10 px-4 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">{isArabic ? 'تصدير' : 'Export'}</span>
                    </Button>
                    <Button variant="outline" className="h-10 px-4 flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      <span className="hidden sm:inline">{isArabic ? 'طباعة' : 'Print'}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 text-center">
                  <p className="text-lg font-bold mb-2">{isArabic ? 'تعذر تحميل الطلبات' : 'Unable to load applications'}</p>
                  <p className="text-sm mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              ) : !currentPageItems.length ? (
                <EmptyState
                  icon={<Search className="h-6 w-6 text-slate-400" />}
                  title={isArabic ? 'لا توجد نتائج' : 'No results found'}
                  description={isArabic ? 'عدّل مصطلحات البحث الخاصة بك.' : 'Adjust your search terms.'}
                />
              ) : (
                <div className="rounded-md border overflow-hidden dark:border-gray-800">
                  <ReferenceTable>
                    <ReferenceTableHeader>
                      <ReferenceTableRow>
                        <ReferenceTableHead>{isArabic ? 'رقم الطلب' : 'ID'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الطالب' : 'Student'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'ولي الأمر' : 'Guardian'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الفصل الدراسي' : 'Bundle'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'وقت التقديم' : 'Applied At'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الرسوم' : 'Total Fees'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الحالة' : 'Status'}</ReferenceTableHead>
                        <ReferenceTableHead className="text-left rtl:text-right w-[100px]">{isArabic ? 'الإجراءات' : 'Actions'}</ReferenceTableHead>
                      </ReferenceTableRow>
                    </ReferenceTableHeader>
                    <ReferenceTableBody>
                      {currentPageItems.map((application) => {
                        const statusDetails = getApplicationStatusMeta(application.status, isArabic);

                        return (
                          <ReferenceTableRow key={application.id}>
                            <ReferenceTableCell className="font-medium text-blue-600 dark:text-blue-400">
                              #{application.id.slice(0, 6)}
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <div className="flex flex-col">
                                <span className="font-medium dark:text-gray-200">{application.student_details?.name || '-'}</span>
                                <span className="text-xs text-muted-foreground">{application.student_details?.phone || '-'}</span>
                              </div>
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <div className="flex flex-col">
                                <span className="font-medium dark:text-gray-200">{application.parent_details?.name || application.users?.name || '-'}</span>
                                <span className="text-xs text-muted-foreground">{application.parent_details?.phone || application.users?.email || '-'}</span>
                              </div>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground">
                              {application.grades?.name || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground text-sm">
                              {application.created_at
                                ? new Date(application.created_at).toLocaleDateString(isArabic ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="font-medium text-slate-700 dark:text-slate-300">
                              {application.total_amount || 0} <span className="text-xs font-normal text-slate-500">{application.currency || 'AED'}</span>
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusDetails.className} bg-opacity-10 text-opacity-90 border-transparent`}>
                                {statusDetails.label}
                              </span>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-left rtl:text-right">
                              <Link href={withLocalePrefix(`/dashboard/applications/${application.id}`, locale)}>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{isArabic ? 'عرض' : 'View'}</span>
                                </Button>
                              </Link>
                            </ReferenceTableCell>
                          </ReferenceTableRow>
                        );
                      })}
                    </ReferenceTableBody>
                  </ReferenceTable>
                </div>
              )}

              {!loading && !error && filteredApplications.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4 mt-2">
                  <div className="text-sm text-muted-foreground">
                    {isArabic
                      ? `عرض ${(page - 1) * PAGE_SIZE + 1} إلى ${Math.min(page * PAGE_SIZE, filteredApplications.length)} من ${filteredApplications.length} طلب`
                      : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, filteredApplications.length)} of ${filteredApplications.length} entries`
                    }
                  </div>
                  <div className="space-x-2 rtl:space-x-reverse flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {isArabic ? 'السابق' : 'Previous'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {isArabic ? 'التالي' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
