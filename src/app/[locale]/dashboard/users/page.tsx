'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search, ChevronDown, Trash2, Edit, KeyRound, Loader2, UploadCloud, X } from 'lucide-react';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ReferenceTable';
import { CountryCodeSelector, COMMON_COUNTRIES } from '@/components/ui/country-code-selector';
import type { CountryCode } from '@/components/ui/country-code-selector';

type UserRole = 'admin' | 'student' | 'teacher' | 'parent' | 'supervisor';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
  base_salary: number | null;
  price_per_lesson: number | null;
  salary_currency: string | null;
  bank_name: string | null;
  bank_account: string | null;
  address: string | null;
  birth_date: string | null;
  previous_education: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
}

const roleOptions = ['all', 'admin', 'student', 'teacher', 'parent', 'supervisor'] as const;
const statusOptions = ['all', 'active', 'inactive'] as const;

function roleTone(role: UserRole) {
  if (role === 'admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  if (role === 'teacher') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (role === 'parent') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
  if (role === 'supervisor') return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
}

function roleLabel(role: UserRole, isArabic: boolean) {
  if (role === 'admin') return isArabic ? 'مدير' : 'ADMIN';
  if (role === 'teacher') return isArabic ? 'معلم' : 'TEACHER';
  if (role === 'parent') return isArabic ? 'ولي أمر' : 'PARENT';
  if (role === 'supervisor') return isArabic ? 'مشرف' : 'SUPERVISOR';
  return isArabic ? 'طالب' : 'STUDENT';
}

function roleFilterLabel(role: (typeof roleOptions)[number], isArabic: boolean) {
  if (role === 'all') return isArabic ? 'جميع الأدوار' : 'All Roles';
  if (role === 'admin') return isArabic ? 'مسؤول' : 'Admin';
  if (role === 'teacher') return isArabic ? 'معلم' : 'Teacher';
  if (role === 'parent') return isArabic ? 'ولي أمر' : 'Parent';
  if (role === 'supervisor') return isArabic ? 'مشرف' : 'Supervisor';
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
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCountry, setNewUserCountry] = useState<CountryCode>(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
  const [newUserBaseSalary, setNewUserBaseSalary] = useState('');
  const [newUserPricePerLesson, setNewUserPricePerLesson] = useState('');
  const [newUserBankName, setNewUserBankName] = useState('');
  const [newUserBankAccount, setNewUserBankAccount] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserBirthDate, setNewUserBirthDate] = useState('');
  const [newUserImage, setNewUserImage] = useState<string | null>(null);
  const [newUserImagePreview, setNewUserImagePreview] = useState<string | null>(null);
  const [newUserPreviousEducation, setNewUserPreviousEducation] = useState('');
  const [newUserGuardianName, setNewUserGuardianName] = useState('');
  const [newUserGuardianEmail, setNewUserGuardianEmail] = useState('');
  const [newUserGuardianPhone, setNewUserGuardianPhone] = useState('');
  const [newUserGuardianCountry, setNewUserGuardianCountry] = useState<CountryCode>(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
  const [addingUser, setAddingUser] = useState(false);

  // Edit user state
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState<CountryCode>(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editBaseSalary, setEditBaseSalary] = useState('');
  const [editPricePerLesson, setEditPricePerLesson] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editPreviousEducation, setEditPreviousEducation] = useState('');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianEmail, setEditGuardianEmail] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editGuardianCountry, setEditGuardianCountry] = useState<CountryCode>(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
  const [editSaving, setEditSaving] = useState(false);

  // Change password state
  const [changePasswordUser, setChangePasswordUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete state
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const resetAddUserForm = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    setNewUserPhone('');
    setNewUserPassword('');
    setNewUserCountry(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
    setNewUserBaseSalary('');
    setNewUserPricePerLesson('');
    setNewUserBankName('');
    setNewUserBankAccount('');
    setNewUserAddress('');
    setNewUserBirthDate('');
    setNewUserImage(null);
    setNewUserImagePreview(null);
    setNewUserPreviousEducation('');
    setNewUserGuardianName('');
    setNewUserGuardianEmail('');
    setNewUserGuardianPhone('');
    setNewUserGuardianCountry(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
  };

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
        phone: u.phone || null,
        bio: u.bio || null,
        base_salary: u.base_salary ?? null,
        price_per_lesson: u.price_per_lesson ?? null,
        salary_currency: u.salary_currency || null,
        bank_name: u.bank_name || null,
        bank_account: u.bank_account || null,
        address: u.address || null,
        birth_date: u.birth_date || null,
        previous_education: u.previous_education || null,
        guardian_name: u.guardian_name || null,
        guardian_email: u.guardian_email || null,
        guardian_phone: u.guardian_phone || null,
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
        {notice ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="space-y-4">
          {/* Toolbar: Add User + Filters + Search — matching reference */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              type="button"
              onClick={() => setShowAddUser(true)}
            >
              <Plus className="h-4 w-4 rtl:ml-1 rtl:mr-0 mr-1" />
              {isArabic ? 'إضافة مستخدم' : 'Add User'}
            </button>

            {/* Role filter dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-all"
                onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowStatusDropdown(false); }}
              >
                <span>{roleFilter === 'all' ? (isArabic ? 'جميع المستخدمين' : 'All Users') : roleFilterLabel(roleFilter, isArabic)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 z-50 mt-1 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
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
                className="flex h-10 items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-all"
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRoleDropdown(false); }}
              >
                <span>{statusFilter === 'all' ? (isArabic ? 'جميع المستخدمين' : 'All Users') : statusFilterLabel(statusFilter, isArabic)}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 z-50 mt-1 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
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

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                placeholder={isArabic ? "بحث عن المستخدمين" : "Search users..."}
                className="flex h-10 w-[200px] lg:w-[280px] rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 pl-9 rtl:pl-3 rtl:pr-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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
                                    onClick={() => {
                                      setOpenMenu(null);
                                      setEditUser(user);
                                      setEditName(user.name);
                                      setEditRole(user.role);
                                      setEditIsActive(user.is_active);
                                      // Parse stored phone into country + national number
                                      const storedPhone = user.phone || '';
                                      const phoneDigits = storedPhone.replace(/\D/g, '');
                                      const matchedCountry = COMMON_COUNTRIES.find(c => {
                                        const code = c.dialCode.replace('+', '');
                                        return phoneDigits.startsWith(code);
                                      });
                                      if (matchedCountry) {
                                        setEditCountry(matchedCountry);
                                        setEditPhone(phoneDigits.slice(matchedCountry.dialCode.replace('+', '').length));
                                      } else {
                                        setEditCountry(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
                                        setEditPhone(phoneDigits);
                                      }
                                      setEditBaseSalary(user.base_salary?.toString() || '');
                                      setEditPricePerLesson(user.price_per_lesson?.toString() || '');
                                      setEditBankName(user.bank_name || '');
                                      setEditBankAccount(user.bank_account || '');
                                      setEditAddress(user.address || '');
                                      setEditBirthDate(user.birth_date || '');
                                      setEditImage(user.image || null);
                                      setEditImagePreview(user.image || null);
                                      setEditPreviousEducation(user.previous_education || '');
                                      setEditGuardianName(user.guardian_name || '');
                                      setEditGuardianEmail(user.guardian_email || '');
                                      // Parse guardian phone
                                      const gPhone = user.guardian_phone || '';
                                      const gPhoneDigits = gPhone.replace(/\D/g, '');
                                      const gMatchedCountry = COMMON_COUNTRIES.find(c => {
                                        const code = c.dialCode.replace('+', '');
                                        return gPhoneDigits.startsWith(code);
                                      });
                                      if (gMatchedCountry) {
                                        setEditGuardianCountry(gMatchedCountry);
                                        setEditGuardianPhone(gPhoneDigits.slice(gMatchedCountry.dialCode.replace('+', '').length));
                                      } else {
                                        setEditGuardianCountry(COMMON_COUNTRIES.find(c => c.code === 'AE') || COMMON_COUNTRIES[0]);
                                        setEditGuardianPhone(gPhoneDigits);
                                      }
                                    }}
                                  >
                                    <Edit className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 rtl:ml-3 rtl:mr-0" />
                                    {isArabic ? 'تعديل' : 'Edit'}
                                  </button>
                                  <button
                                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                      setOpenMenu(null);
                                      setChangePasswordUser(user);
                                      setNewPassword('');
                                    }}
                                  >
                                    <KeyRound className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500 rtl:ml-3 rtl:mr-0" />
                                    {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                                  </button>
                                  <button
                                    className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setOpenMenu(null);
                                      setDeleteUser(user);
                                    }}
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
      {/* Add User Modal — matching reference (futurelab.school) */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowAddUser(false); resetAddUserForm(); }}>
          <div className="w-full max-w-2xl rounded-[1.7rem] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <button type="button" onClick={() => { setShowAddUser(false); resetAddUserForm(); }} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
              <div className="text-right">
                <h3 className="text-2xl font-black text-slate-900">{isArabic ? 'إنشاء مستخدم جديد' : 'Create New User'}</h3>
                <p className="mt-1 text-sm text-slate-400">{isArabic ? 'إضافة مستخدم جديد إلى النظام مع معلوماته الأساسية ودوره' : 'Add a new user with basic information and role'}</p>
              </div>
            </div>

            <form
              className="space-y-5 text-right"
              onSubmit={async (e) => {
                e.preventDefault();
                setAddingUser(true);
                try {
                  const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newUserName,
                      email: newUserEmail,
                      role: newUserRole,
                      phone: newUserPhone || undefined,
                      countryCode: newUserPhone ? newUserCountry.dialCode.replace('+', '') : undefined,
                      password: newUserPassword,
                      base_salary: newUserBaseSalary || undefined,
                      price_per_lesson: newUserPricePerLesson || undefined,
                      bank_name: newUserBankName || undefined,
                      bank_account: newUserBankAccount || undefined,
                      address: newUserAddress || undefined,
                      birth_date: newUserBirthDate || undefined,
                      image: newUserImage || undefined,
                      salary_currency: 'AED',
                      previous_education: newUserPreviousEducation || undefined,
                      guardian_name: newUserGuardianName || undefined,
                      guardian_email: newUserGuardianEmail || undefined,
                      guardian_phone: newUserGuardianPhone || undefined,
                      guardian_country_code: newUserGuardianPhone ? newUserGuardianCountry.dialCode.replace('+', '') : undefined,
                    }),
                  });
                  if (res.ok) {
                    showNotice(isArabic ? 'تم إنشاء المستخدم بنجاح' : 'User created successfully');
                    setShowAddUser(false);
                    resetAddUserForm();
                    fetchUsers();
                  } else {
                    const data = await res.json();
                    showNotice(data.error || (isArabic ? 'فشل إنشاء المستخدم' : 'Failed to create user'));
                  }
                } catch {
                  showNotice(isArabic ? 'فشل إنشاء المستخدم' : 'Failed to create user');
                } finally {
                  setAddingUser(false);
                }
              }}
            >
              {/* Row 1: Name + Email — 2 columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder={isArabic ? 'الاسم' : 'Name'}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'عنوان البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder={isArabic ? 'البريد الالكتروني' : 'Email'}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Password + Role — 2 columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'كلمة المرور' : 'Password'}</label>
                  <input
                    type="password"
                    dir="ltr"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder={isArabic ? 'كلمة المرور' : 'Password'}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الدور' : 'Role'}</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none"
                  >
                    <option value="student">{isArabic ? 'طالب' : 'Student'}</option>
                    <option value="teacher">{isArabic ? 'معلم' : 'Teacher'}</option>
                    <option value="admin">{isArabic ? 'مسؤول' : 'Admin'}</option>
                    <option value="parent">{isArabic ? 'ولي أمر' : 'Parent'}</option>
                    <option value="supervisor">{isArabic ? 'مشرف' : 'Supervisor'}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Phone with country code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="flex" dir="ltr">
                  <CountryCodeSelector
                    value={newUserCountry}
                    onChange={setNewUserCountry}
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
                    className="flex-1 h-12 rounded-e-[1rem] border border-s-0 border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Row 4: Base Salary + Price Per Lesson — 2 columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الراتب الأساسي' : 'Base Salary'}</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-s-[1rem] border border-e-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">AED</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={newUserBaseSalary}
                      onChange={(e) => setNewUserBaseSalary(e.target.value)}
                      placeholder={isArabic ? 'الراتب الأساسي' : 'Base salary'}
                      className="flex-1 h-12 rounded-e-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'السعر لكل درس' : 'Price per Lesson'}</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-s-[1rem] border border-e-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">AED</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={newUserPricePerLesson}
                      onChange={(e) => setNewUserPricePerLesson(e.target.value)}
                      placeholder={isArabic ? 'السعر لكل درس' : 'Price per lesson'}
                      className="flex-1 h-12 rounded-e-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Bank Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'اسم البنك' : 'Bank Name'}</label>
                <input
                  type="text"
                  value={newUserBankName}
                  onChange={(e) => setNewUserBankName(e.target.value)}
                  placeholder={isArabic ? 'اسم البنك' : 'Bank name'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 6: Bank Account Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'رقم الحساب البنكي' : 'Bank Account Number'}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newUserBankAccount}
                  onChange={(e) => setNewUserBankAccount(e.target.value)}
                  placeholder={isArabic ? 'رقم الحساب البنكي' : 'Bank account number'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 7: Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'العنوان' : 'Address'}</label>
                <input
                  type="text"
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  placeholder={isArabic ? 'العنوان' : 'Address'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 8: Profile Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الصورة الشخصية' : 'Profile Photo'}</label>
                <div
                  className={`flex min-h-[160px] flex-col items-center justify-center rounded-[1.2rem] border-2 border-dashed p-6 text-center transition-all ${
                    newUserImagePreview ? 'border-green-300 bg-green-50/30' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setNewUserImagePreview(ev.target?.result as string); setNewUserImage(ev.target?.result as string); };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {newUserImagePreview ? (
                    <div className="relative mb-3">
                      <img src={newUserImagePreview} alt="Preview" loading="lazy" decoding="async" width={96} height={96} className="h-24 w-24 rounded-xl object-cover shadow-sm" />
                      <button
                        type="button"
                        onClick={() => { setNewUserImagePreview(null); setNewUserImage(null); }}
                        className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <UploadCloud className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    {newUserImagePreview ? (isArabic ? 'تم تحميل الصورة' : 'Image uploaded') : (isArabic ? 'اسحب وأفلت صورة هنا، أو' : 'Drag and drop an image here, or')}
                  </p>
                  {!newUserImagePreview && (
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50">
                      <UploadCloud className="h-4 w-4" />
                      {isArabic ? 'رفع صورة' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => { setNewUserImagePreview(ev.target?.result as string); setNewUserImage(ev.target?.result as string); };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                  <p className="mt-3 text-xs text-slate-400">{isArabic ? 'الصيغ المدعومة: jpg, jpeg, png, gif, webp (الحد الأقصى 2 ميغابايت)' : 'Supported formats: jpg, jpeg, png, gif, webp (max 2MB)'}</p>
                </div>
              </div>

              {/* Row 9: Birth Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                <input
                  type="date"
                  value={newUserBirthDate}
                  onChange={(e) => setNewUserBirthDate(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 10: Previous Education */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'التعليم السابق' : 'Previous Education'}</label>
                <input
                  type="text"
                  value={newUserPreviousEducation}
                  onChange={(e) => setNewUserPreviousEducation(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'التعليم السابق' : 'Previous education'}
                />
              </div>

              {/* Row 11: Guardian Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'اسم ولي الأمر' : 'Guardian Name'}</label>
                <input
                  type="text"
                  value={newUserGuardianName}
                  onChange={(e) => setNewUserGuardianName(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'ولي الامر' : 'Guardian name'}
                />
              </div>

              {/* Row 12: Guardian Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'بريد ولي الأمر' : 'Guardian Email'}</label>
                <input
                  type="email"
                  dir="ltr"
                  value={newUserGuardianEmail}
                  onChange={(e) => setNewUserGuardianEmail(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'بريد ولي الأمر' : 'Guardian email'}
                />
              </div>

              {/* Row 13: Guardian Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'هاتف ولي الأمر' : 'Guardian Phone'}</label>
                <div className="flex" dir="ltr">
                  <CountryCodeSelector
                    value={newUserGuardianCountry}
                    onChange={setNewUserGuardianCountry}
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    value={newUserGuardianPhone}
                    onChange={(e) => setNewUserGuardianPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 h-12 rounded-e-[1rem] border border-s-0 border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    placeholder={isArabic ? 'هاتف ولي الأمر' : 'Guardian phone'}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddUser(false); resetAddUserForm(); }}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isArabic ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal — matching reference (futurelab.school) */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditUser(null)}>
          <div className="w-full max-w-2xl rounded-[1.7rem] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <button type="button" onClick={() => setEditUser(null)} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-black text-slate-900">{isArabic ? 'تعديل المستخدم' : 'Edit User'}</h3>
            </div>
            <form
              className="space-y-5 text-right"
              onSubmit={async (e) => {
                e.preventDefault();
                setEditSaving(true);
                try {
                  const res = await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: editUser.id,
                      name: editName,
                      role: editRole,
                      isActive: editIsActive,
                      phone: editPhone || undefined,
                      countryCode: editPhone ? editCountry.dialCode.replace('+', '') : undefined,
                      base_salary: editBaseSalary || undefined,
                      price_per_lesson: editPricePerLesson || undefined,
                      bank_name: editBankName || undefined,
                      bank_account: editBankAccount || undefined,
                      address: editAddress || undefined,
                      birth_date: editBirthDate || undefined,
                      image: editImage || undefined,
                      previous_education: editPreviousEducation || undefined,
                      guardian_name: editGuardianName || undefined,
                      guardian_email: editGuardianEmail || undefined,
                      guardian_phone: editGuardianPhone || undefined,
                      guardian_country_code: editGuardianPhone ? editGuardianCountry.dialCode.replace('+', '') : undefined,
                    }),
                  });
                  if (res.ok) {
                    showNotice(isArabic ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully');
                    setEditUser(null);
                    fetchUsers();
                  } else {
                    const data = await res.json();
                    showNotice(data.error || (isArabic ? 'فشل تحديث المستخدم' : 'Failed to update user'));
                  }
                } catch {
                  showNotice(isArabic ? 'فشل تحديث المستخدم' : 'Failed to update user');
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {/* Row 1: Email (read-only) + Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'عنوان البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={editUser.email}
                    readOnly
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Account Status Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'حالة الحساب' : 'Account Status'}</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIsActive(!editIsActive)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editIsActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editIsActive ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-slate-600">{editIsActive ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span>
                </div>
              </div>

              {/* Row 3: Phone with country code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="flex" dir="ltr">
                  <CountryCodeSelector
                    value={editCountry}
                    onChange={setEditCountry}
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
                    className="flex-1 h-12 rounded-e-[1rem] border border-s-0 border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Row 4: Base Salary + Price Per Lesson — 2 columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الراتب الأساسي' : 'Base Salary'}</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-s-[1rem] border border-e-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">AED</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={editBaseSalary}
                      onChange={(e) => setEditBaseSalary(e.target.value)}
                      placeholder={isArabic ? 'الراتب الأساسي' : 'Base salary'}
                      className="flex-1 h-12 rounded-e-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'السعر لكل درس' : 'Price per Lesson'}</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-s-[1rem] border border-e-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">AED</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={editPricePerLesson}
                      onChange={(e) => setEditPricePerLesson(e.target.value)}
                      placeholder={isArabic ? 'السعر لكل درس' : 'Price per lesson'}
                      className="flex-1 h-12 rounded-e-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Bank Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'اسم البنك' : 'Bank Name'}</label>
                <input
                  type="text"
                  value={editBankName}
                  onChange={(e) => setEditBankName(e.target.value)}
                  placeholder={isArabic ? 'اسم البنك' : 'Bank name'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 6: Bank Account Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'رقم الحساب البنكي' : 'Bank Account Number'}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editBankAccount}
                  onChange={(e) => setEditBankAccount(e.target.value)}
                  placeholder={isArabic ? 'رقم الحساب البنكي' : 'Bank account number'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 7: Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'العنوان' : 'Address'}</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder={isArabic ? 'العنوان' : 'Address'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              {/* Row 8: Profile Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الصورة الشخصية' : 'Profile Photo'}</label>
                <div
                  className={`flex min-h-[160px] flex-col items-center justify-center rounded-[1.2rem] border-2 border-dashed p-6 text-center transition-all ${
                    editImagePreview ? 'border-green-300 bg-green-50/30' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setEditImagePreview(ev.target?.result as string); setEditImage(ev.target?.result as string); };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {editImagePreview ? (
                    <div className="relative mb-3">
                      <img src={editImagePreview} alt="Preview" loading="lazy" decoding="async" width={96} height={96} className="h-24 w-24 rounded-xl object-cover shadow-sm" />
                      <button
                        type="button"
                        onClick={() => { setEditImagePreview(null); setEditImage(null); }}
                        className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <UploadCloud className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    {editImagePreview ? (isArabic ? 'تم تحميل الصورة' : 'Image uploaded') : (isArabic ? 'اسحب وأفلت صورة هنا، أو' : 'Drag and drop an image here, or')}
                  </p>
                  {!editImagePreview && (
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50">
                      <UploadCloud className="h-4 w-4" />
                      {isArabic ? 'رفع صورة' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => { setEditImagePreview(ev.target?.result as string); setEditImage(ev.target?.result as string); };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                  <p className="mt-3 text-xs text-slate-400">{isArabic ? 'الصيغ المدعومة: jpg, jpeg, png, gif, webp (الحد الأقصى 2 ميغابايت)' : 'Supported formats: jpg, jpeg, png, gif, webp (max 2MB)'}</p>
                </div>
              </div>

              {/* Row 9: Role + Birth Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'الدور' : 'Role'}</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 appearance-none"
                  >
                    <option value="student">{isArabic ? 'طالب' : 'Student'}</option>
                    <option value="teacher">{isArabic ? 'معلم' : 'Teacher'}</option>
                    <option value="admin">{isArabic ? 'مسؤول' : 'Admin'}</option>
                    <option value="parent">{isArabic ? 'ولي أمر' : 'Parent'}</option>
                    <option value="supervisor">{isArabic ? 'مشرف' : 'Supervisor'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Row 10: Previous Education */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'التعليم السابق' : 'Previous Education'}</label>
                <input
                  type="text"
                  value={editPreviousEducation}
                  onChange={(e) => setEditPreviousEducation(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'التعليم السابق' : 'Previous education'}
                />
              </div>

              {/* Row 11: Guardian Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'اسم ولي الأمر' : 'Guardian Name'}</label>
                <input
                  type="text"
                  value={editGuardianName}
                  onChange={(e) => setEditGuardianName(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'ولي الامر' : 'Guardian name'}
                />
              </div>

              {/* Row 12: Guardian Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'بريد ولي الأمر' : 'Guardian Email'}</label>
                <input
                  type="email"
                  dir="ltr"
                  value={editGuardianEmail}
                  onChange={(e) => setEditGuardianEmail(e.target.value)}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  placeholder={isArabic ? 'بريد ولي الأمر' : 'Guardian email'}
                />
              </div>

              {/* Row 13: Guardian Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'هاتف ولي الأمر' : 'Guardian Phone'}</label>
                <div className="flex" dir="ltr">
                  <CountryCodeSelector
                    value={editGuardianCountry}
                    onChange={setEditGuardianCountry}
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    value={editGuardianPhone}
                    onChange={(e) => setEditGuardianPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 h-12 rounded-e-[1rem] border border-s-0 border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                    placeholder={isArabic ? 'هاتف ولي الأمر' : 'Guardian phone'}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={editSaving} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                  {editSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setChangePasswordUser(null)}>
          <div className="w-full max-w-md rounded-[1.7rem] bg-white p-6 shadow-2xl" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <button type="button" onClick={() => setChangePasswordUser(null)} className="mt-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
              <div className="text-right">
                <h3 className="text-xl font-black text-slate-900">{isArabic ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
                <p className="mt-1 text-sm text-slate-400">{changePasswordUser.name} ({changePasswordUser.email})</p>
              </div>
            </div>
            <form
              className="space-y-4 text-right"
              onSubmit={async (e) => {
                e.preventDefault();
                setChangingPassword(true);
                try {
                  const res = await fetch(`/api/admin/users/${changePasswordUser.id}/password`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPassword }),
                  });
                  if (res.ok) {
                    showNotice(isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
                    setChangePasswordUser(null);
                    setNewPassword('');
                  } else {
                    const data = await res.json();
                    showNotice(data.error || (isArabic ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
                  }
                } catch {
                  showNotice(isArabic ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
                } finally {
                  setChangingPassword(false);
                }
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{isArabic ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input
                  type="password"
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isArabic ? 'كلمة المرور الجديدة' : 'New password'}
                  className="w-full h-12 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setChangePasswordUser(null)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={changingPassword} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                  {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isArabic ? 'تغيير' : 'Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteUser(null)}>
          <div className="w-full max-w-sm rounded-[1.7rem] bg-white p-6 shadow-2xl" dir={isArabic ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-right">
              <h3 className="text-xl font-black text-slate-900">{isArabic ? 'حذف المستخدم' : 'Delete User'}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {isArabic
                  ? `هل أنت متأكد من حذف "${deleteUser.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${deleteUser.name}"? This action cannot be undone.`}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDeleteUser(null)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deletingUser}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                onClick={async () => {
                  setDeletingUser(true);
                  try {
                    const res = await fetch(`/api/admin/users?id=${deleteUser.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      showNotice(isArabic ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
                      setDeleteUser(null);
                      fetchUsers();
                    } else {
                      const data = await res.json();
                      showNotice(data.error || (isArabic ? 'فشل حذف المستخدم' : 'Failed to delete user'));
                    }
                  } catch {
                    showNotice(isArabic ? 'فشل حذف المستخدم' : 'Failed to delete user');
                  } finally {
                    setDeletingUser(false);
                  }
                }}
              >
                {deletingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ReferenceDashboardShell>
  );
}
