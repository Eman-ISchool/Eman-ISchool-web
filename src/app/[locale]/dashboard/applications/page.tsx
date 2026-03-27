'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Download } from 'lucide-react';
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
                      <Input
                        type="text"
                        placeholder={isArabic ? 'بحث باسم الطالب أو ولي الأمر أو رقم الهاتف...' : 'Search by name, phone, guardian name or phone...'}
                        className="pl-8 rtl:pl-3 rtl:pr-8 bg-transparent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">{isArabic ? 'جميع الطلبات' : 'All Applications'}</option>
                      <option value="approved">{isArabic ? 'تمت الموافقة' : 'Approved'}</option>
                      <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
                      <option value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">{isArabic ? 'جميع الفصول' : 'All Bundles'}</option>
                    </select>
                    <Input type="text" placeholder={isArabic ? 'من تاريخ' : 'From Date'} className="h-10 max-w-[160px]" />
                    <span className="text-sm text-muted-foreground">{isArabic ? 'إلى' : 'to'}</span>
                    <Input type="text" placeholder={isArabic ? 'إلى تاريخ' : 'To Date'} className="h-10 max-w-[160px]" />
                    <Button variant="outline" size="sm" onClick={() => { setQuery(''); setStatus('all'); setGrade('all'); }}>
                      {isArabic ? 'مسح الفلاتر' : 'Clear All Filters'}
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
                        <ReferenceTableHead>{isArabic ? 'المعرف' : 'ID'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الطالب' : 'Student'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'ولي الأمر' : 'Guardian'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الهاتف' : 'Phone'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'هاتف ولي الأمر' : 'Guardian Phone'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'مادة الدراسية' : 'Bundle'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'التاريخ' : 'Date'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'الحالة' : 'Status'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'المديونية' : 'Debt'}</ReferenceTableHead>
                        <ReferenceTableHead>{isArabic ? 'المدفوع' : 'Paid'}</ReferenceTableHead>
                        <ReferenceTableHead className="text-left rtl:text-right w-[120px]">{isArabic ? 'الإجراءات' : 'Actions'}</ReferenceTableHead>
                      </ReferenceTableRow>
                    </ReferenceTableHeader>
                    <ReferenceTableBody>
                      {currentPageItems.map((application) => {
                        const statusDetails = getApplicationStatusMeta(application.status, isArabic);
                        const currency = application.currency || 'AED';

                        return (
                          <ReferenceTableRow key={application.id}>
                            <ReferenceTableCell className="font-medium">
                              {application.id.slice(0, 6)}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="font-medium">
                              {application.student_details?.name || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              {application.parent_details?.name || application.users?.name || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground">
                              {application.student_details?.phone || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground">
                              {application.parent_details?.phone || application.users?.email || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground">
                              {application.grades?.name || '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-muted-foreground text-sm">
                              {application.created_at
                                ? new Date(application.created_at).toLocaleDateString(isArabic ? 'ar' : 'en', { year: 'numeric', month: 'numeric', day: 'numeric' })
                                : '-'}
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusDetails.className} bg-opacity-10 text-opacity-90 border-transparent`}>
                                {statusDetails.label}
                              </span>
                            </ReferenceTableCell>
                            <ReferenceTableCell>
                              <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-sm font-bold text-red-700">
                                {Number(application.total_amount || 0).toFixed(2)} {currency}
                              </span>
                            </ReferenceTableCell>
                            <ReferenceTableCell className="font-medium">
                              {(application.status === 'approved' || application.status === 'payment_completed')
                                ? `${application.total_amount || '0.00'} ${currency}`
                                : `0.00 ${currency}`
                              }
                            </ReferenceTableCell>
                            <ReferenceTableCell className="text-left rtl:text-right">
                              <div className="flex items-center gap-1">
                                <Link href={withLocalePrefix(`/dashboard/applications/${application.id}`, locale)}>
                                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{isArabic ? 'عرض التفاصيل' : 'View Details'}</span>
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Download className="h-3.5 w-3.5" />
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

              {!loading && !error && filteredApplications.length > 0 && (
                <>
                  <div className="flex items-center justify-between space-x-2 py-4 mt-2">
                    <div className="text-sm text-muted-foreground">
                      {isArabic
                        ? `عرض ${(page - 1) * PAGE_SIZE + 1} إلى ${Math.min(page * PAGE_SIZE, filteredApplications.length)} من ${filteredApplications.length} طلب`
                        : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, filteredApplications.length)} of ${filteredApplications.length} applications`
                      }
                    </div>
                    <div className="space-x-1 rtl:space-x-reverse flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {isArabic ? 'السابق' : 'Previous'}
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(p)}
                          className="w-8 h-8 p-0"
                        >
                          {p}
                        </Button>
                      ))}
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
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {isArabic ? 'تحديث الطلبات المتأخرة' : 'Update Overdue Applications'}
                      </Button>
                      <Button variant="outline" size="sm">
                        {isArabic ? 'موافقة جماعية' : 'Bulk Approve'}
                      </Button>
                    </div>
                    <Button size="sm">
                      {isArabic ? 'تقديم طلب جديد' : 'New Application'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
