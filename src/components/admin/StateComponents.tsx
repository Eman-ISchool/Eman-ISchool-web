'use client';

import { Loader2, AlertCircle, Inbox } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'جاري التحميل...' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'حدث خطأ',
    message = 'تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="admin-btn admin-btn-primary">
                    إعادة المحاولة
                </button>
            )}
        </div>
    );
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon,
    title = 'لا توجد بيانات',
    message = 'لم يتم العثور على أي عناصر.',
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {icon || <Inbox className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">{message}</p>
            {action && (
                <button onClick={action.onClick} className="admin-btn admin-btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
}

// Skeleton loaders
export function CardSkeleton() {
    return (
        <div className="admin-card p-6 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="admin-card overflow-hidden">
            <table className="admin-table">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
