'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Lesson {
    _id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    meetLink?: string;
}

interface CalendarViewProps {
    lessons: Lesson[];
    onLessonClick?: (lesson: Lesson) => void;
}

export function CalendarView({ lessons, onLessonClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        return { daysInMonth, startingDay };
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

    const getLessonsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return lessons.filter(lesson => lesson.startDateTime.startsWith(dateStr));
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const today = new Date();
    const isToday = (day: number) =>
        today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();

    // Check if lesson is currently live (within -10 to +60 mins of start)
    // Modified to allow joining anytime for testing purposes as requested
    const isLive = (lesson: Lesson) => {
        // Return true if meetLink exists to enable the button always
        return !!lesson.meetLink;

        /* Original Logic:
        const now = new Date();
        const start = new Date(lesson.startDateTime);
        const end = new Date(lesson.endDateTime);
        // Allow joining 10 mins early
        return now >= new Date(start.getTime() - 10 * 60000) && now <= end;
        */
    };

    return (
        <Card className="w-full shadow-lg border-t-4 border-t-brand-primary">
            <CardHeader className="pb-4 border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-brand-primary/10 text-brand-primary p-2 rounded-lg">
                            📅
                        </span>
                        جدول الدروس
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <span className="font-bold min-w-32 text-center text-lg text-gray-700">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-sm font-bold text-gray-500 py-3 bg-gray-50 rounded-lg">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before the start of month */}
                    {Array.from({ length: startingDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-32 bg-gray-50/30 rounded-xl"></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayLessons = getLessonsForDay(day);
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={day}
                                className={`h-32 p-2 rounded-xl border-2 flex flex-col transition-all duration-200 group relative ${isDayToday
                                    ? 'border-brand-primary bg-yellow-50/30 shadow-sm'
                                    : 'border-transparent bg-gray-50 hover:border-gray-200 hover:shadow-md hover:bg-white'
                                    }`}
                            >
                                <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isDayToday ? 'bg-brand-primary text-black' : 'text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100'
                                    }`}>
                                    {day}
                                </div>

                                <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                                    {dayLessons.map(lesson => {
                                        const live = isLive(lesson);
                                        return (
                                            <div
                                                key={lesson._id}
                                                className={`text-xs p-1.5 rounded-lg border flex flex-col gap-1 transition-colors ${live
                                                    ? 'bg-green-50 border-green-200 shadow-sm'
                                                    : 'bg-white border-gray-100 hover:border-brand-primary/50'
                                                    }`}
                                            >
                                                <div className="font-semibold truncate text-gray-800" title={lesson.title}>
                                                    {lesson.title}
                                                </div>
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {new Date(lesson.startDateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {lesson.meetLink && (
                                                        <a
                                                            href={`/dashboard/classroom/${lesson._id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${live ? 'bg-green-500 text-white animate-pulse' : 'bg-brand-primary text-black hover:bg-yellow-400 font-bold'
                                                                }`}
                                                            title={live ? "انضم الآن" : "رابط الدرس متاح"}
                                                        >
                                                            <Video className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
