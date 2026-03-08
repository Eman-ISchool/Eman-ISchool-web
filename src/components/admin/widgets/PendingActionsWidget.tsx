'use client';

import Link from 'next/link';
import {
    AlertTriangle,
    DollarSign,
    FileX,
    Clock,
    UserX,
    ChevronLeft,
} from 'lucide-react';

interface PendingAction {
    type: 'unpaid_fees' | 'missing_conclusions' | 'overdue_grading' | 'unassigned_teachers';
    count: number;
    label: string;
    href: string;
}

interface PendingActionsWidgetProps {
    actions: PendingAction[];
    className?: string;
}

const iconMap = {
    unpaid_fees: <DollarSign className="w-5 h-5 text-orange-500" />,
    missing_conclusions: <FileX className="w-5 h-5 text-red-500" />,
    overdue_grading: <Clock className="w-5 h-5 text-yellow-500" />,
    unassigned_teachers: <UserX className="w-5 h-5 text-purple-500" />,
};

const bgMap = {
    unpaid_fees: 'bg-orange-50',
    missing_conclusions: 'bg-red-50',
    overdue_grading: 'bg-yellow-50',
    unassigned_teachers: 'bg-purple-50',
};

export default function PendingActionsWidget({
    actions,
    className = '',
}: PendingActionsWidgetProps) {
    // Ensure actions is always an array
    const safeActions = Array.isArray(actions) ? actions : [];
    const totalPending = safeActions.reduce((sum, a) => sum + a.count, 0);

    return (
        <div className={`admin-card ${className}`}>
            <div className="admin-card-header flex items-center justify-between">
                <h3 className="admin-card-title">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    إجراءات معلقة
                </h3>
                {totalPending > 0 && (
                    <span className="admin-badge admin-badge-warning">{totalPending}</span>
                )}
            </div>
            <div className="admin-card-body p-0">
                {safeActions.length === 0 || totalPending === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-gray-500">لا توجد إجراءات معلقة</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {safeActions
                            .filter((a) => a.count > 0)
                            .map((action) => (
                                <Link
                                    key={action.type}
                                    href={action.href}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgMap[action.type]
                                                }`}
                                        >
                                            {iconMap[action.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{action.label}</p>
                                            <p className="text-sm text-gray-500">
                                                {action.count} {action.count === 1 ? 'عنصر' : 'عناصر'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                                </Link>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
