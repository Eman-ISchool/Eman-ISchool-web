'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { CourseStatusTabs, CourseStatusFilter } from '@/components/courses/CourseStatusTabs';
import { PageError } from '@/components/ui/page-error';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { DataState, createIdleState, createLoadingState, createErrorState, createSuccessState, isSuccess, isLoading } from '@/types/page-state';
import { BookOpen as BookIcon } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  teacher: { name: string; email: string };
  nextLesson?: {
    id: string;
    title: string;
    start_date_time: string;
  } | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  courses: Course;
  teachers: { name: string; email: string };
  nextLesson?: {
    id: string;
    title: string;
    start_date_time: string;
  } | null;
}

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const t = useTranslations('student.courses');
  const user = session?.user as any;
  const locale = useLocale();

  const [coursesState, setCoursesState] = useState<DataState<Enrollment[]>>(createIdleState());
  const [filter, setFilter] = useState<CourseStatusFilter>('all');

  const fetchCourses = async () => {
    if (!user || user?.role !== 'student') return;
    
    setCoursesState(createLoadingState());
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }

      setCoursesState(createSuccessState(data.enrollments || []));
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCoursesState(createErrorState(
        locale === 'ar' ? 'فشل تحميل الدورات' : 'Failed to load courses',
        () => fetchCourses()
      ));
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id, locale]);

  const filteredCourses = isSuccess(coursesState) ? coursesState.data.filter((enrollment) => {
    const nextLesson = enrollment.nextLesson;
    if (!nextLesson) return filter === 'all';

    const now = new Date();
    const lessonDate = new Date(nextLesson.start_date_time);
    const hoursDiff = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    switch (filter) {
      case 'active':
        return hoursDiff >= 0 && hoursDiff <= 24;
      case 'upcoming':
        return hoursDiff > 24;
      case 'completed':
        return hoursDiff < 0;
      default:
        return true;
    }
  }) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('title')}
      </h1>

      {/* Course Status Tabs */}
      <div className="mb-6">
        <CourseStatusTabs
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Loading State */}
      {isLoading(coursesState) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {coursesState.status === 'error' && (
        <PageError
          message={coursesState.message}
          onRetry={coursesState.retryFn}
        />
      )}

      {/* Empty State */}
      {coursesState.status === 'success' && filteredCourses.length === 0 && (
        <EmptyState
          icon={<BookIcon className="h-12 w-12 text-slate-400" />}
          title={locale === 'ar' ? 'لا توجد دورات' : 'No Courses'}
          description={locale === 'ar' 
            ? 'لم تسجل في أي دورات بعد. تصفح الدورات المتاحة للبدء.'
            : 'You haven\'t enrolled in any courses yet. Browse available courses to get started.'
          }
          action={{
            label: locale === 'ar' ? 'تصفح الدورات' : 'Browse Courses',
            href: '/courses',
          }}
        />
      )}

      {/* Success State */}
      {isSuccess(coursesState) && filteredCourses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/student/courses/${enrollment.course_id}`}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow block"
              prefetch={false}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {enrollment.courses?.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <User className="w-4 h-4" />
                  <span>{enrollment.teachers?.name}</span>
                </div>
              </div>

              {enrollment.nextLesson ? (
                <div className="flex items-center gap-2 text-sm bg-brand-primary/5 rounded-lg p-3">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <div className="font-medium">
                      {t('nextLesson')}
                    </div>
                    <div className="text-gray-700">
                      {new Date(enrollment.nextLesson.start_date_time).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  {t('noUpcomingLessons')}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
