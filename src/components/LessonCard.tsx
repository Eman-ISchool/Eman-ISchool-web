'use client';

import { Calendar, Clock, Video, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JoinMeetButton } from '@/components/JoinMeetButton';

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    teacher?: {
        name: string;
        image?: string;
    };
}

interface LessonCardProps {
    lesson: Lesson;
    onDelete?: (id: string) => void;
}

export function LessonCard({ lesson, onDelete }: LessonCardProps) {
    const startDate = new Date(lesson.startDateTime);
    const endDate = new Date(lesson.endDateTime);
    const now = new Date();
    const isLive = lesson.status === 'live' || (now >= startDate && now <= endDate);
    const isPast = now > endDate;

    const getStatusBadge = () => {
        if (lesson.status === 'cancelled') {
            return <Badge variant="outline" className="bg-gray-100 text-gray-600">ملغي</Badge>;
        }
        if (lesson.status === 'completed' || isPast) {
            return <Badge variant="outline" className="bg-green-100 text-green-700">مكتمل</Badge>;
        }
        if (isLive) {
            return <Badge className="bg-red-500 text-white animate-pulse">مباشر الآن</Badge>;
        }
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">مجدول</Badge>;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 relative group">
            {onDelete && (
                <button
                    onClick={() => onDelete(lesson._id)}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    title="حذف الدرس"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold line-clamp-1">{lesson.title}</CardTitle>
                {getStatusBadge()}
            </CardHeader>

            <CardContent>
                {lesson.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{lesson.description}</p>
                )}
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-primary flex-shrink-0" />
                        <span className="line-clamp-1">
                            {startDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-primary flex-shrink-0" />
                        <span dir="ltr">
                            {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    {lesson.teacher && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-600">المعلم:</span>
                            <span className="font-semibold">{lesson.teacher.name}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                {lesson.meetLink ? (
                    <JoinMeetButton
                        lessonId={lesson._id}
                        meetLink={lesson.meetLink}
                        isLive={isLive}
                        className="w-full"
                        variant={isLive ? "default" : "outline"}
                    />
                ) : (
                    <Button disabled className="w-full bg-gray-100 text-gray-400">
                        رابط غير متوفر
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
