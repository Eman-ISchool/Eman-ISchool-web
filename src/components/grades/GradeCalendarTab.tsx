'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ScheduleLesson {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  course_id: string;
  course_name: string;
  teacher_name: string;
  status: string;
}

interface GradeCalendarTabProps {
  gradeId: string;
  userRole: string;
  userId: string;
}

type ViewType = 'month' | 'week' | 'day';

export default function GradeCalendarTab({
  gradeId,
  userRole,
  userId,
}: GradeCalendarTabProps) {
  const t = useTranslations('grades');
  const [schedule, setSchedule] = useState<ScheduleLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const canCreateLesson = userRole === 'teacher' || userRole === 'admin';

  // Fetch schedule
  useEffect(() => {
    fetchSchedule();
  }, [gradeId, startDate, endDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      let url = `/api/grades/${gradeId}/schedule`;
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      setSchedule(data.schedule || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCourseColor = (courseId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-teal-100 text-teal-800',
    ];
    const index = parseInt(courseId.slice(-1)) % colors.length;
    return colors[index];
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getFilteredLessons = () => {
    if (!startDate && !endDate) return schedule;

    return schedule.filter((lesson) => {
      const lessonDate = new Date(lesson.start_time);
      if (startDate && lessonDate < new Date(startDate)) return false;
      if (endDate && lessonDate > new Date(endDate)) return false;
      return true;
    });
  };

  const filteredLessons = getFilteredLessons();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('calendar.title')}</h2>
        {canCreateLesson && (
          <button
            onClick={() => {
              // TODO: Open lesson creation modal
              alert('Lesson creation functionality to be implemented');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('calendar.createLesson')}
          </button>
        )}
      </div>

      {/* View Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            ←
          </button>
          <span className="font-medium">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateDate('next')}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            →
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 border rounded hover:bg-gray-50 ml-2"
          >
            {t('calendar.today')}
          </button>
        </div>

        <div className="flex gap-1 border rounded">
          {(['month', 'week', 'day'] as ViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => setViewType(view)}
              className={`px-3 py-1 capitalize ${
                viewType === view
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {t(`calendar.${view}`)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border rounded"
            placeholder={t('calendar.startDate')}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 border rounded"
            placeholder={t('calendar.endDate')}
          />
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            {t('calendar.clear')}
          </button>
        </div>
      </div>

      {/* Schedule List */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('calendar.noLessons')}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getCourseColor(
                lesson.course_id
              )}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{lesson.title}</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('calendar.course')}:</span>
                      <span>{lesson.course_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('calendar.teacher')}:</span>
                      <span>{lesson.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('calendar.date')}:</span>
                      <span>{formatDate(lesson.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('calendar.time')}:</span>
                      <span>
                        {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lesson.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : lesson.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`calendar.status.${lesson.status}`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
