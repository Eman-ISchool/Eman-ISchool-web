'use client';

import { useEffect, useState } from 'react';
import { Clock, Calendar, Video, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface NextLessonCardProps {
    lessons: Lesson[];
}

export function NextLessonCard({ lessons }: NextLessonCardProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [now, setNow] = useState(new Date());

    // Find the next upcoming lesson
    const nextLesson = lessons
        .filter(lesson => {
            const start = new Date(lesson.startDateTime);
            const end = new Date(lesson.endDateTime);
            return (lesson.status === 'scheduled' && start > now) ||
                (lesson.status === 'live') ||
                (now >= start && now <= end);
        })
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())[0];

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!nextLesson) return;

        const updateCountdown = () => {
            const start = new Date(nextLesson.startDateTime);
            const diff = start.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('الدرس بدأ الآن!');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days} يوم ${hours} ساعة`);
            } else if (hours > 0) {
                setTimeLeft(`${hours} ساعة ${minutes} دقيقة`);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes} دقيقة ${seconds} ثانية`);
            } else {
                setTimeLeft(`${seconds} ثانية`);
            }
        };

        updateCountdown();
    }, [nextLesson, now]);

    if (!nextLesson) {
        return null;
    }

    const startDate = new Date(nextLesson.startDateTime);
    const endDate = new Date(nextLesson.endDateTime);
    const isLive = nextLesson.status === 'live' || (now >= startDate && now <= endDate);
    const isStartingSoon = startDate.getTime() - now.getTime() <= 15 * 60 * 1000; // Within 15 minutes

    return (
        <Card className={`relative overflow-hidden border-2 ${isLive
                ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50'
                : isStartingSoon
                    ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50'
                    : 'border-brand-primary bg-gradient-to-r from-yellow-50 to-green-50'
            }`}>
            {/* Animated pulse indicator for live lessons */}
            {isLive && (
                <div className="absolute top-4 left-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            )}

            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        {/* Header Label */}
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="h-4 w-4 text-brand-primary" />
                            <span className={`text-sm font-medium ${isLive ? 'text-red-600' : 'text-brand-primary'
                                }`}>
                                {isLive ? 'الدرس الحالي - مباشر الآن!' : 'الدرس القادم'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                            {nextLesson.title}
                        </h3>

                        {/* Lesson Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-brand-primary" />
                                <span>
                                    {startDate.toLocaleDateString('ar-EG', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-brand-primary" />
                                <span dir="ltr">
                                    {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {nextLesson.teacher && (
                                <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4 text-brand-primary" />
                                    <span>{nextLesson.teacher.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Countdown and Button */}
                    <div className="flex flex-col items-center md:items-end gap-3">
                        {/* Countdown */}
                        {!isLive && (
                            <div className="text-center md:text-right">
                                <p className="text-xs text-gray-500 mb-1">يبدأ خلال</p>
                                <p className={`text-lg font-bold ${isStartingSoon ? 'text-yellow-600' : 'text-gray-800'
                                    }`}>
                                    {timeLeft}
                                </p>
                            </div>
                        )}

                        {/* Join Button */}
                        {nextLesson.meetLink && (isLive || isStartingSoon) && (
                            <JoinMeetButton
                                lessonId={nextLesson._id}
                                meetLink={nextLesson.meetLink}
                                isLive={isLive}
                                className={`px-6 py-3 text-lg ${isLive
                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                        : 'bg-green-500 hover:bg-green-600'
                                    } text-white`}
                            >
                                <Video className="h-5 w-5 ml-2" />
                                {isLive ? 'انضم الآن!' : 'استعد للدخول'}
                            </JoinMeetButton>
                        )}

                        {/* Show meet link availability */}
                        {!nextLesson.meetLink && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Video className="h-4 w-4" />
                                <span>رابط الدرس سيتوفر قريباً</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
