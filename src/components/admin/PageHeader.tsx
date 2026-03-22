'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    primaryAction?: {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    };
    secondaryActions?: Array<{
        label: string;
        icon?: ReactNode;
        onClick: () => void;
    }>;
    backHref?: string;
    className?: string;
}

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    primaryAction,
    secondaryActions = [],
    backHref,
    className = '',
}: PageHeaderProps) {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const BackIcon = isRTL ? ChevronRight : ChevronLeft;

    return (
        <div className={`mb-6 ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                            )}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            {/* Header Content */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Title Section */}
                <div className="flex items-center gap-4">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                            aria-label="رجوع"
                        >
                            <BackIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {secondaryActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                                primaryAction.variant === 'secondary'
                                    ? 'bg-gray-600 hover:bg-gray-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {primaryAction.icon || <Plus className="h-4 w-4" />}
                            <span>{primaryAction.label}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
