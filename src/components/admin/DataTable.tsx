'use client';

import { useState, useMemo } from 'react';
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import { EmptyState, TableSkeleton } from './StateComponents';

export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    searchPlaceholder?: string;
    searchKey?: keyof T;
    emptyTitle?: string;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    pageSize?: number;
    className?: string;
}

export default function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading = false,
    searchPlaceholder = 'بحث...',
    searchKey,
    emptyTitle,
    emptyMessage,
    onRowClick,
    actions,
    pageSize = 10,
    className = '',
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!search || !searchKey) return data;
        return data.filter((item) =>
            String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search, searchKey]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = String((a as any)[sortKey]);
            const bVal = String((b as any)[sortKey]);
            const compare = aVal.localeCompare(bVal, 'ar');
            return sortOrder === 'asc' ? compare : -compare;
        });
    }, [filteredData, sortKey, sortOrder]);

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    if (loading) {
        return <TableSkeleton rows={pageSize} columns={columns.length + (actions ? 1 : 0)} />;
    }

    return (
        <div className={`admin-card ${className}`}>
            {/* Search Bar */}
            {searchKey && (
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="admin-input pr-10"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            {paginatedData.length === 0 ? (
                <EmptyState title={emptyTitle} message={emptyMessage} />
            ) : (
                <>
                    <div className="overflow-x-auto overflow-y-visible">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={col.className}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.header}
                                                {col.sortable && sortKey === col.key && (
                                                    sortOrder === 'asc' ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    {actions && <th className="admin-table-actions"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onRowClick?.(item)}
                                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className={col.className}>
                                                {col.render
                                                    ? col.render(item)
                                                    : String((item as any)[col.key] ?? '')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="admin-table-actions">
                                                <div className="admin-table-actions-inner">
                                                    {actions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                عرض {(currentPage - 1) * pageSize + 1} -{' '}
                                {Math.min(currentPage * pageSize, sortedData.length)} من{' '}
                                {sortedData.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-600">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
