'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  UploadCloud,
  Users,
  Video,
  Loader2,
} from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import {
  Table as ReferenceTable,
  TableBody as ReferenceTableBody,
  TableCell as ReferenceTableCell,
  TableHead as ReferenceTableHead,
  TableHeader as ReferenceTableHeader,
  TableRow as ReferenceTableRow,
} from '@/components/admin/ReferenceTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withLocalePrefix } from '@/lib/locale-path';

interface CourseListItem {
  id: string;
  title: string;
  subtitle: string;
  teacher: string;
  badge?: string;
}

interface CourseLessonItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'published' | 'draft';
}

interface CourseAssignmentItem {
  id: string;
  title: string;
  dueDate: string;
  description: string;
  submissions: number;
}

interface CourseExamItem {
  id: string;
  title: string;
  dueDate: string;
  attempts: number;
  status: string;
}

interface CourseLiveSessionItem {
  id: string;
  day: number;
  time: string;
  title: string;
  teacher: string;
}

interface CourseDetailFixture {
  id: string;
  title: string;
  teacher: string;
  details: string;
  meetingLink: string;
  lessons: CourseLessonItem[];
  assignments: CourseAssignmentItem[];
  exams: CourseExamItem[];
  liveSessions: CourseLiveSessionItem[];
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  courses: string;
  bundles: string;
  createdAt: string;
}

interface BundleRow {
  id: string;
  name: string;
  description: string;
  category: string;
  teacher: string;
  students: number;
  status: string;
  createdAt: string;
}

interface BundleSubject {
  id: string;
  name: string;
  teacher: string;
  liveLink: string;
}

interface BundleScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
}

interface BundleFeeItem {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
}

interface BundleStudentItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
  acceptedAt: string;
}

interface BundleDetailFixture {
  id: string;
  name: string;
  description: string;
  category: string;
  teacher: string;
  startDate: string;
  endDate: string;
  acceptingRequests: boolean;
  active: boolean;
}

interface LessonReferenceMaterial {
  id: string;
  title: string;
  type: string;
}

interface LessonReferenceAttendance {
  id: string;
  studentName: string;
  status: 'حاضر' | 'غائب' | 'متأخر';
}

interface LessonDetailFixture {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoLink: string;
  materials: LessonReferenceMaterial[];
  attendance: LessonReferenceAttendance[];
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-[1.2rem] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="space-y-2 text-right">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-3 w-28 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-semibold text-red-600">{message}</p>
      <p className="mt-2 text-xs text-red-400">يرجى المحاولة مرة أخرى لاحقاً</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-right">
      <h1 className="text-[2.15rem] font-black leading-none text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl border-slate-200 bg-white pr-11 shadow-sm"
      />
    </div>
  );
}

function PillButton({
  children,
  href,
  variant = 'primary',
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}) {
  const className =
    variant === 'primary'
      ? 'inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-black/85'
      : 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50';

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function ActionIcon({ icon: Icon, tone = 'default', onClick }: { icon: typeof Pencil; tone?: 'default' | 'danger'; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
        tone === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function StatusChip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'danger' | 'success' }) {
  const toneClass =
    tone === 'success'
      ? 'bg-[#111111] text-white'
      : tone === 'danger'
        ? 'bg-red-500 text-white'
        : 'bg-[#f2f2f2] text-slate-600';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{label}</span>;
}

function TopBar({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 lg:flex-1 lg:flex-row lg:items-center">{children}</div>
      {action ? <div className="flex justify-start lg:justify-end">{action}</div> : null}
    </div>
  );
}

function RichTextBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarButtonClass = 'rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900';

  const wrapSelection = (before: string, after: string = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const insertLine = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-end gap-1 border-b border-slate-200 px-3 py-2">
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('`')} title="Code">
          <Type className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('[', '](url)')} title="Link">
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('![alt](', ')')} title="Image">
          <ImageIcon className="h-4 w-4" />
        </button>
        <div className="mx-2 h-5 w-px bg-slate-200" />
        <button type="button" className={toolbarButtonClass} onClick={() => insertLine('- ')} title="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => insertLine('1. ')} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="mx-2 h-5 w-px bg-slate-200" />
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('**')} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('_')} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('<u>', '</u>')} title="Underline">
          <Underline className="h-4 w-4" />
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => wrapSelection('~~')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[140px] resize-none border-0 bg-transparent p-4 text-right shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

function UploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <ImageIcon className="mb-5 h-12 w-12 text-slate-400" strokeWidth={1.5} />
      <p className="text-sm font-medium text-slate-500">
        {fileName ? fileName : 'اسحب الصورة هنا أو اخترها من جهازك'}
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="h-4 w-4" />
        رفع صورة
      </button>
      <p className="mt-4 text-xs text-slate-400">الصيغ المدعومة: jpg, jpeg, png, gif, webp بحد أقصى 5MB</p>
    </div>
  );
}

const CALENDAR_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarMonthView({ liveSessions = [] }: { liveSessions?: CourseLiveSessionItem[] }) {
  const columns = ['Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun'];
  const [activeView, setActiveView] = useState<string>('الشهر');
  const [monthOffset, setMonthOffset] = useState(0); // 0 = March 2026

  const currentMonthIndex = (2 + monthOffset + 120) % 12; // March is index 2
  const yearOffset = Math.floor((2 + monthOffset) / 12);
  const displayYear = 2026 + yearOffset;
  const displayMonth = CALENDAR_MONTHS[currentMonthIndex];

  const events = useMemo(
    () =>
      liveSessions.reduce((acc, session) => {
        acc[session.day] = [...(acc[session.day] || []), session];
        return acc;
      }, {} as Record<number, CourseLiveSessionItem[]>),
    [liveSessions],
  );

  const weeks = [
    [7, 6, 5, 4, 3, 2, 1],
    [14, 13, 12, 11, 10, 9, 8],
    [21, 20, 19, 18, 17, 16, 15],
    [28, 27, 26, 25, 24, 23, 22],
    [4, 3, 2, 1, 31, 30, 29],
  ];

  const inCurrentMonth = (day: number, weekIndex: number) => !(weekIndex === 4 && day <= 4);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 rounded-2xl bg-[#f7f7f7] p-1">
          {['الأجندة', 'اليوم', 'الأسبوع', 'الشهر'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveView(label)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                label === activeView ? 'bg-[#d9d9d9] text-slate-900' : 'bg-white text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-slate-700">{displayMonth} {displayYear}</h3>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMonthOffset(0)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">اليوم</button>
          <button type="button" onClick={() => setMonthOffset((o) => o - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">السابق</button>
          <button type="button" onClick={() => setMonthOffset((o) => o + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">التالي</button>
        </div>
      </div>

      <div dir="ltr" className="grid grid-cols-7 overflow-hidden rounded-[1.2rem] border border-slate-200">
        {columns.map((column) => (
          <div key={column} className="border-b border-l border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-500 last:border-l-0">
            {column}
          </div>
        ))}

        {weeks.map((week, weekIndex) =>
          week.map((day, columnIndex) => {
            const cellEvents = inCurrentMonth(day, weekIndex) && monthOffset === 0 ? events[day] || [] : [];
            const isToday = day === 22 && weekIndex === 3 && columnIndex === 6 && monthOffset === 0;

            return (
              <div
                key={`${weekIndex}-${day}-${columnIndex}`}
                className={`min-h-[155px] border-b border-l border-slate-200 p-2 align-top last:border-l-0 ${
                  isToday ? 'bg-[#dcecff]' : !inCurrentMonth(day, weekIndex) ? 'bg-[#d8d8d8]' : 'bg-white'
                }`}
              >
                <div className="mb-2 text-right text-[13px] font-semibold text-slate-600">{String(day).padStart(2, '0')}</div>

                <div className="space-y-2">
                  {cellEvents.map((session) => (
                    <div key={session.id} className="overflow-hidden rounded-2xl border border-[#ffd3ad] bg-[#fff5eb] text-right shadow-sm">
                      <div className="flex items-start gap-2 border-r-[3px] border-r-[#ff8b17] p-2">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-[#a45a12]">{session.time}</div>
                          <div className="mt-1 line-clamp-2 text-[11px] text-slate-500">{session.title}</div>
                          <div className="mt-2 inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-[11px] text-slate-600">
                            {session.teacher}
                          </div>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff8b17] text-white">
                          <Video className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function CourseInfoTab({
  title,
  teacher,
  details,
  onTitleChange,
  onTeacherChange,
  onDetailsChange,
  meetingLink,
  onMeetingLinkChange,
  onCreateMeeting,
}: {
  title: string;
  teacher: string;
  details: string;
  onTitleChange: (value: string) => void;
  onTeacherChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  meetingLink: string;
  onMeetingLinkChange: (value: string) => void;
  onCreateMeeting?: () => void | Promise<void>;
}) {
  const [meetLoading, setMeetLoading] = useState(false);

  const handleMeetClick = async () => {
    if (!onCreateMeeting) return;
    setMeetLoading(true);
    try {
      await onCreateMeeting();
    } finally {
      setMeetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-start">
          <div className="space-y-5">
            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">اسم المادة</label>
              <Input value={title} onChange={(event) => onTitleChange(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">المعلم</label>
              <div className="relative">
                <select
                  value={teacher}
                  onChange={(event) => onTeacherChange(event.target.value)}
                  className="h-12 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white px-4 text-right text-sm text-slate-700 outline-none"
                >
                  <option value="ابراهيم محمد">ابراهيم محمد</option>
                  <option value="رحمة خليل">رحمة خليل</option>
                  <option value="Zainab elfadili Ibrahim">Zainab elfadili Ibrahim</option>
                </select>
                <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">التفاصيل</label>
              <RichTextBox value={details} onChange={onDetailsChange} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-950">بيانات المادة الدراسية</h2>
              <p className="mt-2 text-sm text-slate-400">قم بتعديل بيانات المادة الدراسية هنا</p>
            </div>

            <UploadPanel />
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr,280px] lg:items-start">
          <div className="space-y-2 text-right">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Link2 className="h-4 w-4" />
              رابط الاجتماع
            </label>
            <Input
              value={meetingLink}
              onChange={(event) => onMeetingLinkChange(event.target.value)}
              dir="ltr"
              className="h-12 rounded-[1rem] border-slate-200 bg-white text-left font-mono"
            />
          </div>

          <div className="space-y-4 text-right">
            <h2 className="text-3xl font-black text-slate-950">بيانات الاجتماع</h2>
            <Button onClick={handleMeetClick} disabled={meetLoading} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85 disabled:opacity-50">
              {meetLoading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Video className="ml-2 h-4 w-4" />
              )}
              {meetLoading ? 'جاري الإنشاء...' : meetingLink ? 'فتح الاجتماع' : 'إنشاء اجتماع'}
            </Button>
            {meetingLink && (
              <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline font-mono" dir="ltr">
                {meetingLink}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSectionCard({
  title,
  subtitle,
  actionLabel,
  children,
  icon: Icon,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  children: React.ReactNode;
  icon?: typeof Plus;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        {Icon && actionLabel ? (
          <Button onClick={onAction} className="h-11 rounded-full bg-[#171717] px-4 text-white hover:bg-black/85">
            <Icon className="ml-2 h-4 w-4" />
            {actionLabel}
          </Button>
        ) : actionLabel ? (
          <Button onClick={onAction} className="h-11 rounded-full bg-[#171717] px-4 text-white hover:bg-black/85">
            {actionLabel}
          </Button>
        ) : <div />}

        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function CourseListCard({
  id,
  title,
  subtitle,
  teacher,
  onDelete,
}: {
  id: string;
  title: string;
  subtitle: string;
  teacher: string;
  onDelete?: () => void;
}) {
  const locale = useLocale();
  const router = useRouter();
  const href = withLocalePrefix(`/dashboard/courses/${id}`, locale);

  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-center rounded-[1rem] bg-[#f7f7f8] py-8">
        <BookOpen className="h-8 w-8 text-slate-400" />
      </div>

      <div className="mt-5 text-right">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        <p className="mt-2 text-sm text-slate-500">{teacher}</p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-50"
        >
          حذف المادة الدراسية
        </button>
        <Link href={href} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-50">
          معاينة
        </Link>
      </div>
    </div>
  );
}

export function ReferenceCoursesCatalogPage() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const courses = json.courses || json.data || json || [];
        const mapped: CourseListItem[] = (Array.isArray(courses) ? courses : []).map((c: any) => ({
          id: c.id,
          title: c.title || '-',
          subtitle: c.description || c.subject?.title || '-',
          teacher: c.teacher_name || c.teacher?.name || '-',
        }));
        setItems(mapped);
      } catch (err) {
        if (!cancelled) setError('فشل في تحميل المواد الدراسية');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCourses();
    return () => { cancelled = true; };
  }, []);

  const filtered = items.filter((item) => [item.title, item.subtitle, item.teacher].join(' ').toLowerCase().includes(query.toLowerCase()));

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || 'فشل في حذف المادة الدراسية');
      setTimeout(() => setError(null), 4000);
    }
  }, []);

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        <SectionHeading title="المواد الدراسية" subtitle="إدارة والوصول إلى المواد الدراسية" />

        <TopBar
          action={
            <PillButton href={withLocalePrefix('/dashboard/courses/create', locale)}>
              <Plus className="h-4 w-4" />
              إنشاء مادة دراسية
            </PillButton>
          }
        >
          <PillButton variant="secondary">تصدير</PillButton>
          <PillButton variant="secondary">استيراد</PillButton>
          <SearchField placeholder="بحث عن المواد..." value={query} onChange={setQuery} />
        </TopBar>

        {loading ? <LoadingSkeleton rows={4} /> : error ? <ErrorState message={error} /> : filtered.length === 0 && !query ? <EmptyState message="لا توجد مواد دراسية بعد." /> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <CourseListCard key={course.id} {...course} onDelete={() => handleDelete(course.id)} />
            ))}
          </div>
        )}
      </div>
    </ReferenceDashboardShell>
  );
}

export function ReferenceCourseEditorPage({ courseId }: { courseId?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseDetailFixture | null>(null);
  const [courseLoading, setCourseLoading] = useState(!!courseId);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [teacher, setTeacher] = useState('ابراهيم محمد');
  const [details, setDetails] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [lessons, setLessons] = useState<CourseLessonItem[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignmentItem[]>([]);
  const [exams, setExams] = useState<CourseExamItem[]>([]);
  const [courseFeeRows, setCourseFeeRows] = useState<Array<{ id: string; plan: string; price: string; duration: string; status: string }>>([]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    async function fetchCourseDetail() {
      setCourseLoading(true);
      setCourseError(null);
      try {
        // No single-course GET endpoint exists; fetch list with max limit and find by ID
        const res = await fetch(`/api/courses?limit=50`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const courses = json.courses || [];
        const course = courses.find((c: any) => String(c.id) === String(courseId));
        if (course) {
          setTitle(course.title || '');
          setTeacher(course.teacher_name || course.teacher?.name || 'ابراهيم محمد');
          setDetails(course.description || '');
          setMeetingLink(course.meet_link || '');
          setCourseData({
            id: course.id,
            title: course.title || '',
            teacher: course.teacher_name || course.teacher?.name || '',
            details: course.description || '',
            meetingLink: course.meet_link || '',
            lessons: [],
            assignments: [],
            exams: [],
            liveSessions: [],
          });
        } else {
          if (!cancelled) setCourseError('لم يتم العثور على المادة الدراسية');
        }
      } catch (err) {
        if (!cancelled) setCourseError('فشل في تحميل بيانات المادة الدراسية');
      } finally {
        if (!cancelled) setCourseLoading(false);
      }
    }
    fetchCourseDetail();
    return () => { cancelled = true; };
  }, [courseId]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [newFeePlan, setNewFeePlan] = useState('');
  const [newFeePrice, setNewFeePrice] = useState('');
  const [newFeeDuration, setNewFeeDuration] = useState('');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addSection, setAddSection] = useState<'lesson' | 'assignment' | 'exam' | 'live' | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemVideoUrl, setNewItemVideoUrl] = useState('');
  const [newItemPublish, setNewItemPublish] = useState(false);
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemTime, setNewItemTime] = useState('');
  const [newLessonDate, setNewLessonDate] = useState('');
  const [newExamGroup, setNewExamGroup] = useState('');
  const [newExamDuration, setNewExamDuration] = useState('60');
  const [newExamPassingScore, setNewExamPassingScore] = useState('50');
  const [newExamMaxScore, setNewExamMaxScore] = useState('100');
  const [newExamStatus, setNewExamStatus] = useState('مسودة');
  const [newLessonVideoFile, setNewLessonVideoFile] = useState<string | null>(null);
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const handleSave = useCallback(async () => {
    if (!courseId) {
      showSaved('لا يمكن الحفظ بدون معرّف المادة');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courseId,
          title,
          description: details,
          instructor_name: teacher,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      showSaved('تم حفظ التغييرات بنجاح');
    } catch (err: any) {
      setSaveError(err.message || 'فشل في حفظ التغييرات');
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [courseId, title, details, teacher, showSaved]);

  const resetModal = useCallback(() => {
    setAddSection(null);
    setNewItemTitle('');
    setNewItemContent('');
    setNewItemVideoUrl('');
    setNewItemPublish(false);
    setNewItemDueDate('');
    setNewItemDescription('');
    setNewItemTime('');
    setNewLessonDate('');
    setNewExamGroup('');
    setNewExamDuration('60');
    setNewExamPassingScore('50');
    setNewExamMaxScore('100');
    setNewExamStatus('مسودة');
    setNewLessonVideoFile(null);
  }, []);

  const handleAddItem = useCallback(() => {
    if (!newItemTitle.trim()) return;
    const id = Date.now().toString();
    if (addSection === 'lesson') {
      setLessons((prev) => [...prev, { id, title: newItemTitle.trim(), description: newItemContent.trim(), date: newLessonDate || new Date().toLocaleDateString('ar-SA'), status: newItemPublish ? 'published' : 'draft' }]);
    } else if (addSection === 'assignment') {
      setAssignments((prev) => [...prev, { id, title: newItemTitle.trim(), description: newItemDescription.trim(), dueDate: newItemDueDate || '-', submissions: 0 }]);
    } else if (addSection === 'exam') {
      setExams((prev) => [...prev, { id, title: newItemTitle.trim(), status: newExamStatus === 'منشور' ? 'نشط' : 'غير نشط', dueDate: '-', attempts: 0 }]);
    }
    resetModal();
  }, [addSection, newItemTitle, newItemContent, newItemVideoUrl, newItemPublish, newItemDueDate, newItemDescription, newItemTime, newLessonDate, newExamGroup, newExamDuration, newExamPassingScore, newExamMaxScore, newExamStatus, resetModal]);

  if (courseLoading) {
    return (
      <ReferenceDashboardShell>
        <LoadingSkeleton rows={3} />
      </ReferenceDashboardShell>
    );
  }

  if (courseError) {
    return (
      <ReferenceDashboardShell>
        <ErrorState message={courseError} />
      </ReferenceDashboardShell>
    );
  }

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        {savedMsg ? (
          <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div>
        ) : null}
        {saveError ? (
          <div className="rounded-[1rem] bg-red-50 px-5 py-3 text-right text-sm font-semibold text-red-700">{saveError}</div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} disabled={saving} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85 disabled:opacity-50">
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            {saving ? 'جاري الحفظ...' : courseId ? 'حفظ' : 'حفظ المادة'}
          </Button>

          <div className="flex items-center gap-3">
            <Link href={withLocalePrefix('/dashboard/courses', locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              رجوع
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-[2.2rem] font-black text-slate-950">{courseData?.title || title || 'إنشاء مادة دراسية'}</h1>
          </div>
        </div>

        <Tabs defaultValue="info" dir="rtl" className="space-y-4">
          <TabsList className="h-auto rounded-[1.2rem] border border-slate-200 bg-[#f4f4f4] p-1">
            <TabsTrigger value="info" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              المعلومات
            </TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الدروس
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الواجبات
            </TabsTrigger>
            <TabsTrigger value="exams" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الامتحانات
            </TabsTrigger>
            <TabsTrigger value="live" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              <Video className="ml-2 h-4 w-4" />
              الحصص المباشرة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <CourseInfoTab
              title={title}
              teacher={teacher}
              details={details}
              onTitleChange={setTitle}
              onTeacherChange={setTeacher}
              onDetailsChange={setDetails}
              meetingLink={meetingLink}
              onMeetingLinkChange={setMeetingLink}
              onCreateMeeting={async () => {
                if (meetingLink) {
                  window.open(meetingLink, '_blank');
                  return;
                }

                // Generate a meet link via API — no client-side fallback (fake links cause invalid meeting codes)
                try {
                  const res = await fetch('/api/meetings/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      courseId: courseId || 'new',
                      title: title || 'Eduverse Meeting',
                      description: details || '',
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.meetLink) {
                    setMeetingLink(data.meetLink);
                    showSaved('تم إنشاء رابط الاجتماع بنجاح');
                    return;
                  }
                  showSaved(data.error || 'فشل إنشاء رابط الاجتماع');
                } catch {
                  showSaved('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
                }
              }}
            />
          </TabsContent>

          <TabsContent value="lessons" className="mt-0">
            <ListSectionCard title="دروس المادة الدراسية" subtitle="إدارة دروس هذه المادة الدراسية." actionLabel="إضافة درس جديد" icon={Plus} onAction={() => setAddSection('lesson')}>
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-start justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                    <div className="flex gap-1">
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
                          setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
                        }
                      }} />
                      <ActionIcon icon={Pencil} onClick={() => router.push(withLocalePrefix(`/dashboard/lessons/${lesson.id}`, locale))} />
                      <Link href={withLocalePrefix(`/dashboard/lessons/${lesson.id}`, locale)}>
                        <ActionIcon icon={Eye} />
                      </Link>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusChip label={lesson.status === 'published' ? 'منشور' : 'مسودة'} tone={lesson.status === 'published' ? 'success' : 'default'} />
                        <h3 className="text-lg font-bold text-slate-950">{lesson.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{lesson.description}</p>
                      <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="assignments" className="mt-0">
            <ListSectionCard title="اختبارات المادة الدراسية" subtitle="إدارة اختبارات هذه المادة الدراسية.">
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                      <div className="flex gap-1">
                        <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
                            setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
                          }
                        }} />
                        <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر الاختبار...')} />
                      </div>

                      <div className="text-right">
                        <h3 className="text-lg font-bold text-slate-950">{assignment.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">{assignment.description}</p>
                        <div className="mt-3 flex items-center justify-end gap-3 text-xs text-slate-400">
                          <span>{assignment.submissions} تسليماً</span>
                          <span>{assignment.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-slate-200 bg-white py-12 text-center">
                  <p className="text-sm text-slate-500">لا توجد اختبارات</p>
                  <p className="mt-1 text-xs text-slate-400">قم بالاضافة من شاشة الدروس</p>
                </div>
              )}
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="exams" className="mt-0">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAddSection('exam')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  إضافة امتحان جديد
                </button>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-slate-950">امتحانات المادة الدراسية</h2>
                  <p className="mt-1 text-sm text-slate-400">إدارة امتحانات هذه المادة الدراسية.</p>
                </div>
              </div>

              <div className="text-right font-bold text-xl text-slate-900 mb-4">الامتحانات</div>

              {exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex items-start justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                      <div className="flex gap-1">
                        <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
                            setExams((prev) => prev.filter((e) => e.id !== exam.id));
                          }
                        }} />
                        <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر الامتحان...')} />
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StatusChip label={exam.status} tone={exam.status === 'نشط' ? 'success' : 'default'} />
                          <h3 className="text-lg font-bold text-slate-950">{exam.title}</h3>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-3 text-xs text-slate-400">
                          <span>{exam.attempts} محاولات</span>
                          <span>{exam.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-slate-200 bg-white py-16 text-center">
                  <FileText className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-sm text-slate-500">لم يتم إضافة أي امتحانات بعد</p>
                  <button
                    type="button"
                    onClick={() => setAddSection('exam')}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    قم بإضافة اول امتحان
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button onClick={() => setAddSection('live')} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85">
                  إضافة درس مباشر
                </Button>

                <div className="flex items-center gap-3">
                  <h2 className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-800">الفصول المباشرة</h2>
                  <span className="rounded-2xl bg-[#f4f4f4] px-4 py-3 text-sm text-slate-500">العرض</span>
                </div>
              </div>

              <CalendarMonthView liveSessions={courseData?.liveSessions || []} />
            </div>
          </TabsContent>

          <TabsContent value="fees" className="mt-0">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddFee(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  إضافة رسوم
                </button>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-slate-950">الرسوم</h2>
                  <p className="mt-1 text-sm text-slate-400">خطط الرسوم الدراسية لهذه المادة.</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white">
                <table className="w-full text-right text-sm">
                  <thead className="border-b border-slate-200 bg-[#f4f4f4]">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-slate-700">اسم الخطة</th>
                      <th className="px-5 py-3 font-semibold text-slate-700">السعر</th>
                      <th className="px-5 py-3 font-semibold text-slate-700">المدة</th>
                      <th className="px-5 py-3 font-semibold text-slate-700">الحالة</th>
                      <th className="px-5 py-3 font-semibold text-slate-700 w-[100px]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseFeeRows.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-900">{fee.plan}</td>
                        <td className="px-5 py-4 text-slate-700">{fee.price}</td>
                        <td className="px-5 py-4 text-slate-500">{fee.duration}</td>
                        <td className="px-5 py-4">
                          <StatusChip label={fee.status} tone={fee.status === 'نشط' ? 'success' : 'default'} />
                        </td>
                        <td className="px-5 py-4">
                          <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
                              setCourseFeeRows((prev) => prev.filter((f) => f.id !== fee.id));
                            }
                          }} />
                        </td>
                      </tr>
                    ))}
                    {!courseFeeRows.length ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">لا توجد خطط رسوم مضافة بعد.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {addSection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full rounded-[1.7rem] bg-white p-6 shadow-2xl ${addSection === 'exam' ? 'max-w-2xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
            <div className="mb-5 text-right">
              <h3 className="text-2xl font-black text-slate-950">
                {addSection === 'lesson' ? 'إنشاء درس' : addSection === 'assignment' ? 'إضافة واجب جديد' : addSection === 'exam' ? 'إنشاء امتحان' : 'إضافة حصة مباشرة'}
              </h3>
              {addSection === 'lesson' ? (
                <p className="mt-2 text-sm text-slate-400">إضافة درس جديد للمادة الدراسية</p>
              ) : addSection === 'exam' ? (
                <p className="mt-2 text-sm text-slate-400">إدارة امتحانات هذه المادة الدراسية.</p>
              ) : null}
            </div>

            <div className="space-y-4 text-right">
              {/* Title field — all types */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {addSection === 'lesson' ? 'عنوان الدرس' : addSection === 'assignment' ? 'عنوان الواجب' : addSection === 'exam' ? 'عنوان الامتحان' : 'عنوان الحصة'}
                </label>
                <Input
                  value={newItemTitle}
                  onChange={(event) => setNewItemTitle(event.target.value)}
                  placeholder={addSection === 'lesson' ? 'أدخل عنوان الدرس' : addSection === 'assignment' ? 'أدخل عنوان الواجب' : addSection === 'exam' ? 'العنوان' : 'أدخل عنوان الحصة'}
                  autoFocus
                  className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                />
              </div>

              {/* Content textarea — lesson only */}
              {addSection === 'lesson' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">المحتوى</label>
                  <Textarea
                    value={newItemContent}
                    onChange={(event) => setNewItemContent(event.target.value)}
                    placeholder="أدخل محتوى الدرس"
                    className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Description textarea — assignment only */}
              {addSection === 'assignment' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">الوصف</label>
                  <Textarea
                    value={newItemDescription}
                    onChange={(event) => setNewItemDescription(event.target.value)}
                    placeholder="أدخل الوصف"
                    className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Exam-specific fields matching reference */}
              {addSection === 'exam' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">التفاصيل</label>
                    <Textarea
                      value={newItemDescription}
                      onChange={(event) => setNewItemDescription(event.target.value)}
                      placeholder="التفاصيل"
                      className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">مجموعة الاختبارات</label>
                    <div className="relative">
                      <select
                        value={newExamGroup}
                        onChange={(event) => setNewExamGroup(event.target.value)}
                        className="h-12 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white px-4 text-right text-sm text-slate-700 outline-none"
                      >
                        <option value="">اختر مجموعة</option>
                        <option value="اختبارات نهائية">اختبارات نهائية</option>
                        <option value="اختبارات شهرية">اختبارات شهرية</option>
                        <option value="اختبارات يومية">اختبارات يومية</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">المدة</label>
                    <Input
                      type="number"
                      value={newExamDuration}
                      onChange={(event) => setNewExamDuration(event.target.value)}
                      placeholder="60"
                      className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">درجة النجاح</label>
                    <Input
                      type="number"
                      value={newExamPassingScore}
                      onChange={(event) => setNewExamPassingScore(event.target.value)}
                      placeholder="50"
                      className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">اعلى درجة</label>
                    <Input
                      type="number"
                      value={newExamMaxScore}
                      onChange={(event) => setNewExamMaxScore(event.target.value)}
                      placeholder="100"
                      className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الحالة</label>
                    <div className="relative">
                      <select
                        value={newExamStatus}
                        onChange={(event) => setNewExamStatus(event.target.value)}
                        className="h-12 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white px-4 text-right text-sm text-slate-700 outline-none"
                      >
                        <option value="مسودة">مسودة</option>
                        <option value="منشور">منشور</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </>
              ) : null}

              {/* Due date — assignment only */}
              {addSection === 'assignment' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">تاريخ الاستحقاق</label>
                  <Input
                    type="date"
                    value={newItemDueDate}
                    onChange={(event) => setNewItemDueDate(event.target.value)}
                    className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Lesson date — optional */}
              {addSection === 'lesson' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    تاريخ الدرس
                    <span className="mr-1 text-xs font-normal text-slate-400">(اختياري)</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={newLessonDate}
                    onChange={(event) => setNewLessonDate(event.target.value)}
                    placeholder="اختر تاريخ ووقت الدرس"
                    className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Date field — live session */}
              {addSection === 'live' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">التاريخ</label>
                  <Input
                    type="date"
                    value={newItemDueDate}
                    onChange={(event) => setNewItemDueDate(event.target.value)}
                    className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Time field — live session */}
              {addSection === 'live' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">الوقت</label>
                  <Input
                    type="time"
                    value={newItemTime}
                    onChange={(event) => setNewItemTime(event.target.value)}
                    className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
                  />
                </div>
              ) : null}

              {/* Video file upload — lesson only (matching reference) */}
              {addSection === 'lesson' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    رابط الفيديو
                    <span className="mr-1 text-xs font-normal text-slate-400">(اختياري)</span>
                  </label>
                  <input
                    ref={lessonVideoInputRef}
                    type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/webm,video/3gpp,video/x-msvideo,video/x-matroska,video/x-flv,video/x-ms-wmv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewLessonVideoFile(file.name);
                    }}
                  />
                  <div className="flex min-h-[120px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-6 text-center">
                    <UploadCloud className="mb-3 h-8 w-8 text-slate-400" strokeWidth={1.5} />
                    <p className="text-sm text-slate-500">
                      {newLessonVideoFile ? newLessonVideoFile : 'قم بسحب الملف هنا او'}
                    </p>
                    {!newLessonVideoFile ? (
                      <button
                        type="button"
                        onClick={() => lessonVideoInputRef.current?.click()}
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm"
                      >
                        اختر ملف
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewLessonVideoFile(null)}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        إزالة
                      </button>
                    )}
                    <p className="mt-2 text-xs text-slate-400">الحد الأقصى: 300 ميجابايت | mp4, mpeg, mov, webm, avi, mkv</p>
                  </div>
                </div>
              ) : null}

              {/* Live session link */}
              {addSection === 'live' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">رابط الحصة</label>
                  <Input
                    dir="ltr"
                    value={newItemVideoUrl}
                    onChange={(event) => setNewItemVideoUrl(event.target.value)}
                    placeholder="https://"
                    className="h-12 rounded-[1rem] border-slate-200 bg-white font-mono"
                  />
                </div>
              ) : null}

              {/* Publish checkbox — lesson only */}
              {addSection === 'lesson' ? (
                <div className="flex items-center justify-end gap-3 pt-1">
                  <label className="text-sm font-semibold text-slate-700">نشر هذا الدرس</label>
                  <input
                    type="checkbox"
                    checked={newItemPublish}
                    onChange={(event) => setNewItemPublish(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-start gap-3">
              <button type="button" onClick={handleAddItem} className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white">
                {addSection === 'exam' ? <><Save className="h-4 w-4" /> إنشاء</> : addSection === 'lesson' ? 'إنشاء' : addSection === 'assignment' ? 'إنشاء واجب' : 'إضافة حصة'}
              </button>
              <button type="button" onClick={resetModal} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAddFee ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[520px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 text-right">
              <h3 className="text-2xl font-black text-slate-950">إضافة رسوم</h3>
            </div>
            <div className="space-y-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">اسم الخطة</label>
                <Input value={newFeePlan} onChange={(event) => setNewFeePlan(event.target.value)} placeholder="مثال: شهري" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">السعر</label>
                <Input value={newFeePrice} onChange={(event) => setNewFeePrice(event.target.value)} placeholder="مثال: 100 ر.س" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">المدة</label>
                <Input value={newFeeDuration} onChange={(event) => setNewFeeDuration(event.target.value)} placeholder="مثال: شهر واحد" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
              </div>
            </div>
            <div className="mt-6 flex justify-start gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!newFeePlan.trim()) return;
                  setCourseFeeRows((prev) => [...prev, { id: Date.now().toString(), plan: newFeePlan.trim(), price: newFeePrice.trim() || '-', duration: newFeeDuration.trim() || '-', status: 'نشط' }]);
                  setNewFeePlan(''); setNewFeePrice(''); setNewFeeDuration('');
                  setShowAddFee(false);
                }}
                className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white"
              >
                إضافة
              </button>
              <button type="button" onClick={() => { setShowAddFee(false); setNewFeePlan(''); setNewFeePrice(''); setNewFeeDuration(''); }} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ReferenceDashboardShell>
  );
}

export function ReferenceCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editRow, setEditRow] = useState<CategoryRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const mapped: CategoryRow[] = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id || '-',
          name: item.name || item.name_ar || '-',
          description: item.description || 'لا يوجد وصف',
          courses: '—',
          bundles: '—',
          createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '-',
        }));
        setRows(mapped);
      } catch (err) {
        if (!cancelled) setError('فشل في تحميل الفئات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const filtered = rows.filter((row) => [row.name, row.description].join(' ').toLowerCase().includes(query.toLowerCase()));

  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), name_ar: name.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows((current) => [
        {
          id: data.id || '-',
          name: data.name || name.trim(),
          description: data.description || description.trim() || 'لا يوجد وصف',
          courses: '—',
          bundles: '—',
          createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString('ar-EG') : '-',
        },
        ...current,
      ]);
      setName('');
      setDescription('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        <SectionHeading title="الفئات" subtitle="إدارة فئات المواد الدراسية والفصول" />

        <TopBar action={<PillButton onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4" />إنشاء فئة</PillButton>}>
          <SearchField placeholder="بحث عن الفئات..." value={query} onChange={setQuery} />
        </TopBar>

        {loading ? <LoadingSkeleton rows={3} /> : error ? <ErrorState message={error} /> : filtered.length === 0 && !query ? <EmptyState message="لا توجد فئات بعد." /> : (
        <ReferenceTable>
          <ReferenceTableHeader>
            <ReferenceTableRow>
              <ReferenceTableHead>المعرف</ReferenceTableHead>
              <ReferenceTableHead>الاسم</ReferenceTableHead>
              <ReferenceTableHead>الوصف</ReferenceTableHead>
              <ReferenceTableHead>المواد الدراسية</ReferenceTableHead>
              <ReferenceTableHead>الفصول</ReferenceTableHead>
              <ReferenceTableHead>تاريخ الإنشاء</ReferenceTableHead>
              <ReferenceTableHead className="w-[120px]">الإجراءات</ReferenceTableHead>
            </ReferenceTableRow>
          </ReferenceTableHeader>
          <ReferenceTableBody>
            {filtered.map((row) => (
              <ReferenceTableRow key={row.id}>
                <ReferenceTableCell className="font-bold text-slate-700">{row.id}</ReferenceTableCell>
                <ReferenceTableCell className="font-semibold">{row.name}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.description}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-300">{row.courses}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-300">{row.bundles}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.createdAt}</ReferenceTableCell>
                <ReferenceTableCell>
                  <button
                    type="button"
                    onClick={() => { setEditRow(row); setEditName(row.name); setEditDescription(row.description); }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    فتح القائمة
                  </button>
                </ReferenceTableCell>
              </ReferenceTableRow>
            ))}
          </ReferenceTableBody>
        </ReferenceTable>
        )}

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[520px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
              <div className="text-right">
                <h3 className="text-3xl font-black text-slate-950">إنشاء فئة</h3>
                <p className="mt-2 text-sm text-slate-400">إضافة فئة جديدة للمواد الدراسية والفصول.</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الاسم</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الوصف</label>
                  <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="لا يوجد وصف" className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
              </div>

              <div className="mt-6 flex justify-start gap-3">
                <button type="button" onClick={handleCreate} className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white">
                  إنشاء
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {editRow ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[520px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
              <div className="text-right">
                <h3 className="text-3xl font-black text-slate-950">تعديل فئة</h3>
              </div>
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الاسم</label>
                  <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الوصف</label>
                  <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="min-h-[100px] rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>
              </div>
              <div className="mt-6 flex justify-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!editName.trim()) return;
                    setRows((prev) => prev.map((r) => r.id === editRow.id ? { ...r, name: editName.trim(), description: editDescription.trim() } : r));
                    setEditRow(null);
                  }}
                  className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white"
                >
                  حفظ
                </button>
                <button type="button" onClick={() => setEditRow(null)} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ReferenceDashboardShell>
  );
}

export function ReferenceBundlesPage() {
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [bundleRowsData, setBundleRowsData] = useState<BundleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBundles() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/bundles');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const data = json.data || json || [];
        const mapped: BundleRow[] = (Array.isArray(data) ? data : []).map((item: any, idx: number) => ({
          id: `#${idx + 1}`,
          name: item.name || '-',
          description: item.description || '-',
          category: item.category || '-',
          teacher: item.teacher_name || item.teacher || '-',
          students: item.students_count ?? 0,
          status: item.status === 'active' ? 'نشط' : (item.status || 'نشط'),
          createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA') : '-',
        }));
        setBundleRowsData(mapped);
      } catch (err) {
        if (!cancelled) setError('فشل في تحميل الفصول');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBundles();
    return () => { cancelled = true; };
  }, []);

  const filtered = bundleRowsData.filter((row) => [row.name, row.description, row.teacher].join(' ').toLowerCase().includes(query.toLowerCase()));

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        <SectionHeading title="الفصول" subtitle="إدارة الفصول والبرامج الأكاديمية" />

        <TopBar
          action={
            <PillButton href={withLocalePrefix('/dashboard/bundles/create', locale)}>
              <Plus className="h-4 w-4" />
              إنشاء فصل
            </PillButton>
          }
        >
          <SearchField placeholder="بحث عن الفصول..." value={query} onChange={setQuery} />
        </TopBar>

        {loading ? <LoadingSkeleton rows={3} /> : error ? <ErrorState message={error} /> : filtered.length === 0 && !query ? <EmptyState message="لا توجد فصول بعد." /> : (
        <ReferenceTable>
          <ReferenceTableHeader>
            <ReferenceTableRow>
              <ReferenceTableHead>المعرف</ReferenceTableHead>
              <ReferenceTableHead>الاسم</ReferenceTableHead>
              <ReferenceTableHead>الوصف</ReferenceTableHead>
              <ReferenceTableHead>الفئة</ReferenceTableHead>
              <ReferenceTableHead>المعلم</ReferenceTableHead>
              <ReferenceTableHead>الطلاب</ReferenceTableHead>
              <ReferenceTableHead>الحالة</ReferenceTableHead>
              <ReferenceTableHead>تاريخ الإنشاء</ReferenceTableHead>
              <ReferenceTableHead>الإجراءات</ReferenceTableHead>
            </ReferenceTableRow>
          </ReferenceTableHeader>
          <ReferenceTableBody>
            {filtered.map((row) => (
              <ReferenceTableRow key={row.id}>
                <ReferenceTableCell className="font-bold text-slate-700">{row.id}</ReferenceTableCell>
                <ReferenceTableCell className="font-semibold">
                  <Link href={withLocalePrefix(`/dashboard/bundles/${row.id.replace('#', '')}`, locale)} className="hover:text-slate-950 hover:underline">
                    {row.name}
                  </Link>
                </ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.description}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.category}</ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.teacher}</ReferenceTableCell>
                <ReferenceTableCell className="font-semibold">{row.students}</ReferenceTableCell>
                <ReferenceTableCell>
                  <StatusChip label={row.status} tone="success" />
                </ReferenceTableCell>
                <ReferenceTableCell className="text-slate-500">{row.createdAt}</ReferenceTableCell>
                <ReferenceTableCell>
                  <div className="flex items-center gap-2">
                    <Link href={withLocalePrefix(`/dashboard/bundles/${row.id.replace('#', '')}`, locale)}>
                      <ActionIcon icon={Eye} />
                    </Link>
                    <ActionIcon icon={Pencil} onClick={() => router.push(withLocalePrefix(`/dashboard/bundles/${row.id.replace('#', '')}`, locale))} />
                  </div>
                </ReferenceTableCell>
              </ReferenceTableRow>
            ))}
          </ReferenceTableBody>
        </ReferenceTable>
        )}
      </div>
    </ReferenceDashboardShell>
  );
}

export function ReferenceBundleEditorPage({ bundleId }: { bundleId?: string }) {
  const locale = useLocale();
  const [bundleData, setBundleData] = useState<BundleDetailFixture | null>(null);
  const [bundleLoading, setBundleLoading] = useState(!!bundleId);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [teacher, setTeacher] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [acceptingRequests, setAcceptingRequests] = useState(true);
  const [active, setActive] = useState(true);
  const [studentQuery, setStudentQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState<'الكل' | 'نشط' | 'قيد المراجعة'>('الكل');
  const [subjects, setSubjects] = useState<BundleSubject[]>([]);
  const [schedule, setSchedule] = useState<BundleScheduleItem[]>([]);
  const [fees, setFees] = useState<BundleFeeItem[]>([]);
  const [students, setStudents] = useState<BundleStudentItem[]>([]);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [addSection, setAddSection] = useState<'subject' | 'schedule' | 'fee' | 'student' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (!bundleId) return;
    let cancelled = false;
    async function fetchBundleDetail() {
      setBundleLoading(true);
      setBundleError(null);
      try {
        const res = await fetch('/api/admin/bundles');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const data = json.data || json || [];
        const bundle = (Array.isArray(data) ? data : []).find((b: any) => String(b.id) === String(bundleId));
        if (bundle) {
          setName(bundle.name || '');
          setDescription(bundle.description || '');
          setCategory(bundle.category || '');
          setTeacher(bundle.teacher_name || bundle.teacher || '');
          setStartDate(bundle.start_date || '');
          setEndDate(bundle.end_date || '');
          setAcceptingRequests(bundle.accepting_requests ?? true);
          setActive(bundle.status === 'active');
          setBundleData({
            id: bundle.id,
            name: bundle.name || '',
            description: bundle.description || '',
            category: bundle.category || '',
            teacher: bundle.teacher_name || bundle.teacher || '',
            startDate: bundle.start_date || '',
            endDate: bundle.end_date || '',
            acceptingRequests: bundle.accepting_requests ?? true,
            active: bundle.status === 'active',
          });
        }
      } catch (err) {
        if (!cancelled) setBundleError('فشل في تحميل بيانات الفصل');
      } finally {
        if (!cancelled) setBundleLoading(false);
      }
    }
    fetchBundleDetail();
    return () => { cancelled = true; };
  }, [bundleId]);

  const toggleClass = 'relative inline-flex h-6 w-11 items-center rounded-full transition';

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const handleSave = useCallback(() => showSaved(), [showSaved]);

  const handleAddItem = useCallback(() => {
    if (!newItemName.trim()) return;
    const id = Date.now().toString();
    if (addSection === 'subject') {
      setSubjects((prev) => [...prev, { id, name: newItemName.trim(), teacher: '-', liveLink: '' }]);
    } else if (addSection === 'schedule') {
      setSchedule((prev) => [...prev, { id, subject: newItemName.trim(), day: '-', time: '-' }]);
    } else if (addSection === 'fee') {
      setFees((prev) => [...prev, { id, title: newItemName.trim(), amount: '-', dueDate: '-' }]);
    } else if (addSection === 'student') {
      setStudents((prev) => [...prev, { id, name: newItemName.trim(), email: '-', phone: '-', status: 'قيد المراجعة', joinedAt: new Date().toLocaleDateString('ar-SA'), acceptedAt: '-' }]);
    }
    setNewItemName('');
    setAddSection(null);
  }, [addSection, newItemName]);

  const filteredStudents = students.filter((student) => {
    const matchesStatus = studentFilter === 'الكل' || student.status === studentFilter;
    const haystack = [student.name, student.email, student.phone, student.joinedAt, student.acceptedAt].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(studentQuery.toLowerCase());
  });

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        {savedMsg ? (
          <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85">
            <Save className="ml-2 h-4 w-4" />
            حفظ الفصل
          </Button>

          <div className="flex items-center gap-3">
            <Link href={withLocalePrefix('/dashboard/bundles', locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              رجوع
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <SectionHeading title={bundleData?.name || name || 'إنشاء فصل'} subtitle="" />
          </div>
        </div>

        <Tabs defaultValue="info" dir="rtl" className="space-y-4">
          <TabsList className="h-auto rounded-[1.2rem] border border-slate-200 bg-[#f4f4f4] p-1">
            <TabsTrigger value="info" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              معلومات
            </TabsTrigger>
            <TabsTrigger value="subjects" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              المواد الدراسية
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الجدول
            </TabsTrigger>
            <TabsTrigger value="fees" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الرسوم
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              الطلاب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
              <div className="mb-6 text-right">
                <h2 className="text-3xl font-black text-slate-950">معلومات الفصل</h2>
                <p className="mt-2 text-sm text-slate-400">معلومات أساسية عن الفصل بما في ذلك الاسم والوصف والإعدادات.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">اسم الفصل *</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الوصف</label>
                  <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-[120px] rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">الفئة</label>
                  <div className="relative">
                    <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white px-4 text-right text-sm text-slate-700 outline-none">
                      <option value="">اختر فئة</option>
                      <option value="اللغات">اللغات</option>
                      <option value="second">second</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">المعلم</label>
                  <div className="relative">
                    <select value={teacher} onChange={(event) => setTeacher(event.target.value)} className="h-12 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white px-4 text-right text-sm text-slate-700 outline-none">
                      <option value="">اختر المعلم</option>
                      <option value="ابراهيم محمد">ابراهيم محمد</option>
                      <option value="رحمة خليل">رحمة خليل</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-semibold text-slate-700">تاريخ البدء</label>
                    <Input value={startDate} onChange={(event) => setStartDate(event.target.value)} placeholder="اختر تاريخ" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-semibold text-slate-700">تاريخ الانتهاء</label>
                    <Input value={endDate} onChange={(event) => setEndDate(event.target.value)} placeholder="اختر تاريخ" className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-10 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700">قبول الطلبات</label>
                    <button type="button" onClick={() => setAcceptingRequests((current) => !current)} className={`${toggleClass} ${acceptingRequests ? 'bg-[#111111]' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${acceptingRequests ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700">نشط</label>
                    <button type="button" onClick={() => setActive((current) => !current)} className={`${toggleClass} ${active ? 'bg-[#111111]' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <label className="text-sm font-semibold text-slate-700">صورة الفصل</label>
                  <UploadPanel />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="mt-0">
            <ListSectionCard title="المواد الدراسية" subtitle="إدارة المواد التعليمية داخل هذا الفصل." actionLabel="إضافة مادة دراسية جديدة" icon={Plus} onAction={() => setAddSection('subject')}>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-start justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => { if (subject.liveLink) { window.open(subject.liveLink, '_blank'); } else { showSaved('لا يوجد رابط للحصة المباشرة'); } }}
                        className="h-9 rounded-full border-slate-200 bg-white px-4 text-xs font-bold"
                      >
                        <Video className="ml-2 h-4 w-4" />
                        بدء حصة مباشرة
                      </Button>
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
                          setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
                        }
                      }} />
                      <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر المادة...')} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-slate-950">{subject.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{subject.teacher}</p>
                      <p className="mt-2 text-xs font-mono text-slate-400">{subject.liveLink}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <ListSectionCard title="جدول الفصل" subtitle="قم بإعداد جدول لجلسات هذا الفصل." actionLabel="إضافة جدول" icon={Calendar} onAction={() => setAddSection('schedule')}>
              <div className="space-y-4">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                    <div className="flex gap-1">
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
                          setSchedule((prev) => prev.filter((s) => s.id !== item.id));
                        }
                      }} />
                      <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر الموعد...')} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-slate-950">{item.subject}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.day} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="fees" className="mt-0">
            <ListSectionCard title="الرسوم" subtitle="رسوم الفصل" actionLabel="اضافة رسوم" icon={FileText} onAction={() => setAddSection('fee')}>
              <div className="space-y-4">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                    <div className="flex gap-1">
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الرسم؟')) {
                          setFees((prev) => prev.filter((f) => f.id !== fee.id));
                        }
                      }} />
                      <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر الرسم...')} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-slate-950">{fee.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{fee.amount} • {fee.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="students" className="mt-0">
            <ListSectionCard title="الطلاب" subtitle="طلاب الفصل">
              <div className="mb-5 flex flex-col gap-3 rounded-[1.2rem] border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {(['الكل', 'نشط', 'قيد المراجعة'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStudentFilter(status)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        studentFilter === status ? 'bg-slate-950 text-white' : 'bg-[#f4f4f5] text-slate-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <SearchField placeholder="بحث عن طالب..." value={studentQuery} onChange={setStudentQuery} />
              </div>

              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <ActionIcon icon={Phone} onClick={() => { if (student.phone && student.phone !== '-') window.open(`tel:${student.phone}`); }} />
                      <ActionIcon icon={MessageSquare} onClick={() => showSaved(`سيتم التواصل مع ${student.name}`)} />
                      <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف الطالب ${student.name}؟`)) {
                          setStudents((prev) => prev.filter((s) => s.id !== student.id));
                        }
                      }} />
                      <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح ملف الطالب...')} />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusChip label={student.status} tone={student.status === 'نشط' ? 'success' : 'default'} />
                        <h3 className="text-lg font-bold text-slate-950">{student.name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{student.email}</p>
                      <div className="mt-2 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-400">
                        <span>{student.phone}</span>
                        <span>تاريخ الانضمام: {student.joinedAt}</span>
                        <span>تاريخ القبول: {student.acceptedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredStudents.length ? (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    لا يوجد طلاب مطابقون لنتائج البحث الحالية.
                  </div>
                ) : null}
              </div>
            </ListSectionCard>
          </TabsContent>
        </Tabs>
      </div>

      {addSection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
            <div className="text-right">
              <h3 className="text-2xl font-black text-slate-950">
                {addSection === 'subject' ? 'إضافة مادة' : addSection === 'schedule' ? 'إضافة موعد' : addSection === 'fee' ? 'إضافة رسم' : 'إضافة طالب'}
              </h3>
            </div>
            <div className="mt-4 space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">{addSection === 'student' ? 'الاسم' : 'الاسم / العنوان'}</label>
              <Input
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleAddItem(); }}
                autoFocus
                className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
              />
            </div>
            <div className="mt-6 flex justify-start gap-3">
              <button type="button" onClick={handleAddItem} className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white">
                إضافة
              </button>
              <button type="button" onClick={() => { setAddSection(null); setNewItemName(''); }} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ReferenceDashboardShell>
  );
}

export function ReferenceLessonDetailPage({ lessonId }: { lessonId: string }) {
  const locale = useLocale();
  const [lessonData, setLessonData] = useState<LessonDetailFixture | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [materials, setMaterials] = useState<LessonReferenceMaterial[]>([]);
  const [attendance, setAttendance] = useState<LessonReferenceAttendance[]>([]);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchLessonDetail() {
      setLessonLoading(true);
      setLessonError(null);
      try {
        // Fetch lesson materials
        const matRes = await fetch(`/api/lessons/${lessonId}/materials`);
        let mats: LessonReferenceMaterial[] = [];
        if (matRes.ok) {
          const matData = await matRes.json();
          mats = (Array.isArray(matData) ? matData : matData.materials || []).map((m: any) => ({
            id: m.id || Date.now().toString(),
            title: m.title || m.name || '-',
            type: m.type || m.file_type || 'ملف',
          }));
        }

        // Fetch lesson attendance
        const attRes = await fetch(`/api/lessons/${lessonId}/attendance`);
        let att: LessonReferenceAttendance[] = [];
        if (attRes.ok) {
          const attData = await attRes.json();
          att = (Array.isArray(attData) ? attData : attData.attendance || []).map((a: any) => ({
            id: a.id || Date.now().toString(),
            studentName: a.student_name || a.student?.name || '-',
            status: a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : a.status === 'late' ? 'متأخر' : (a.status || 'حاضر'),
          }));
        }

        if (cancelled) return;

        const ld: LessonDetailFixture = {
          id: lessonId,
          courseId: '',
          title: '',
          content: '',
          videoLink: '',
          materials: mats,
          attendance: att,
        };
        setLessonData(ld);
        setMaterials(mats);
        setAttendance(att);
      } catch (err) {
        if (!cancelled) setLessonError('فشل في تحميل بيانات الدرس');
      } finally {
        if (!cancelled) setLessonLoading(false);
      }
    }
    fetchLessonDetail();
    return () => { cancelled = true; };
  }, [lessonId]);

  const showSaved = useCallback((msg = 'تم الحفظ بنجاح') => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  }, []);

  const handleSave = useCallback(() => showSaved(), [showSaved]);

  const handleAddMaterial = useCallback(() => {
    if (!newMaterialTitle.trim()) return;
    setMaterials((prev) => [...prev, { id: Date.now().toString(), title: newMaterialTitle.trim(), type: 'ملف' }]);
    setNewMaterialTitle('');
    setAddMaterialOpen(false);
  }, [newMaterialTitle]);

  const cycleAttendance = useCallback((id: string) => {
    setAttendance((prev) => prev.map((row) => {
      if (row.id !== id) return row;
      const next = row.status === 'حاضر' ? 'غائب' : row.status === 'غائب' ? 'متأخر' : 'حاضر';
      return { ...row, status: next as 'حاضر' | 'غائب' | 'متأخر' };
    }));
  }, []);

  if (lessonLoading) {
    return (
      <ReferenceDashboardShell>
        <LoadingSkeleton rows={3} />
      </ReferenceDashboardShell>
    );
  }

  if (lessonError) {
    return (
      <ReferenceDashboardShell>
        <ErrorState message={lessonError} />
      </ReferenceDashboardShell>
    );
  }

  return (
    <ReferenceDashboardShell>
      <div className="space-y-6">
        {savedMsg ? (
          <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85">
            <Save className="ml-2 h-4 w-4" />
            حفظ الدرس
          </Button>

          <div className="flex items-center gap-3">
            <Link href={withLocalePrefix(`/dashboard/courses/${lessonData?.courseId || ''}`, locale)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              رجوع
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-[2.2rem] font-black text-slate-950">{title || lessonData?.title || 'درس'}</h1>
          </div>
        </div>

        <Tabs defaultValue="title" dir="rtl" className="space-y-4">
          <TabsList className="h-auto rounded-[1.2rem] border border-slate-200 bg-[#f4f4f4] p-1">
            <TabsTrigger value="title" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              عنوان الدرس
            </TabsTrigger>
            <TabsTrigger value="materials" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              مواد الدرس
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-[0.9rem] px-5 py-3 data-[state=active]:shadow-none">
              حضور الطلاب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="title" className="mt-0">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
              <div className="space-y-5">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">عنوان الدرس</label>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">محتوى الدرس</label>
                  <Textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-[160px] rounded-[1rem] border-slate-200 bg-white text-right" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-semibold text-slate-700">رابط الفيديو</label>
                  <Input value={videoLink} onChange={(event) => setVideoLink(event.target.value)} dir="ltr" className="h-12 rounded-[1rem] border-slate-200 bg-white text-left font-mono" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="mt-0">
            <ListSectionCard title="مواد الدرس" subtitle="الملفات والمواد المرفقة بهذا الدرس." actionLabel="إضافة مادة" icon={Plus} onAction={() => setAddMaterialOpen(true)}>
              <div className="space-y-4">
                {materials.length ? (
                  materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                      <div className="flex gap-1">
                        <ActionIcon icon={Trash2} tone="danger" onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
                            setMaterials((prev) => prev.filter((m) => m.id !== material.id));
                          }
                        }} />
                        <ActionIcon icon={Pencil} onClick={() => showSaved('جارٍ فتح محرر المادة...')} />
                      </div>

                      <div className="text-right">
                        <h3 className="text-lg font-bold text-slate-950">{material.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{material.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    لا توجد مواد مرفقة لهذا الدرس بعد.
                  </div>
                )}
              </div>
            </ListSectionCard>
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <ListSectionCard title="حضور الطلاب" subtitle="اضغط على الحالة لتغييرها. احفظ بعد الانتهاء." actionLabel="تحديث الحضور" icon={Users} onAction={() => showSaved('تم تحديث الحضور')}>
              <div className="space-y-4">
                {attendance.length ? (
                  attendance.map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white p-4">
                      <button
                        type="button"
                        onClick={() => cycleAttendance(row.id)}
                        className="flex gap-1 focus:outline-none"
                        title="اضغط لتغيير حالة الحضور"
                      >
                        <StatusChip
                          label={row.status}
                          tone={row.status === 'حاضر' ? 'success' : row.status === 'غائب' ? 'danger' : 'default'}
                        />
                      </button>

                      <div className="text-right">
                        <h3 className="text-lg font-bold text-slate-950">{row.studentName}</h3>
                        <p className="mt-1 text-sm text-slate-500">اضغط على الحالة لتغييرها</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                    لا توجد سجلات حضور حتى الآن.
                  </div>
                )}
              </div>
            </ListSectionCard>
          </TabsContent>
        </Tabs>
      </div>

      {addMaterialOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[1.7rem] bg-white p-6 shadow-2xl">
            <div className="text-right">
              <h3 className="text-2xl font-black text-slate-950">إضافة مادة</h3>
            </div>
            <div className="mt-4 space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">عنوان المادة</label>
              <Input
                value={newMaterialTitle}
                onChange={(event) => setNewMaterialTitle(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleAddMaterial(); }}
                autoFocus
                className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
              />
            </div>
            <div className="mt-6 flex justify-start gap-3">
              <button type="button" onClick={handleAddMaterial} className="rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white">
                إضافة
              </button>
              <button type="button" onClick={() => { setAddMaterialOpen(false); setNewMaterialTitle(''); }} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-900">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ReferenceDashboardShell>
  );
}
