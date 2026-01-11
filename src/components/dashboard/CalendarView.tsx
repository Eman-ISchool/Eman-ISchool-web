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

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">جدول الدروس</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="font-medium min-w-32 text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before the start of month */}
                    {Array.from({ length: startingDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-md"></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayLessons = getLessonsForDay(day);

                        return (
                            <div
                                key={day}
                                className={`h-24 p-1 rounded-md border ${isToday(day)
                                        ? 'border-brand-primary bg-yellow-50'
                                        : 'border-gray-100 hover:border-gray-200'
                                    } transition-colors overflow-hidden`}
                            >
                                <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-brand-primary' : 'text-gray-700'}`}>
                                    {day}
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-16">
                                    {dayLessons.slice(0, 2).map(lesson => (
                                        <button
                                            key={lesson._id}
                                            onClick={() => onLessonClick?.(lesson)}
                                            className="w-full text-left p-1 text-xs rounded bg-brand-primary/10 hover:bg-brand-primary/20 truncate flex items-center gap-1"
                                        >
                                            {lesson.meetLink && <Video className="h-3 w-3 flex-shrink-0" />}
                                            <span className="truncate">{lesson.title}</span>
                                        </button>
                                    ))}
                                    {dayLessons.length > 2 && (
                                        <div className="text-xs text-gray-500 text-center">
                                            +{dayLessons.length - 2} المزيد
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
