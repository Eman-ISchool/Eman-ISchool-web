'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { getReferenceMockApplications } from '@/lib/reference-dashboard-data';
import { supabase } from '@/lib/supabase';

export default function DashboardApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await supabase
          .from('enrollment_applications')
          .select('*, grades(name), users!enrollment_applications_user_id_fkey(name, email)')
          .eq('id', params.id)
          .single();

        if (active) {
          setApplication(
            data ||
              getReferenceMockApplications().find(
                (entry) => String(entry.id) === String(params.id),
              ) ||
              null,
          );
        }
      } catch {
        if (active) {
          setApplication(
            getReferenceMockApplications().find(
              (entry) => String(entry.id) === String(params.id),
            ) || null,
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
  }, [params.id]);

  const title = useMemo(
    () => `${isArabic ? 'الطلبات' : 'Applications'} #${params.id}`,
    [isArabic, params.id],
  );

  const updateMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2500);
  };

  return (
    <ReferenceDashboardShell
      pageTitle={title}
      pageSubtitle={isArabic ? 'مراجعة الطلب وإدارة حالته' : 'Review the application and manage its status'}
    >
      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          {isArabic ? 'جاري تحميل تفاصيل الطلب...' : 'Loading application details...'}
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
                      <td className="px-4 py-4">{application.total_amount || 150} {application.currency || 'AED'}</td>
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
                  onClick={() => {
                    setApplication((current: any) => current ? { ...current, status: 'approved' } : current);
                    updateMessage(isArabic ? 'تم اعتماد الطلب محلياً.' : 'Application approved locally.');
                  }}
                >
                  {isArabic ? 'الموافقة على الطلب' : 'Approve application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => {
                    setApplication((current: any) => current ? { ...current, status: 'rejected' } : current);
                    updateMessage(isArabic ? 'تم رفض الطلب محلياً.' : 'Application rejected locally.');
                  }}
                >
                  {isArabic ? 'رفض الطلب' : 'Reject application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => updateMessage(isArabic ? 'تم فتح وضع التعديل الاستعراضي.' : 'Preview edit mode opened.')}
                >
                  {isArabic ? 'تعديل الطلب' : 'Edit application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => updateMessage(isArabic ? 'تمت إضافة دفعة تجريبية.' : 'Preview payment added.')}
                >
                  {isArabic ? 'إضافة دفعة' : 'Add payment'}
                </Button>
              </div>

              {actionMessage ? (
                <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {actionMessage}
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
