'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Megaphone, Plus, Clock, FileText, Users, Search, X, Loader2 } from 'lucide-react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Input } from '@/components/ui/input';

export default function AnnouncementsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [typeFilter, setTypeFilter] = useState(isArabic ? 'جميع الأنواع' : 'All Types');
  const [priorityFilter, setPriorityFilter] = useState(isArabic ? 'جميع الأولويات' : 'All Priorities');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'general', priority: 'normal', status: 'draft' });

  const handleCreate = async () => {
    setCreating(true);
    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ title: '', content: '', type: 'general', priority: 'normal', status: 'draft' });
    } catch (err) {
      console.error('Failed to create announcement', err);
    } finally {
      setCreating(false);
    }
  };

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
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">
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
              <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'بحث...' : 'Search...'}
                className="h-12 rounded-2xl border-slate-200 bg-white ps-11"
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
              <option>{isArabic ? 'جميع الأنواع' : 'All Types'}</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
            >
              <option>{isArabic ? 'جميع الأولويات' : 'All Priorities'}</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#fafafa] py-16 text-center">
          <Megaphone className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">{isArabic ? 'لا توجد اعلانات' : 'No announcements'}</p>
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[1.7rem] bg-white p-8 shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute end-5 top-5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-6 text-xl font-black text-slate-950">
              {isArabic ? 'إنشاء إعلان جديد' : 'Create New Announcement'}
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'العنوان' : 'Title'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'عنوان الإعلان' : 'Announcement title'}
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'المحتوى' : 'Content'}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'محتوى الإعلان' : 'Announcement content'}
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'النوع' : 'Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="general">{isArabic ? 'عام' : 'General'}</option>
                  <option value="academic">{isArabic ? 'أكاديمي' : 'Academic'}</option>
                  <option value="event">{isArabic ? 'فعالية' : 'Event'}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'الأولوية' : 'Priority'}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="normal">{isArabic ? 'عادي' : 'Normal'}</option>
                  <option value="high">{isArabic ? 'مرتفع' : 'High'}</option>
                  <option value="urgent">{isArabic ? 'عاجل' : 'Urgent'}</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {isArabic ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
                  <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
                </select>
              </div>

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={creating || !formData.title.trim()}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'إنشاء الإعلان' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ReferenceDashboardShell>
  );
}
