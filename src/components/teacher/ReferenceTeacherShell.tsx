'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
  Video,
  X,
} from 'lucide-react';
import InstallBanner from '@/components/pwa/InstallBanner';
import { withLocalePrefix } from '@/lib/locale-path';

interface ReferenceTeacherShellProps {
  children: ReactNode;
  pageTitle?: string;
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

const teacherOverviewItem: NavItem = {
  href: '/teacher/home',
  label: { ar: 'الرئيسية', en: 'Home' },
  icon: LayoutDashboard,
};

const navGroups: NavGroup[] = [
  {
    id: 'academic',
    label: { ar: 'الأكاديمي', en: 'Academic' },
    items: [
      { href: '/teacher/courses', label: { ar: 'المواد الدراسية', en: 'Courses' }, icon: BookOpen },
      { href: '/teacher/grades', label: { ar: 'الفصول', en: 'Classes' }, icon: CalendarDays },
      { href: '/teacher/lessons/new', label: { ar: 'الفصول المباشرة', en: 'Live Classes' }, icon: Video },
      { href: '/teacher/quizzes', label: { ar: 'الاختبارات', en: 'Quizzes' }, icon: ClipboardCheck },
      { href: '/teacher/assessments', label: { ar: 'التقييمات', en: 'Assessments' }, icon: BookOpen },
      { href: '/teacher/subjects', label: { ar: 'المواد', en: 'Subjects' }, icon: BookOpen },
    ],
  },
  {
    id: 'communication',
    label: { ar: 'التواصل', en: 'Communication' },
    items: [
      { href: '/teacher/chat', label: { ar: 'الرسائل', en: 'Messages' }, icon: MessageSquare },
      { href: '/teacher/calendar', label: { ar: 'التقويم', en: 'Calendar' }, icon: CalendarDays },
    ],
  },
];

const footerItems: NavItem[] = [
  { href: '/teacher/profile', label: { ar: 'الملف الشخصي', en: 'Profile' }, icon: User },
];

function navItemActive(pathname: string, href: string, locale: string) {
  const localizedHref = withLocalePrefix(href, locale);
  if (href === '/teacher/home') {
    return pathname === localizedHref;
  }
  return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
}

export default function ReferenceTeacherShell({
  children,
  pageTitle,
  pageSubtitle,
}: ReferenceTeacherShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = pathname.split('/')[1] === 'en' ? 'en' : 'ar';
  const isArabic = locale === 'ar';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const isOverview = navItemActive(pathname, teacherOverviewItem.href, locale);

  useEffect(() => {
    const matchedGroup = navGroups.find((group) =>
      group.items.some((item) => navItemActive(pathname, item.href, locale)),
    );
    setExpandedGroup(matchedGroup?.id ?? null);
  }, [locale, pathname]);

  const logout = async () => {
    await signOut({ callbackUrl: withLocalePrefix('/', locale) });
  };

  const userName = session?.user?.name || (isArabic ? 'المعلم' : 'Teacher');
  const userRole = 'TEACHER';
  const mobileLinks = useMemo(
    () => [teacherOverviewItem, ...navGroups.flatMap((group) => group.items), ...footerItems],
    [],
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f5] text-sm font-black text-slate-900">
            {(userName || 'T').charAt(0).toUpperCase()}
          </span>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-950">{userName}</p>
            <p className="text-xs tracking-[0.16em] text-slate-400">{userRole}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          prefetch={false}
          href={withLocalePrefix(teacherOverviewItem.href, locale)}
          className={`mb-3 flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold transition ${
            isOverview
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>{teacherOverviewItem.label[isArabic ? 'ar' : 'en']}</span>
          <teacherOverviewItem.icon className="h-4 w-4" />
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
                  <div className="mt-1 space-y-1 pe-4">
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
      <div className="flex min-h-screen ltr:md:flex-row-reverse">
        <aside className="hidden w-[252px] shrink-0 border-s border-slate-200 bg-white md:block">
          <div className="sticky top-0 h-screen">
            {sidebar}
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <InstallBanner locale={locale} />

          <div className="px-4 pt-4 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-sm"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            {!isOverview && pageTitle ? (
              <div className="mb-6 hidden md:block">
                <h1 className="text-[2.2rem] font-black leading-none text-slate-950">{pageTitle}</h1>
                {pageSubtitle ? <p className="mt-2 text-sm text-slate-500">{pageSubtitle}</p> : null}
              </div>
            ) : null}
            {children}
          </div>
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
                {isArabic ? 'القائمة' : 'Menu'}
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

              <InstallBanner locale={locale} />

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
