'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  FileBarChart2,
  FileQuestion,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MonitorDown,
  ReceiptText,
  Settings,
  Shield,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { withLocalePrefix } from '@/lib/locale-path';

interface ReferenceDashboardShellProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
}

interface NavItem {
  href: string;
  label: { ar: string; en: string };
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  id: string;
  label: { ar: string; en: string };
  items: NavItem[];
}

const dashboardOverviewItem: NavItem = {
  href: '/dashboard',
  label: { ar: 'الرئيسية', en: 'Overview' },
  icon: LayoutDashboard,
};

const navGroups: NavGroup[] = [
  {
    id: 'academic',
    label: { ar: 'الأكاديمي', en: 'Academic' },
    items: [
      { href: '/dashboard/courses', label: { ar: 'المواد الدراسية', en: 'Courses' }, icon: BookOpen },
      { href: '/dashboard/categories', label: { ar: 'الفئات', en: 'Categories' }, icon: FolderKanban },
      { href: '/dashboard/bundles', label: { ar: 'الفصول', en: 'Bundles' }, icon: CalendarDays },
      { href: '/dashboard/quizzes', label: { ar: 'الاختبارات', en: 'Quizzes' }, icon: FileQuestion },
    ],
  },
  {
    id: 'management',
    label: { ar: 'الإدارة', en: 'Management' },
    items: [
      { href: '/dashboard/users', label: { ar: 'المستخدمون', en: 'Users' }, icon: Users },
      { href: '/dashboard/applications', label: { ar: 'الطلبات', en: 'Applications' }, icon: ReceiptText },
      { href: '/dashboard/lookups', label: { ar: 'البيانات المرجعية', en: 'Lookups' }, icon: Database },
    ],
  },
  {
    id: 'finance',
    label: { ar: 'المالية', en: 'Finance' },
    items: [
      { href: '/dashboard/payments', label: { ar: 'المدفوعات', en: 'Payments' }, icon: Wallet },
      { href: '/dashboard/salaries', label: { ar: 'الرواتب', en: 'Salaries' }, icon: CircleDollarSign },
      { href: '/dashboard/payslips', label: { ar: 'قسائم الراتب', en: 'Payslips' }, icon: ReceiptText },
      { href: '/dashboard/banks', label: { ar: 'البنوك', en: 'Banks' }, icon: Wallet },
      { href: '/dashboard/currencies', label: { ar: 'العملات', en: 'Currencies' }, icon: CircleDollarSign },
      { href: '/dashboard/expenses', label: { ar: 'المصروفات', en: 'Expenses' }, icon: Wallet },
      { href: '/dashboard/coupons', label: { ar: 'الكوبونات', en: 'Coupons' }, icon: ReceiptText },
    ],
  },
  {
    id: 'communication',
    label: { ar: 'التواصل', en: 'Communication' },
    items: [
      { href: '/dashboard/messages', label: { ar: 'الرسائل', en: 'Messages' }, icon: MessageSquare },
    ],
  },
  {
    id: 'content',
    label: { ar: 'المحتوى', en: 'Content' },
    items: [
      { href: '/dashboard/announcements', label: { ar: 'الإعلانات', en: 'Announcements' }, icon: Bell },
      { href: '/dashboard/cms', label: { ar: 'إدارة المحتوى', en: 'CMS' }, icon: FolderKanban },
      { href: '/dashboard/translations', label: { ar: 'الترجمة', en: 'Translations' }, icon: FileQuestion },
    ],
  },
  {
    id: 'analytics',
    label: { ar: 'التحليلات', en: 'Analytics' },
    items: [
      { href: '/dashboard/reports', label: { ar: 'التقارير', en: 'Reports' }, icon: FileBarChart2 },
    ],
  },
  {
    id: 'data',
    label: { ar: 'إدارة البيانات', en: 'Data management' },
    items: [
      { href: '/dashboard/backup', label: { ar: 'النسخ الاحتياطي والاستعادة', en: 'Backup and restore' }, icon: Shield },
    ],
  },
];

const footerItems: NavItem[] = [
  { href: '/dashboard/system-settings', label: { ar: 'الإعدادات', en: 'Settings' }, icon: Settings },
  { href: '/dashboard/profile', label: { ar: 'الملف الشخصي', en: 'Profile' }, icon: User },
];

function navItemActive(pathname: string, href: string, locale: string) {
  const localizedHref = withLocalePrefix(href, locale);
  if (href === '/dashboard') {
    return pathname === localizedHref;
  }

  return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
}

export default function ReferenceDashboardShell({
  children,
  pageTitle,
  pageSubtitle,
}: ReferenceDashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = pathname.split('/')[1] === 'en' ? 'en' : 'ar';
  const isArabic = locale === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  const isOverview = navItemActive(pathname, dashboardOverviewItem.href, locale);

  useEffect(() => {
    const matchedGroup = navGroups.find((group) =>
      group.items.some((item) => navItemActive(pathname, item.href, locale)),
    );

    setExpandedGroup(matchedGroup?.id ?? null);
  }, [locale, pathname]);

  const logout = async () => {
    await signOut({ callbackUrl: withLocalePrefix('/', locale) });
  };

  const userName = session?.user?.name || (isArabic ? 'Fadi' : 'Fadi');
  const userRole = ((session?.user as { role?: string } | undefined)?.role || 'admin').toUpperCase();
  const todayDate = useMemo(
    () =>
      new Intl.DateTimeFormat(isArabic ? 'ar' : 'en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [isArabic],
  );
  const rangeLabel = isArabic ? 'Sep 10, 2025 - Mar 09, 2026' : 'Sep 10, 2025 - Mar 09, 2026';

  const mobileLinks = useMemo(
    () => [dashboardOverviewItem, ...navGroups.flatMap((group) => group.items), ...footerItems],
    [],
  );

  const installCard = installDismissed ? null : (
    <div className="mt-4 rounded-[1.6rem] border border-amber-200 bg-[#fff7e8] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">{isArabic ? 'تثبيت التطبيق' : 'Install app'}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {isArabic
              ? 'احصل على تجربة أسرع مع الوصول دون اتصال وأيقونة مباشرة.'
              : 'Get faster loading, offline access, and a direct home-screen shortcut.'}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-2 text-amber-600 shadow-sm">
          <MonitorDown className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          {isArabic ? 'تثبيت التطبيق' : 'Install app'}
        </button>
        <button
          type="button"
          onClick={() => setInstallDismissed(true)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          {isArabic ? 'ليس الآن' : 'Not now'}
        </button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          prefetch={false}
          href={withLocalePrefix(dashboardOverviewItem.href, locale)}
          className={`mb-3 flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold transition ${
            isOverview
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>{dashboardOverviewItem.label[isArabic ? 'ar' : 'en']}</span>
          <dashboardOverviewItem.icon className="h-4 w-4" />
        </Link>

        <div className="space-y-1">
          {navGroups.map((group) => {
            const active = group.items.some((item) => navItemActive(pathname, item.href, locale));
            const open = expandedGroup === group.id;
            const GroupIcon = group.items[0]?.icon || LayoutDashboard;

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => setExpandedGroup((current) => (current === group.id ? null : group.id))}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-sm transition ${
                    active
                      ? 'bg-slate-50 font-semibold text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="h-4 w-4" />
                    <span>{group.label[isArabic ? 'ar' : 'en']}</span>
                  </div>
                  {open ? (
                    isArabic ? (
                      <ChevronLeft className="h-4 w-4 rotate-[-90deg]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    )
                  ) : isArabic ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {open ? (
                  <div className="mt-1 space-y-1 pr-4">
                    {group.items.map((item) => {
                      const activeItem = navItemActive(pathname, item.href, locale);
                      return (
                        <Link
                          key={item.href}
                          prefetch={false}
                          href={withLocalePrefix(item.href, locale)}
                          className={`flex items-center justify-between rounded-full px-4 py-2.5 text-sm transition ${
                            activeItem
                              ? 'bg-white font-semibold text-slate-950 shadow-sm'
                              : 'text-slate-500 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <span>{item.label[isArabic ? 'ar' : 'en']}</span>
                          <item.icon className="h-4 w-4" />
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="space-y-1">
          {footerItems.map((item) => {
            const active = navItemActive(pathname, item.href, locale);
            return (
              <Link
                key={item.href}
                prefetch={false}
                href={withLocalePrefix(item.href, locale)}
                className={`flex items-center justify-between rounded-full px-4 py-3 text-sm transition ${
                  active
                    ? 'bg-slate-950 font-semibold text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.label[isArabic ? 'ar' : 'en']}</span>
                <item.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>

        {installCard}

        <button
          type="button"
          onClick={logout}
          className="mt-4 flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-slate-50"
        >
          <span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span>
          <ChevronLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f6f7]" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-[1700px] md:flex-row-reverse">
        <aside className="hidden min-h-screen w-[252px] shrink-0 border-l border-slate-200 bg-white md:block">
          {sidebar}
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 bg-[#f6f6f7]/95 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm md:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <span className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    {todayDate}
                  </span>
                  <Link
                    prefetch={false}
                    href={withLocalePrefix('/dashboard/reports', locale)}
                    className="rounded-[1.35rem] bg-[#3f7cff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    {isArabic ? 'عرض التقارير' : 'View reports'}
                  </Link>
                  <span className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
                    {rangeLabel}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {isOverview ? (
                      <p className="max-w-[28rem] text-lg leading-8 text-slate-600">
                        {isArabic
                          ? 'مرحباً بعودتك! إليك ما يحدث في مدرستك اليوم.'
                          : 'Welcome back. Here is what is happening across your school today.'}
                      </p>
                    ) : (
                      <>
                        <h1 className="text-[2rem] font-black leading-none text-slate-950">{pageTitle}</h1>
                        {pageSubtitle ? (
                          <p className="mt-2 text-sm text-slate-500">{pageSubtitle}</p>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-[11px] tracking-[0.18em] text-slate-400">{userRole}</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-900">
                      {(userName || 'F').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 pb-8 pt-2 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-[2rem] border-t border-slate-200 bg-white shadow-2xl md:hidden">
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-14 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-4 pb-3">
              <h2 className="text-lg font-black text-slate-950">
                {isArabic ? 'لوحة التحكم' : 'Dashboard'}
              </h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(82vh-72px)] overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {mobileLinks.map((item) => {
                  const active = navItemActive(pathname, item.href, locale);
                  return (
                    <Link
                      key={item.href}
                      prefetch={false}
                      href={withLocalePrefix(item.href, locale)}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-full px-4 py-3 text-sm transition ${
                        active
                          ? 'bg-slate-950 font-semibold text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label[isArabic ? 'ar' : 'en']}</span>
                      <item.icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>

              {installCard}

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="mt-4 flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-slate-50"
              >
                <span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span>
                <ChevronLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
