'use client';

import { ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import RoleCard from '@/components/auth/RoleCard';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const pathname = usePathname();
    const t = useTranslations('auth.login');
    const locale = getLocaleFromPathname(pathname);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-10">

            {/* ── Brand Header ─────────────────────────────────────── */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-teal-50 border border-teal-100 px-4 py-1.5 mb-2">
                    <GraduationCap className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-bold text-teal-700">Eduverse</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {t('title')}
                </h1>
                <p className="text-gray-500 max-w-sm mx-auto">
                    {t('subtitle')}
                </p>
            </div>

            {/* ── Role Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <RoleCard
                    title={t('roles.admin.title')}
                    description={t('roles.admin.desc')}
                    icon={ShieldCheck}
                    href={withLocalePrefix('/login/admin', locale)}
                    colorClass="bg-red-500 text-red-500"
                />
                <RoleCard
                    title={t('roles.teacher.title')}
                    description={t('roles.teacher.desc')}
                    icon={BookOpen}
                    href={withLocalePrefix('/login/teacher', locale)}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <RoleCard
                    title={t('roles.student.title')}
                    description={t('roles.student.desc')}
                    icon={GraduationCap}
                    href={withLocalePrefix('/login/student', locale)}
                    colorClass="bg-brand-primary text-brand-primary"
                />
            </div>

            {/* ── Register Link ────────────────────────────────────── */}
            <div className="text-center">
                <p className="text-sm text-gray-500">
                    {t('noAccount')}{' '}
                    <a
                        href={withLocalePrefix('/register', locale)}
                        className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                    >
                        {t('register')}
                    </a>
                </p>
            </div>
        </div>
    );
}
