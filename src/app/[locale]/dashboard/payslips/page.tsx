'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Search } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function PayslipsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(isArabic ? 'الحالة' : 'Status');

  const columns = isArabic
    ? ['رقم القسيمة', 'الموظف', 'الشهر', 'المبلغ', 'الحالة', 'تاريخ الإصدار', 'الإجراءات']
    : ['Payslip No.', 'Employee', 'Month', 'Amount', 'Status', 'Issue Date', 'Actions'];

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'قسائم الراتب' : 'Payslips'}
      pageSubtitle={isArabic ? 'إدارة قسائم الرواتب' : 'Manage payslips'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إنشاء قسيمة' : 'Create Payslip'}
          </button>
        </div>

        {/* Main content card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'قسائم الراتب' : 'Payslips'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isArabic ? 'إدارة قسائم الرواتب' : 'Manage payslips'}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'البحث في القسائم...' : 'Search payslips...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
            >
              <option>{isArabic ? 'الحالة' : 'Status'}</option>
              <option>{isArabic ? 'صادرة' : 'Issued'}</option>
              <option>{isArabic ? 'معلقة' : 'Pending'}</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-end text-sm font-semibold text-slate-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                    {isArabic ? 'لا توجد قسائم رواتب' : 'No payslips found'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
