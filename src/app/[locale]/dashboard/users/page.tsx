'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search, Download, SlidersHorizontal, Trash2, Edit, KeyRound, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ReferenceTable';

type UserRole = 'admin' | 'student' | 'teacher';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  image: string | null;
}

const roleOptions = ['all', 'admin', 'student', 'teacher'] as const;
const statusOptions = ['all', 'active', 'inactive'] as const;

function roleTone(role: UserRole) {
  if (role === 'admin') {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  }

  if (role === 'teacher') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }

  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
}

function roleLabel(role: UserRole, isArabic: boolean) {
  if (role === 'admin') return isArabic ? 'مدير' : 'ADMIN';
  if (role === 'teacher') return isArabic ? 'معلم' : 'TEACHER';
  return isArabic ? 'طالب' : 'STUDENT';
}

function roleFilterLabel(role: (typeof roleOptions)[number], isArabic: boolean) {
  if (role === 'all') return isArabic ? 'جميع الأدوار' : 'All Roles';
  if (role === 'admin') return isArabic ? 'مدير' : 'Admin';
  if (role === 'teacher') return isArabic ? 'معلم' : 'Teacher';
  return isArabic ? 'طالب' : 'Student';
}

function statusFilterLabel(status: (typeof statusOptions)[number], isArabic: boolean) {
  if (status === 'all') return isArabic ? 'جميع الحالات' : 'All Statuses';
  if (status === 'active') return isArabic ? 'نشط' : 'Active';
  return isArabic ? 'غير نشط' : 'Inactive';
}

export default function DashboardUsersPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<(typeof roleOptions)[number]>('all');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100', offset: '0' });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      const data = await res.json();
      const fetched: UserRecord[] = (data.users || []).map((u: any) => ({
        id: u.id,
        name: u.name || '',
        email: u.email || '',
        role: (u.role || 'student') as UserRole,
        is_active: u.is_active !== false,
        created_at: u.created_at || '',
        image: u.image || null,
      }));
      setUsers(fetched);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        !query.trim() ||
        [user.name, user.email, user.role].join(' ').toLowerCase().includes(query.trim().toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  return (
    <ReferenceDashboardShell
      pageTitle={isArabic ? 'المستخدمون' : 'Users'}
      pageSubtitle={isArabic ? 'إدارة حسابات المستخدمين والصلاحيات' : 'Manage user accounts and permissions'}
    >
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isArabic ? 'المستخدمون' : 'Users'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              type="button"
            >
              <Download className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              {isArabic ? 'تصدير' : 'Export'}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-blue-600 text-white"
              type="button"
              onClick={() => showNotice(isArabic ? 'تم فتح نموذج إضافة مستخدم.' : 'Add-user flow opened.')}
            >
              <Plus className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
              {isArabic ? 'إضافة مستخدم' : 'Add User'}
            </button>
          </div>
        </div>

        {notice ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground text-slate-400 rtl:left-auto rtl:right-2.5" />
                <input
                  type="text"
                  placeholder={isArabic ? "تصفية المستخدمين..." : "Filter users..."}
                  className="flex h-10 w-[150px] lg:w-[250px] rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 rtl:pl-3 rtl:pr-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {/* Role filter dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex h-10 items-center justify-between rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-dashed ml-2 rtl:ml-0 rtl:mr-2"
                  onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowStatusDropdown(false); }}
                >
                  <div className="flex items-center gap-1">
                    <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    <span>{roleFilter === 'all' ? (isArabic ? 'الدور' : 'Role') : roleFilterLabel(roleFilter, isArabic)}</span>
                  </div>
                </button>
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 z-50 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {roleOptions.map((opt) => (
                        <button
                          key={opt}
                          className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 ${roleFilter === opt ? 'bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          onClick={() => { setRoleFilter(opt); setShowRoleDropdown(false); }}
                        >
                          {roleFilterLabel(opt, isArabic)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Status filter dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex h-10 items-center justify-between rounded-3xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-dashed ml-2 rtl:ml-0 rtl:mr-2"
                  onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRoleDropdown(false); }}
                >
                  <div className="flex items-center gap-1">
                    <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    <span>{statusFilter === 'all' ? (isArabic ? 'الحالة' : 'Status') : statusFilterLabel(statusFilter, isArabic)}</span>
                  </div>
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 z-50 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt}
                          className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-gray-100 ${statusFilter === opt ? 'bg-gray-50 font-semibold' : 'text-gray-700'}`}
                          onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}
                        >
                          {statusFilterLabel(opt, isArabic)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ml-auto lg:flex"
                type="button"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {isArabic ? 'عرض' : 'View'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white border-slate-200">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 rtl:ml-0 rtl:mr-3 text-sm text-slate-500">
                  {isArabic ? 'جاري تحميل المستخدمين...' : 'Loading users...'}
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isArabic ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </TableHead>
                    <TableHead>{isArabic ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                    <TableHead>{isArabic ? 'الدور' : 'Role'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{isArabic ? 'تاريخ الاضافة' : 'Created at'}</TableHead>
                    <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {isArabic ? 'لا توجد نتائج.' : 'No results.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="w-12 text-center">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleTone(user.role)}`}>
                            {roleLabel(user.role, isArabic)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                            {user.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-3xl hover:bg-slate-100 text-slate-500"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {openMenu === user.id && (
                              <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xl:right-auto xl:left-0 rtl:right-auto rtl:left-0 xl:rtl:right-0 xl:rtl:left-auto">
                                <div className="py-1" role="none">
                                  <button
                                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 rtl:ml-3 rtl:mr-0" />
                                    {isArabic ? 'تعديل' : 'Edit'}
                                  </button>
                                  <button
                                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <KeyRound className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 rtl:ml-3 rtl:mr-0" />
                                    {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                                  </button>
                                  <button
                                    className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <Trash2 className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500 rtl:ml-3 rtl:mr-0" />
                                    {isArabic ? 'حذف' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground text-slate-500 rtl:text-right">
              {isArabic ? '0 المحددة من' : '0 of'} {filteredUsers.length} {isArabic ? 'صفوف' : 'row(s) selected.'}
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4"
                type="button"
                disabled
              >
                {isArabic ? 'السابق' : 'Previous'}
              </button>
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-4"
                type="button"
                disabled
              >
                {isArabic ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
