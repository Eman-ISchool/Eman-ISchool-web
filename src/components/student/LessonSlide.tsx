'use client';

import { useState, useEffect } from 'react';
import { Video, Clock, User } from 'lucide-react';
import { checkMeetingFeasibility, type LessonInfo } from '@/lib/meeting-feasibility';

export interface Lesson {
    id: string;
    title: string;
    subject?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    teacher?: {
        name: string;
        image?: string;
    };
}

interface LessonSlideProps {
    lesson: Lesson;
}

export function LessonSlide({ lesson }: LessonSlideProps) {
    const [canJoin, setCanJoin] = useState(false);
    const [timeUntil, setTimeUntil] = useState('');

    useEffect(() => {
        const checkJoinability = () => {
            const now = new Date();
            const start = new Date(lesson.startDateTime);
            const end = new Date(lesson.endDateTime);

            // Can join 10 minutes before until end
            const joinWindow = new Date(start.getTime() - 10 * 60 * 1000);
            const isJoinable = now >= joinWindow && now <= end && lesson.meetLink;

            setCanJoin(!!isJoinable);

            // Calculate time until
            const diff = start.getTime() - now.getTime();
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                if (hours > 0) {
                    setTimeUntil(`Starts in ${hours}h ${minutes}m`);
                } else if (minutes > 0) {
                    setTimeUntil(`Starts in ${minutes}m`);
                } else {
                    setTimeUntil('Starting soon');
                }
            } else if (now <= end) {
                setTimeUntil('Live now');
            } else {
                setTimeUntil('Ended');
            }
        };

        checkJoinability();
        const interval = setInterval(checkJoinability, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [lesson]);

    const statusBadge = {
        scheduled: 'badge-upcoming',
        live: 'badge-live',
        completed: 'badge-completed',
        cancelled: 'badge-completed',
    };

    const [joinError, setJoinError] = useState<string | null>(null);

    const handleJoin = () => {
        setJoinError(null);
        const lessonInfo: LessonInfo = {
            id: lesson.id,
            title: lesson.title,
            startDateTime: lesson.startDateTime,
            endDateTime: lesson.endDateTime,
            meetLink: lesson.meetLink,
            status: lesson.status,
        };

        const feasibility = checkMeetingFeasibility(lessonInfo);

        if (feasibility.canJoin && feasibility.meetLink) {
            window.open(feasibility.meetLink, '_blank');
        } else {
            setJoinError(feasibility.reason || 'لا يمكن الانضمام للاجتماع حالياً');
            setTimeout(() => setJoinError(null), 4000);
        }
    };

    return (
        <div className="card-soft p-4 h-full flex flex-col">
            {/* Teacher Avatar & Info */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
                    {lesson.teacher?.image ? (
                        <img
                            src={lesson.teacher.image}
                            alt={lesson.teacher.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-6 h-6 text-[var(--color-primary)]" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] truncate">
                        {lesson.teacher?.name || 'Teacher'}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">
                        {lesson.subject || lesson.title}
                    </p>
                </div>
            </div>

            {/* Lesson Info */}
            <div className="flex-1">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                    {lesson.title}
                </h4>

                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-2">
                    <Clock className="w-4 h-4" />
                    <span>
                        {new Date(lesson.startDateTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                        {' • '}
                        {new Date(lesson.startDateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusBadge[lesson.status]}`}>
                    {timeUntil}
                </span>
            </div>

            {/* Join Error */}
            {joinError && (
                <p className="text-xs text-red-500 mt-2 text-center">{joinError}</p>
            )}

            {/* Join Button */}
            {lesson.meetLink ? (
                <button
                    onClick={handleJoin}
                    className={`w-full mt-3 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-semibold transition ${
                        canJoin
                            ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'
                    }`}
                >
                    <Video className="w-4 h-4" />
                    {canJoin ? 'انضم الآن' : timeUntil}
                </button>
            ) : (
                <div className="mt-3 text-center text-xs text-slate-400 py-2">
                    لا يوجد رابط اجتماع
                </div>
            )}
        </div>
    );
}
