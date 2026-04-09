'use client';

import { useLocale } from 'next-intl';
import { BarChart3, GraduationCap, Users, Wallet, CalendarCheck } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function ReportsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const reportTypes = [
    {
      title: isArabic ? 'تقرير الطلاب' : 'Students Report',
      description: isArabic ? 'إحصائيات وتحليلات الطلاب' : 'Student statistics and analytics',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: isArabic ? 'تقرير المعلمين' : 'Teachers Report',
      description: isArabic ? 'إحصائيات وتحليلات المعلمين' : 'Teacher statistics and analytics',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: isArabic ? 'تقرير المالية' : 'Finance Report',
      description: isArabic ? 'التقارير المالية والإيرادات' : 'Financial reports and revenue',
      icon: Wallet,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: isArabic ? 'تقرير الحضور' : 'Attendance Report',
      description: isArabic ? 'تقارير الحضور والغياب' : 'Attendance and absence reports',
      icon: CalendarCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'التقارير' : 'Reports'}
      pageSubtitle={isArabic ? 'عرض وتحليل التقارير' : 'View and analyze reports'}
    >
      <div className="space-y-6">
        {/* Report type cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => (
            <div
              key={report.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${report.bgColor}`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <h3 className="text-lg font-black text-slate-950">{report.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{report.description}</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-bold text-white">
                {isArabic ? 'عرض التقرير' : 'View Report'}
              </button>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'نظرة عامة' : 'Overview'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'رسوم بيانية وإحصائيات' : 'Charts and statistics'}
            </p>
          </div>
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <BarChart3 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-500">
                {isArabic ? 'اختر تقريرًا لعرض البيانات' : 'Select a report to view data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
