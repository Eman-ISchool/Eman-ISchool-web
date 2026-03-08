import { BookOpen, MapPin, Clock, Users } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

interface Course {
    id: string;
    title: string;
    description?: string;
    is_published: boolean;
    enrollments?: { count: number }[];
    teacher?: { name: string; image: string };
    duration_hours?: number;
    price?: number;
}

interface CourseCardsListProps {
    courses: Course[];
    locale: string;
    onNavigate: (path: string) => void;
}

export function CourseCardsList({ courses, locale, onNavigate }: CourseCardsListProps) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                <div className="text-gray-300 mx-auto mb-3 flex justify-center">
                    <BookOpen className="h-10 w-10" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">No courses available</h3>
                <p className="text-sm text-gray-500 mb-4">You have not created any courses for this subject yet.</p>
                <button
                    onClick={() => onNavigate(`/teacher/courses/create`)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    Create Course
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onNavigate(`/teacher/courses/${course.id}`)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${course.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {course.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {course.description || 'No description provided.'}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{course.enrollments?.[0]?.count || 0}</span>
                        </div>
                        {course.duration_hours && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration_hours}h</span>
                            </div>
                        )}
                        {course.price !== undefined && (
                            <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                ${course.price.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
