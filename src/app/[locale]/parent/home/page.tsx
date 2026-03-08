import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Users, BookOpen, CreditCard, Plus, ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

const AVATAR_COLORS = [
    'bg-teal-100 text-teal-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-indigo-100 text-indigo-700',
];

const CARD_BORDERS = [
    'border-l-teal-400',
    'border-l-purple-400',
    'border-l-amber-400',
    'border-l-indigo-400',
];

export default async function ParentHomePage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('parent.home');
    const isArabic = locale === 'ar';

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    // Server-side greeting from current hour
    const hour = new Date().getHours();
    const greeting = isArabic
        ? (hour < 12 ? 'صباح الخير' : hour < 17 ? 'طاب يومك' : 'مساء الخير')
        : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');

    // Fetch linked students
    const { data: linkedStudents } = await supabaseAdmin
        .from('parent_student')
        .select(`
            relationship,
            student:users!parent_student_student_id_fkey (
                id,
                name,
                email,
                image,
                grade_id
            )
        `)
        .eq('parent_id', user.id);

    const students = linkedStudents?.map(record => ({
        ...record.student,
        relationship: record.relationship
    })) || [];

    // Fetch enrollment and payment counts
    let activeEnrollmentsCount = 0;
    let pendingPaymentsCount = 0;

    if (students.length > 0) {
        const studentIds = students.map((s: any) => s.id);

        const { count } = await supabaseAdmin
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('student_id', studentIds)
            .eq('status', 'active');

        activeEnrollmentsCount = count || 0;

        const { count: invoiceCount } = await supabaseAdmin
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', user.id)
            .eq('status', 'pending');

        pendingPaymentsCount = invoiceCount || 0;
    }

    // Fetch grades for students
    const studentIds = students.map((s: any) => s.id);
    const { data: studentsWithGrades } = await supabaseAdmin
        .from('users')
        .select(`
            id,
            name,
            email,
            image,
            grade_id,
            grades(id, title, level)
        `)
        .in('id', studentIds);

    // Create a map for quick lookup
    const gradeMap = new Map();
    studentsWithGrades?.forEach((student: any) => {
        if (student.grade_id) {
            gradeMap.set(student.id, student.grades);
        }
    });

    return (
        <div className={`space-y-5 pb-6 ${isArabic ? 'rtl' : 'ltr'}`}>

            {/* ── Hero Banner ───────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-700 via-teal-600 to-emerald-500 p-6 text-white shadow-2xl shadow-teal-200/60">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-emerald-400/25" />
                <div className="pointer-events-none absolute top-1/2 right-1/3 h-12 w-12 rounded-full bg-teal-300/20" />

                <div className="relative">
                    <p className="text-teal-100 text-sm font-medium tracking-wide">{greeting}</p>
                    <h1 className="text-2xl font-extrabold mt-0.5 leading-tight">{user.name}</h1>
                    <p className="text-teal-200 text-sm mt-1">
                        {isArabic ? 'تابع تعليم أبنائك وتقدمهم' : "Track your children's education & progress"}
                    </p>

                    {/* Family summary pill */}
                    {students.length > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2">
                            <GraduationCap className="h-4 w-4 text-teal-100" />
                            <span className="text-sm font-medium text-white">
                                {isArabic
                                    ? `${students.length} ${students.length === 1 ? 'طالب' : 'طلاب'} · ${activeEnrollmentsCount} دورة نشطة`
                                    : `${students.length} ${students.length === 1 ? 'child' : 'children'} · ${activeEnrollmentsCount} active ${activeEnrollmentsCount === 1 ? 'course' : 'courses'}`
                                }
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quick Stats Strip ─────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center rounded-2xl bg-teal-50 p-3 text-center shadow-sm">
                    <Users className="h-4 w-4 text-teal-500 mb-1.5" />
                    <p className="text-xl font-extrabold text-teal-700 leading-none">{students.length}</p>
                    <p className="mt-1 text-[11px] font-semibold text-teal-500 leading-tight">
                        {isArabic ? 'الأبناء' : t('myChildren')}
                    </p>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-indigo-50 p-3 text-center shadow-sm">
                    <BookOpen className="h-4 w-4 text-indigo-500 mb-1.5" />
                    <p className="text-xl font-extrabold text-indigo-700 leading-none">{activeEnrollmentsCount}</p>
                    <p className="mt-1 text-[11px] font-semibold text-indigo-500 leading-tight">
                        {isArabic ? 'دورات نشطة' : t('activeEnrollments')}
                    </p>
                </div>
                <div className="flex flex-col items-center rounded-2xl p-3 text-center shadow-sm"
                    style={{ backgroundColor: pendingPaymentsCount > 0 ? 'rgb(255 251 235)' : 'rgb(240 253 250)' }}
                >
                    <CreditCard className={`h-4 w-4 mb-1.5 ${pendingPaymentsCount > 0 ? 'text-amber-500' : 'text-teal-400'}`} />
                    <p className={`text-xl font-extrabold leading-none ${pendingPaymentsCount > 0 ? 'text-amber-700' : 'text-teal-600'}`}>
                        {pendingPaymentsCount}
                    </p>
                    <p className={`mt-1 text-[11px] font-semibold leading-tight ${pendingPaymentsCount > 0 ? 'text-amber-500' : 'text-teal-400'}`}>
                        {isArabic ? 'مدفوعات معلقة' : t('pendingPayments')}
                    </p>
                </div>
            </div>

            {/* ── My Children ───────────────────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-800">{t('myChildren')}</h2>
                    <Link
                        href={withLocalePrefix('/parent/students/add', locale)}
                        className="flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t('addChild')}
                    </Link>
                </div>

                {students.length > 0 ? (
                    <div className="space-y-3">
                        {students.map((student: any, index: number) => {
                            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                            const borderColor = CARD_BORDERS[index % CARD_BORDERS.length];
                            const grade = gradeMap.get(student.grade_id);
                            return (
                                <Link
                                    key={student.id}
                                    href={withLocalePrefix(`/parent/students/${student.id}`, locale)}
                                    className={`group flex items-center gap-4 rounded-2xl border-l-4 ${borderColor} bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${avatarColor}`}>
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{student.email}</p>
                                        {student.relationship && (
                                            <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 capitalize">
                                                {student.relationship}
                                            </span>
                                        )}
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                            <BookOpen className="w-3 h-3" />
                                            <span>{t('viewCourses')}</span>
                                        </div>
                                        {grade && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                <span>{grade.title}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className={`h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 ${isArabic ? 'rotate-180' : ''}`} />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 mb-4">
                            <Users className="h-7 w-7 text-teal-500" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">
                            {isArabic ? 'لم تُضف أبناءك بعد' : 'No children linked yet'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-5 max-w-xs">
                            {isArabic
                                ? 'أضف أبناءك لتتابع دوراتهم وتقدمهم الدراسي'
                                : 'Add your children to manage their courses and track progress.'
                            }
                        </p>
                        <Link
                            href={withLocalePrefix('/parent/students/add', locale)}
                            className="flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {t('addChild')}
                        </Link>
                    </div>
                )}
            </section>

            {/* ── Browse Courses CTA ────────────────────────────────── */}
            {students.length > 0 && activeEnrollmentsCount === 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-teal-600 to-emerald-500 p-6 text-white shadow-lg shadow-teal-200/40">
                    <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-extrabold mb-1">
                                {isArabic ? 'هل أنت مستعد للبدء؟' : 'Ready to start learning?'}
                            </h3>
                            <p className="text-teal-100 text-sm">
                                {isArabic
                                    ? 'تصفح الدورات المتاحة وسجّل أبناءك اليوم'
                                    : 'Browse available courses and enroll your children today.'
                                }
                            </p>
                        </div>
                        <Link
                            href={withLocalePrefix('/courses', locale)}
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50 transition-colors active:scale-[0.98]"
                        >
                            {isArabic ? 'تصفح الدورات' : 'Browse Courses'}
                            <ChevronRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
