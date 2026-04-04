'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ResponsiveTable — renders as a standard table on desktop, stacked cards on mobile.
 *
 * Usage:
 * ```tsx
 * <ResponsiveTable
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *     { key: 'status', header: 'Status', render: (val) => <Badge>{val}</Badge> },
 *   ]}
 *   data={students}
 *   onRowClick={(row) => router.push(`/students/${row.id}`)}
 *   emptyMessage="No students found"
 * />
 * ```
 */

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No data',
  className,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-start font-semibold text-gray-600',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row) => (
              <tr
                key={row[keyField]}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — hidden on desktop */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={row[keyField]}
            className={cn(
              'rounded-xl border border-gray-100 bg-white p-4 space-y-2',
              onRowClick && 'cursor-pointer hover:shadow-md transition-shadow'
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col, idx) => (
                <div key={col.key} className="flex items-center justify-between gap-2">
                  {idx === 0 ? (
                    <span className="font-semibold text-gray-900">
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400 shrink-0">{col.header}</span>
                      <span className="text-sm text-gray-700 text-end">
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] ?? '—')}
                      </span>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
