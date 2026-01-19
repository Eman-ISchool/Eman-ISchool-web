'use client';

import Link from 'next/link';
import {
    Calendar,
    BookOpen,
    Video,
    Users,
    Ticket,
    Plus,
} from 'lucide-react';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    href: string;
    color: string;
}

const defaultActions: QuickAction[] = [
    {
        icon: <Calendar className="w-5 h-5" />,
        label: 'موعد جديد',
        href: '/admin/calendar?action=new',
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
        icon: <BookOpen className="w-5 h-5" />,
        label: 'درس جديد',
        href: '/admin/lessons?action=new',
        color: 'bg-teal-500 hover:bg-teal-600',
    },
    {
        icon: <Video className="w-5 h-5" />,
        label: 'جلسة مباشرة',
        href: '/admin/live?action=new',
        color: 'bg-red-500 hover:bg-red-600',
    },
    {
        icon: <Users className="w-5 h-5" />,
        label: 'معلم جديد',
        href: '/admin/teachers?action=new',
        color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
        icon: <Ticket className="w-5 h-5" />,
        label: 'كوبون جديد',
        href: '/admin/coupons-expenses?action=new',
        color: 'bg-orange-500 hover:bg-orange-600',
    },
];

interface QuickActionsBarProps {
    actions?: QuickAction[];
    className?: string;
}

export default function QuickActionsBar({
    actions = defaultActions,
    className = '',
}: QuickActionsBarProps) {
    return (
        <div className={`admin-card ${className}`}>
            <div className="admin-card-header">
                <h3 className="admin-card-title">
                    <Plus className="w-5 h-5 text-teal-500" />
                    إجراءات سريعة
                </h3>
            </div>
            <div className="admin-card-body">
                <div className="flex flex-wrap gap-3">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
                        >
                            {action.icon}
                            {action.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
