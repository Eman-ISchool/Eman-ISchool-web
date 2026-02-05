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
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="text-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('noAccount')} <a href={withLocalePrefix('/register', locale)} className="text-brand-primary hover:underline">{t('register')}</a>
                </p>
            </div>
        </div>
    );
}
