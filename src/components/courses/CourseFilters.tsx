'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
// Simple debounce hook implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function CourseFilters({ grades }: { grades: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [gradeId, setGradeId] = useState(searchParams.get('grade') || 'all');

    const debouncedSearch = useDebounceValue(search, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedSearch) {
            params.set('q', debouncedSearch);
        } else {
            params.delete('q');
        }

        if (gradeId && gradeId !== 'all') {
            params.set('grade', gradeId);
        } else {
            params.delete('grade');
        }

        router.push(`?${params.toString()}`);
    }, [debouncedSearch, gradeId, router, searchParams]);

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="w-full md:w-48">
                <select
                    value={gradeId}
                    onChange={(e) => setGradeId(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                    <option value="all">All Grades</option>
                    {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                            {grade.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
