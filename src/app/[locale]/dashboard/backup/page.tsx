'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Download, FileText, Upload, Search } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function BackupPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'history' | 'create' | 'restore'>('restore');
  const [query, setQuery] = useState('');

  const tabs = [
    { id: 'history' as const, label: isArabic ? 'سجل النسخ الاحتياطي' : 'Backup History', icon: FileText },
    { id: 'create' as const, label: isArabic ? 'إنشاء نسخة احتياطية' : 'Create Backup', icon: Download },
    { id: 'restore' as const, label: isArabic ? 'استعادة البيانات' : 'Restore Data', icon: Upload },
  ];

  const columns = isArabic
    ? ['الاسم', 'الحجم', 'التاريخ', 'الحالة', 'الإجراءات']
    : ['Name', 'Size', 'Date', 'Status', 'Actions'];

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}
      pageSubtitle={isArabic ? 'إدارة النسخ الاحتياطية واستعادة بيانات النظام' : 'Manage backups and restore system data'}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Restore tab content */}
        {activeTab === 'restore' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="text-end mb-6">
              <h2 className="text-2xl font-black text-slate-950">
                {isArabic ? 'استعادة البيانات' : 'Restore Data'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isArabic ? 'استعادة بيانات النظام من ملفات النسخ الاحتياطي' : 'Restore system data from backup files'}
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">
                {isArabic ? 'اختر ملف' : 'Choose File'}
              </label>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="w-full text-sm text-slate-500 file:me-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>
              <p className="text-sm text-slate-400">
                {isArabic ? 'الصيغ المدعومة: CSV, Excel (.xlsx)' : 'Supported formats: CSV, Excel (.xlsx)'}
              </p>

              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-400 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-500">
                <Upload className="h-4 w-4" />
                {isArabic ? 'استعادة من النسخة الاحتياطية' : 'Restore from Backup'}
              </button>
            </div>
          </div>
        )}

        {/* Create backup tab */}
        {activeTab === 'create' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Download className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-950 mb-2">
              {isArabic ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {isArabic
                ? 'سيتم إنشاء نسخة احتياطية كاملة من جميع بيانات النظام بما في ذلك المستخدمين والدورات والمدفوعات'
                : 'A complete backup of all system data will be created including users, courses, and payments'}
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-sm font-bold text-white">
              <Download className="h-4 w-4" />
              {isArabic ? 'بدء النسخ الاحتياطي' : 'Start Backup'}
            </button>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isArabic ? 'البحث...' : 'Search...'}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-3 text-end text-sm font-semibold text-slate-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                      {isArabic ? 'لا توجد نسخ احتياطية' : 'No backups found'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ReferenceDashboardShell>
  );
}
