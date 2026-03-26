'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Megaphone, Plus, Clock, FileText, Users, Search } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Input } from '@/components/ui/input';

export default function AnnouncementsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');

  const stats = [
    { label: isArabic ? 'الاجمالي' : 'Total', value: 0, icon: Megaphone, color: 'text-slate-600' },
    { label: isArabic ? 'نشط' : 'Active', value: 0, icon: Clock, color: 'text-green-600' },
    { label: isArabic ? 'مسودة' : 'Draft', value: 0, icon: FileText, color: 'text-amber-600' },
    { label: isArabic ? 'منتهي' : 'Expired', value: 0, icon: Users, color: 'text-red-600' },
  ];

  return (
    <ReferenceDashboardShell pageTitle={isArabic ? 'الاعلانات' : 'Announcements'}>
      <div className="space-y-6">
        {/* Header with add button */}
        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {isArabic ? 'اضافة' : 'Add'}
          </button>
          <h1 className="text-3xl font-black text-slate-950">{isArabic ? 'الاعلانات' : 'Announcements'}</h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters section */}
        <div className="rounded-2xl border border-slate-200 bg-[#fafafa] p-5">
          <h2 className="mb-4 text-right text-xl font-black text-slate-950">{isArabic ? 'الكل' : 'All'}</h2>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'بحث...' : 'Search...'}
                className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
            >
              <option>{isArabic ? 'الكل' : 'All'}</option>
              <option>{isArabic ? 'نشط' : 'Active'}</option>
              <option>{isArabic ? 'مسودة' : 'Draft'}</option>
              <option>{isArabic ? 'منتهي' : 'Expired'}</option>
            </select>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
            >
              <option>All Types</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
            >
              <option>All Priorities</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#fafafa] py-16 text-center">
          <Megaphone className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">{isArabic ? 'لا توجد اعلانات' : 'No announcements'}</p>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
