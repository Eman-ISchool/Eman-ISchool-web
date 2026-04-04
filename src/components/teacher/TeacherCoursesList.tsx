'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Plus } from 'lucide-react';
import { StatusFilterTabs, StatusFilterOption } from '@/components/ui/status-filter-tabs';
import { EmptyState } from '@/components/ui/EmptyState';

interface Course {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    is_published?: boolean;
    subject?: { title: string } | string;
    enrollments?: { count: number }[];
    enrollmentCount?: number;
    created_at?: string;
}

interface TeacherCoursesListProps {
    courses: Course[];
    locale: string;
    createHref: string;
    translations: {
        all: string;
        published: string;
        draft: string;
        title: string;
        subtitle: string;
        createCourse: string;
        emptyTitle: string;
        emptyDescription: string;
        noMatchTitle: string;
        noMatchDescription: string;
    };
}

export function TeacherCoursesList({
    courses,
    locale,
    createHref,
    translations: t,
}: TeacherCoursesListProps) {
    const [filter, setFilter] = useState('all');

    const filteredCourses = courses.filter((course) => {
        if (filter === 'all') return true;
        if (filter === 'published') return course.is_published === true;
        if (filter === 'draft') return course.is_published !== true;
        return true;
    });

    const filterOptions: StatusFilterOption[] = [
        { value: 'all', label: t.all, count: courses.length },
        { value: 'published', label: t.published, count: courses.filter(c => c.is_published).length },
        { value: 'draft', label: t.draft, count: courses.filter(c => !c.is_published).length },
    ];

    if (courses.length === 0) {
        return (
            <EmptyState
                icon={<BookOpen className="h-8 w-8 text-slate-400" />}
                title={t.emptyTitle}
                description={t.emptyDescription}
                action={{ label: t.createCourse, href: createHref }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <StatusFilterTabs
                options={filterOptions}
                value={filter}
                onChange={setFilter}
            />

            {filteredCourses.length === 0 ? (
                <EmptyState
                    icon={<BookOpen className="h-8 w-8 text-slate-400" />}
                    title={t.noMatchTitle}
                    description={t.noMatchDescription}
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map((course) => {
                        const courseId = course.id || course._id;
                        return (
                            <Link
                                key={courseId}
                                href={`/${locale}/teacher/courses/${courseId}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                                prefetch={false}
                            >
                                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                    <BookOpen className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                            {course.title}
                                        </h3>
                                        {course.is_published === false && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                    {course.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {course.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                        {course.subject && (
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                {typeof course.subject === 'string'
                                                    ? course.subject
                                                    : course.subject?.title}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {course.enrollments?.[0]?.count || course.enrollmentCount || 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
