'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    BookOpen,
    Video,
    Users,
    Ticket,
    Plus,
} from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import { useTranslations } from 'next-intl';

interface QuickAction {
    icon: React.ReactNode;
    key: string;
    href: string;
    color: string;
}

const actionData: QuickAction[] = [
    {
        icon: <Calendar className="w-5 h-5" />,
        key: 'newAppointment',
        href: '/admin/calendar?action=new',
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
        icon: <BookOpen className="w-5 h-5" />,
        key: 'newLesson',
        href: '/admin/lessons?action=new',
        color: 'bg-teal-500 hover:bg-teal-600',
    },
    {
        icon: <Video className="w-5 h-5" />,
        key: 'newLive',
        href: '/admin/live?action=new',
        color: 'bg-red-500 hover:bg-red-600',
    },
    {
        icon: <Users className="w-5 h-5" />,
        key: 'newTeacher',
        href: '/admin/teachers?action=new',
        color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
        icon: <BookOpen className="w-5 h-5" />,
        key: 'newCourse',
        href: '/admin/courses/new',
        color: 'bg-orange-500 hover:bg-orange-600',
    },
];

interface QuickActionsBarProps {
    className?: string;
}

export default function QuickActionsBar({
    className = '',
}: QuickActionsBarProps) {
    const pathname = usePathname();
    const t = useTranslations('admin.actions');
    const tDash = useTranslations('admin.dashboard');
    const locale = getLocaleFromPathname(pathname);

    return (
        <div className={`admin-card ${className}`}>
            <div className="admin-card-header">
                <h3 className="admin-card-title">
                    <Plus className="w-5 h-5 text-teal-500" />
                    {tDash('quickActions')}
                </h3>
            </div>
            <div className="admin-card-body">
                <div className="flex flex-wrap gap-3">
                    {actionData.map((action, index) => (
                        <Link
                            key={index}
                            href={withLocalePrefix(action.href, locale)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
                        >
                            {action.icon}
                            {t(action.key)}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
