'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DashboardApplicationDetailPage() {
  const params = useParams<{ id: string; locale: string }>();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setFetchError(null);
        const { data, error } = await supabase
          .from('enrollment_applications')
          .select('*, grades(name), users!enrollment_applications_user_id_fkey(name, email)')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (active) {
          setApplication(data || null);
        }
      } catch (err: any) {
        if (active) {
          setApplication(null);
          setFetchError(err?.message || (isArabic ? 'حدث خطأ أثناء تحميل الطلب.' : 'An error occurred while loading the application.'));
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
  }, [params.id, isArabic]);

  const title = useMemo(
    () => `${isArabic ? 'الطلبات' : 'Applications'} #${params.id}`,
    [isArabic, params.id],
  );

  const showMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    window.setTimeout(() => setActionMessage(null), 3500);
  };

  const updateApplicationStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!application) return;

    setActionLoading(newStatus);
    try {
      const { data, error } = await supabase
        .from('enrollment_applications')
        .update({ status: newStatus })
        .eq('id', application.id)
        .select()
        .single();

      if (error) throw error;

      setApplication((current: any) => current ? { ...current, ...data } : current);
      showMessage(
        newStatus === 'approved'
          ? (isArabic ? 'تمت الموافقة على الطلب بنجاح.' : 'Application approved successfully.')
          : (isArabic ? 'تم رفض الطلب بنجاح.' : 'Application rejected successfully.'),
        'success',
      );
    } catch (err: any) {
      showMessage(
        err?.message || (isArabic ? 'فشل تحديث حالة الطلب.' : 'Failed to update application status.'),
        'error',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const BackArrow = isArabic ? ArrowRight : ArrowLeft;

  return (
    <ReferenceDashboardShell
      pageTitle={title}
      pageSubtitle={isArabic ? 'مراجعة الطلب وإدارة حالته' : 'Review the application and manage its status'}
    >
      {/* Back navigation */}
      <Link
        href={`/${locale}/dashboard/applications`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <BackArrow className="h-4 w-4" />
        {isArabic ? 'العودة إلى الطلبات' : 'Back to applications'}
      </Link>

      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          {isArabic ? 'جاري تحميل تفاصيل الطلب...' : 'Loading application details...'}
        </div>
      ) : fetchError ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
          {fetchError}
        </div>
      ) : !application ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm">
          {isArabic ? 'لم يتم العثور على الطلب.' : 'Application not found.'}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-6">
            {[
              {
                title: isArabic ? 'معلومات الطالب' : 'Student information',
                rows: [
                  [isArabic ? 'الاسم الكامل' : 'Full name', application.student_details?.name || '-'],
                  [isArabic ? 'عنوان البريد الإلكتروني' : 'Email address', application.student_details?.email || '-'],
                  [isArabic ? 'رقم الهاتف' : 'Phone number', application.student_details?.phone || '-'],
                  [isArabic ? 'تاريخ الميلاد' : 'Date of birth', application.student_details?.dateOfBirth || '-'],
                  [isArabic ? 'العنوان' : 'Address', application.student_details?.address || '-'],
                ],
              },
              {
                title: isArabic ? 'معلومات ولي الأمر' : 'Guardian information',
                rows: [
                  [isArabic ? 'اسم ولي الأمر' : 'Guardian name', application.parent_details?.name || application.users?.name || '-'],
                  [isArabic ? 'هاتف ولي الأمر' : 'Guardian phone', application.parent_details?.phone || '-'],
                  [isArabic ? 'البريد الإلكتروني' : 'Email', application.parent_details?.email || application.users?.email || '-'],
                ],
              },
              {
                title: isArabic ? 'التعليم السابق' : 'Previous education',
                rows: [
                  [isArabic ? 'الصف السابق' : 'Previous grade', application.previous_education || application.student_details?.previousEducation || '-'],
                ],
              },
              {
                title: isArabic ? 'معلومات الفصل' : 'Bundle information',
                rows: [
                  [isArabic ? 'الفصل الدراسي' : 'Bundle', application.grades?.name || application.bundle_name || '-'],
                  [isArabic ? 'حالة الطلب' : 'Status', application.status || '-'],
                  [isArabic ? 'رقم الطلب' : 'Application ID', String(application.id).slice(0, 6)],
                ],
              },
            ].map((section) => (
              <section key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {section.rows.map(([label, value]) => (
                    <div key={label} className="rounded-[1.5rem] bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                {isArabic ? 'المدفوعات' : 'Payments'}
              </h2>
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">{isArabic ? 'اسم الرسوم' : 'Fee name'}</th>
                      <th className="px-4 py-3">{isArabic ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-4 py-3">{isArabic ? 'تاريخ الاستحقاق' : 'Due date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-4">{isArabic ? 'رسوم الدراسة' : 'Study fees'}</td>
                      <td className="px-4 py-4">{application.total_amount ?? 0} {application.currency || 'AED'}</td>
                      <td className="px-4 py-4">{application.created_at ? new Date(application.created_at).toLocaleDateString(isArabic ? 'ar' : 'en') : '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                {isArabic ? 'لم يتم العثور على مدفوعات لهذا الطلب.' : 'No payments were found for this application.'}
              </div>
            </section>
          </div>

          <aside className="grid gap-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                {isArabic ? 'الإجراءات' : 'Actions'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isArabic ? 'إدارة هذا الطلب' : 'Manage this application'}
              </p>
              <div className="mt-5 grid gap-3">
                <Button
                  type="button"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={actionLoading !== null || application.status === 'approved'}
                  onClick={() => updateApplicationStatus('approved')}
                >
                  {actionLoading === 'approved'
                    ? (isArabic ? 'جاري الموافقة...' : 'Approving...')
                    : (isArabic ? 'الموافقة على الطلب' : 'Approve application')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  disabled={actionLoading !== null || application.status === 'rejected'}
                  onClick={() => updateApplicationStatus('rejected')}
                >
                  {actionLoading === 'rejected'
                    ? (isArabic ? 'جاري الرفض...' : 'Rejecting...')
                    : (isArabic ? 'رفض الطلب' : 'Reject application')}
                </Button>
              </div>

              {actionMessage ? (
                <div
                  className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm ${
                    actionMessage.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {actionMessage.text}
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">
                {isArabic ? 'الجدول الزمني' : 'Timeline'}
              </h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {isArabic ? 'تم تقديم الطلب' : 'Application submitted'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {application.created_at
                      ? new Date(application.created_at).toLocaleString(isArabic ? 'ar' : 'en')
                      : '-'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {isArabic ? 'الحالة الحالية' : 'Current status'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{application.status || '-'}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </ReferenceDashboardShell>
  );
}
