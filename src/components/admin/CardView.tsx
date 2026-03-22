'use client';

import { ReactNode, useState } from 'react';
import { Grid3X3, List } from 'lucide-react';

export interface Card<T> {
    id: string | number;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    icon?: ReactNode;
    badge?: string;
    actions?: ReactNode;
    onClick?: () => void;
    metadata?: Record<string, ReactNode>;
}

interface CardViewProps<T> {
    data: Card<T>[];
    loading?: boolean;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    emptyTitle?: string;
    emptyMessage?: string;
    emptyAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    gridCols?: number;
}

export default function CardView<T extends { id: string | number }>({
    data,
    loading = false,
    viewMode = 'grid',
    onViewModeChange,
    emptyTitle = 'لا توجد بيانات',
    emptyMessage = 'لم يتم العثور على أي عناصر.',
    emptyAction,
    className = '',
    gridCols = 3,
}: CardViewProps<T>) {
    const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);

    if (loading) {
        return (
            <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 h-40 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Grid3X3 className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {emptyTitle}
                </h3>
                <p className="mb-4 text-center text-gray-600 dark:text-gray-400 max-w-md">
                    {emptyMessage}
                </p>
                {emptyAction && (
                    <button
                        onClick={emptyAction.onClick}
                        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {emptyAction.label}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {/* View Mode Toggle */}
            {onViewModeChange && (
                <div className="mb-4 flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        عرض:
                    </span>
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`rounded-r-lg p-2 transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                            aria-label="عرض الشبكة"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`rounded-l-lg p-2 transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                            aria-label="عرض القائمة"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Cards Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                    {data.map((item) => (
                        <div
                            key={item.id}
                            onClick={item.onClick}
                            className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
                                item.onClick ? 'cursor-pointer hover:-translate-y-1' : ''
                            }`}
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Image or Icon */}
                            {item.image ? (
                                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            ) : item.icon ? (
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                    {item.icon}
                                </div>
                            ) : null}

                            {/* Content */}
                            <div className="mb-3">
                                {item.badge && (
                                    <span className="mb-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {item.badge}
                                    </span>
                                )}
                                <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 dark:text-white">
                                    {item.title}
                                </h3>
                                {item.subtitle && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.subtitle}
                                    </p>
                                )}
                                {item.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            {/* Metadata */}
                            {item.metadata && (
                                <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    {Object.entries(item.metadata).map(([key, value]) => (
                                        <span key={key} className="flex items-center gap-1">
                                            {value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            {item.actions && (
                                <div className={`flex items-center gap-2 transition-opacity duration-200 ${
                                    hoveredCard === item.id ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    {item.actions}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // List View
                <div className="space-y-3">
                    {data.map((item) => (
                        <div
                            key={item.id}
                            onClick={item.onClick}
                            className={`group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${
                                item.onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700' : ''
                            }`}
                        >
                            {/* Image or Icon */}
                            {item.image ? (
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : item.icon ? (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                    {item.icon}
                                </div>
                            ) : null}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 flex items-start justify-between gap-2">
                                    <div>
                                        {item.badge && (
                                            <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {item.badge}
                                            </span>
                                        )}
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {item.title}
                                        </h3>
                                    </div>
                                    {item.actions && (
                                        <div className={`flex items-center gap-2 transition-opacity duration-200 ${
                                            hoveredCard === item.id ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            {item.actions}
                                        </div>
                                    )}
                                </div>
                                {item.subtitle && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.subtitle}
                                    </p>
                                )}
                                {item.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                )}
                                {item.metadata && (
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                                        {Object.entries(item.metadata).map(([key, value]) => (
                                            <span key={key} className="flex items-center gap-1">
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
