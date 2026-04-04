'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, GraduationCap, Loader2, Search, UserRound, Users, UserSquare2, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PeopleScope = 'students' | 'teachers' | 'teacherStudents';
type PeopleFilter = 'all' | 'active' | 'followup';

type PeopleRow = {
  id: string;
  name: string;
  segment: { ar: string; en: string };
  lead: string;
  progress: string;
  attendance: string;
  status: { ar: string; en: string };
  statusClassName: string;
  lastSeen: string;
  // Extra fields for expandable detail
  email: string;
  phone: string;
  joinedDate: string;
  isActive: boolean;
  bio: string;
};

const peopleMeta: Record<
  PeopleScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof Users;
    tone: string;
    defaultRole: string;
  }
> = {
  students: {
    hero: { ar: 'إدارة الطلاب', en: 'Students workspace' },
    helper: { ar: 'متابعة الطلاب، مستوياتهم، ونشاطهم اليومي بنفس كثافة المرجع.', en: 'Track students, levels, and daily activity with reference-like density.' },
    createLabel: { ar: 'طالب جديد', en: 'New student' },
    icon: GraduationCap,
    tone: 'bg-[#eef4ff] text-[#2563eb]',
    defaultRole: 'student',
  },
  teachers: {
    hero: { ar: 'إدارة المعلمين', en: 'Teachers workspace' },
    helper: { ar: 'مراجعة حمل التدريس، الحضور، والفصول المسندة لكل معلم.', en: 'Review teaching load, attendance, and assigned bundles for each teacher.' },
    createLabel: { ar: 'معلم جديد', en: 'New teacher' },
    icon: UserSquare2,
    tone: 'bg-[#f5f3ff] text-[#7c3aed]',
    defaultRole: 'teacher',
  },
  teacherStudents: {
    hero: { ar: 'طلاب المعلم', en: 'Teacher students workspace' },
    helper: { ar: 'قائمة مجمعة لطلاب المعلمين مع حالات المتابعة السريعة.', en: 'Consolidated teacher-student roster with quick follow-up states.' },
    createLabel: { ar: 'إسناد طالب', en: 'Assign student' },
    icon: Users,
    tone: 'bg-[#edfdf3] text-[#15803d]',
    defaultRole: 'student',
  },
};

const apiEndpointByPeopleScope: Record<PeopleScope, string> = {
  students: '/api/admin/users?role=student',
  teachers: '/api/admin/users?role=teacher',
  teacherStudents: '/api/admin/users?role=student',
};

function mapApiToPeopleRow(item: Record<string, unknown>): PeopleRow {
  const id = String(item.id || '');
  const name = String(item.name || item.full_name || '');
  const role = String(item.role || '');
  const segAr = String(item.grade_name || role || '');
  const segEn = String(item.grade_name || role || '');
  const lead = String(item.teacher_name || item.department || '-');
  const isActive = item.status === 'active' || item.is_active === true || !item.status;
  const lastSeen = String(item.last_login || item.updated_at || item.created_at || '-');
  const email = String(item.email || '');
  const phone = String(item.phone || '-');
  const joinedDate = String(item.created_at || '-');
  const bio = String(item.bio || '');

  return {
    id,
    name,
    segment: { ar: segAr, en: segEn },
    lead,
    progress: '0',
    attendance: '0',
    status: isActive ? { ar: 'نشط', en: 'Active' } : { ar: 'يحتاج متابعة', en: 'Needs follow-up' },
    statusClassName: isActive ? 'bg-[#edfdf3] text-[#15803d]' : 'bg-[#fff7ed] text-[#c2410c]',
    lastSeen: lastSeen.split('T')[0],
    email,
    phone,
    joinedDate: joinedDate.split('T')[0],
    isActive,
    bio,
  };
}

type CreateFormData = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

export default function ReferencePeopleWorkspace({ scope }: { scope: PeopleScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = peopleMeta[scope];
  const [rows, setRows] = useState<PeopleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>({
    name: '',
    email: '',
    phone: '',
    role: meta.defaultRole,
  });

  const showNotice = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiEndpointByPeopleScope[scope]);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.users || [];
      setRows(items.map((item: Record<string, unknown>) => mapApiToPeopleRow(item)));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(isArabic ? `فشل تحميل البيانات: ${message}` : `Failed to load data: ${message}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [scope, isArabic]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(apiEndpointByPeopleScope[scope]);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.users || [];
      setRows(items.map((item: Record<string, unknown>) => mapApiToPeopleRow(item)));
      showNotice(isArabic ? 'تم تحديث القائمة بنجاح.' : 'Roster refreshed successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showNotice(isArabic ? `فشل التحديث: ${message}` : `Refresh failed: ${message}`, 'error');
    } finally {
      setRefreshing(false);
    }
  }, [scope, isArabic, showNotice]);

  const handleCreateSubmit = useCallback(async () => {
    if (!createForm.name.trim() || !createForm.email.trim()) {
      showNotice(
        isArabic ? 'الاسم والبريد الإلكتروني مطلوبان.' : 'Name and email are required.',
        'error',
      );
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          phone: createForm.phone.trim() || undefined,
          role: createForm.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      showNotice(
        isArabic
          ? `تم إنشاء ${createForm.role === 'teacher' ? 'المعلم' : 'الطالب'} "${createForm.name}" بنجاح.`
          : `${createForm.role === 'teacher' ? 'Teacher' : 'Student'} "${createForm.name}" created successfully.`,
        'success',
      );
      setCreateForm({ name: '', email: '', phone: '', role: meta.defaultRole });
      setShowCreateForm(false);

      // Refresh the list to include the new user
      handleRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showNotice(
        isArabic ? `فشل الإنشاء: ${message}` : `Creation failed: ${message}`,
        'error',
      );
    } finally {
      setCreating(false);
    }
  }, [createForm, isArabic, meta.defaultRole, showNotice, handleRefresh]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.name, row.segment.ar, row.segment.en, row.lead, row.email]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && row.status.en === 'Active') ||
        (filter === 'followup' && row.status.en !== 'Active');

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  const activeCount = rows.filter((row) => row.status.en === 'Active').length;
  const followUpCount = rows.filter((row) => row.status.en !== 'Active').length;
  const averageAttendance = `${Math.round(
    rows.reduce((total, row) => { const val = parseInt(row.attendance, 10); return total + (isNaN(val) ? 0 : val); }, 0) / Math.max(rows.length, 1),
  )}%`;

  // Compute "today sessions" from data: count users whose lastSeen is today
  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rows.filter((row) => row.lastSeen === today).length;
  }, [rows]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي السجلات' : 'Total records', rows.length, meta.tone],
          [isArabic ? 'السجلات النشطة' : 'Active records', activeCount, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'تحتاج متابعة' : 'Needs follow-up', followUpCount, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'متوسط الحضور' : 'Average attendance', averageAttendance, 'bg-[#eef2ff] text-[#4338ca]'],
        ].map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      {/* Error state banner */}
      {error && !loading ? (
        <div className="flex items-center gap-3 rounded-[1.3rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_310px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl p-3 ${meta.tone}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">{meta.hero[isArabic ? 'ar' : 'en']}</h2>
                <p className="mt-1 text-sm text-slate-500">{meta.helper[isArabic ? 'ar' : 'en']}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-300"
                disabled={refreshing}
                onClick={handleRefresh}
              >
                {refreshing ? (
                  <Loader2 className="me-1.5 h-4 w-4 animate-spin" />
                ) : null}
                {isArabic ? 'تحديث' : 'Refresh'}
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setCreateForm({ name: '', email: '', phone: '', role: meta.defaultRole });
                }}
              >
                {showCreateForm ? (isArabic ? 'إلغاء' : 'Cancel') : meta.createLabel[isArabic ? 'ar' : 'en']}
              </Button>
            </div>
          </div>

          {notice ? (
            <div
              className={`mt-4 rounded-[1.3rem] border px-4 py-3 text-sm ${
                notice.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          {/* Inline create form */}
          {showCreateForm ? (
            <div className="mt-4 rounded-[1.6rem] border border-blue-200 bg-blue-50/50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {meta.createLabel[isArabic ? 'ar' : 'en']}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {isArabic ? 'الاسم *' : 'Name *'}
                  </label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={isArabic ? 'الاسم الكامل' : 'Full name'}
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {isArabic ? 'البريد الإلكتروني *' : 'Email *'}
                  </label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder={isArabic ? 'email@example.com' : 'email@example.com'}
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {isArabic ? 'الهاتف' : 'Phone'}
                  </label>
                  <Input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    {isArabic ? 'الدور' : 'Role'}
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="student">{isArabic ? 'طالب' : 'Student'}</option>
                    <option value="teacher">{isArabic ? 'معلم' : 'Teacher'}</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
                  onClick={handleCreateSubmit}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="me-1.5 h-4 w-4 animate-spin" />
                  ) : null}
                  {isArabic ? 'إنشاء' : 'Create'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.6rem] bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={isArabic ? 'ابحث بالاسم أو المجموعة أو المشرف' : 'Search by name, group, or lead'}
                  className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['all', isArabic ? 'الكل' : 'All'],
                  ['active', isArabic ? 'النشط' : 'Active'],
                  ['followup', isArabic ? 'متابعة' : 'Follow-up'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === value
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-auto">
            <table className="w-full min-w-[780px] text-right text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الاسم' : 'Name'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'المجموعة' : 'Segment'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'المشرف' : 'Lead'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'التقدم' : 'Progress'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الحضور' : 'Attendance'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="px-4 py-4 text-right font-medium">{isArabic ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="mx-auto h-6 w-48 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                      {isArabic ? 'لا توجد بيانات حالياً.' : 'No data available.'}
                    </td>
                  </tr>
                ) : null}
                {filteredRows.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-4 font-semibold text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 text-slate-600">{row.segment[isArabic ? 'ar' : 'en']}</td>
                      <td className="px-4 py-4 text-slate-600">{row.lead}</td>
                      <td className="px-4 py-4 text-slate-900">{row.progress}</td>
                      <td className="px-4 py-4 text-slate-900">{row.attendance}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                          {row.status[isArabic ? 'ar' : 'en']}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRowId(expandedRowId === row.id ? null : row.id)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            {isArabic ? 'عرض' : 'View'}
                            {expandedRowId === row.id ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showNotice(
                                isArabic ? `تم إرسال تذكير إلى ${row.name}.` : `Reminder sent to ${row.name}.`,
                              )
                            }
                            className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            {isArabic ? 'تذكير' : 'Remind'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable detail row */}
                    {expandedRowId === row.id ? (
                      <tr key={`${row.id}-detail`} className="border-b border-slate-100 bg-slate-50/70">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-400">
                                {isArabic ? 'البريد الإلكتروني' : 'Email'}
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900 break-all" dir="ltr">
                                {row.email || '--'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400">
                                {isArabic ? 'الهاتف' : 'Phone'}
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900" dir="ltr">
                                {row.phone || '--'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400">
                                {isArabic ? 'الحالة' : 'Status'}
                              </p>
                              <p className="mt-1">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                                  {row.isActive
                                    ? (isArabic ? 'نشط' : 'Active')
                                    : (isArabic ? 'غير نشط' : 'Inactive')}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400">
                                {isArabic ? 'تاريخ الانضمام' : 'Joined date'}
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900">
                                {row.joinedDate !== '-' ? row.joinedDate : '--'}
                              </p>
                            </div>
                          </div>
                          {row.bio && row.bio !== '' ? (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400">
                                {isArabic ? 'نبذة' : 'Bio'}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">{row.bio}</p>
                            </div>
                          ) : null}
                          <div className="mt-3 text-xs text-slate-400">
                            {isArabic ? 'آخر ظهور' : 'Last seen'}: {row.lastSeen !== '-' ? row.lastSeen : '--'}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-950">{isArabic ? 'متابعة سريعة' : 'Quick follow-up'}</h3>
                <p className="text-sm text-slate-500">
                  {isArabic ? 'العناصر الأهم لهذا القسم.' : 'Highest-priority items in this section.'}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {rows
                .filter((row) => row.status.en !== 'Active')
                .slice(0, 3)
                .map((row) => (
                  <article key={row.id} className="rounded-[1.2rem] bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.segment[isArabic ? 'ar' : 'en']}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${row.statusClassName}`}>
                        {row.status[isArabic ? 'ar' : 'en']}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {isArabic ? 'آخر ظهور' : 'Last seen'}: {row.lastSeen}
                    </p>
                  </article>
                ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">{isArabic ? 'مؤشر النشاط' : 'Activity pulse'}</h3>
            <div className="mt-4 space-y-3">
              {[
                [isArabic ? 'جلسات اليوم' : 'Today sessions', loading ? '--' : String(todaySessions)],
                [isArabic ? 'محدث خلال 24 ساعة' : 'Updated in 24h', `${activeCount}`],
                [isArabic ? 'متوسط الإنجاز' : 'Average completion', `${Math.round(rows.reduce((total, row) => { const val = parseInt(row.progress, 10); return total + (isNaN(val) ? 0 : val); }, 0) / Math.max(rows.length, 1))}%`],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
