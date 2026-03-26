'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';

interface DateRangeFilterProps {
    onDateRangeChange: (start: Date, end: Date) => void;
    initialStart?: Date;
    initialEnd?: Date;
    className?: string;
}

export default function DateRangeFilter({
    onDateRangeChange,
    initialStart,
    initialEnd,
    className = '',
}: DateRangeFilterProps) {
    const [startDate, setStartDate] = useState<Date>(
        initialStart || new Date(new Date().setMonth(new Date().getMonth() - 1))
    );
    const [endDate, setEndDate] = useState<Date>(initialEnd || new Date());

    const handleApply = () => {
        onDateRangeChange(startDate, endDate);
    };

    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 ${className}`}>
            <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    نطاق التاريخ:
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm text-gray-600 dark:text-gray-400">
                        من
                    </label>
                    <input
                        id="start-date"
                        type="date"
                        value={formatDateForInput(startDate)}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        dir="ltr"
                    />
                </div>

                <ChevronLeft className="h-5 w-5 text-gray-400 rtl:rotate-180" />

                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm text-gray-600 dark:text-gray-400">
                        إلى
                    </label>
                    <input
                        id="end-date"
                        type="date"
                        value={formatDateForInput(endDate)}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        dir="ltr"
                    />
                </div>
            </div>

            <button
                onClick={handleApply}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                تطبيق
            </button>
        </div>
    );
}
