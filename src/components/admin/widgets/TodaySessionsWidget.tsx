'use client';

import Link from 'next/link';
import { Video, Play, Clock, CheckCircle } from 'lucide-react';

interface Session {
    id: string;
    title: string;
    teacherName: string;
    time: string;
    status: 'live' | 'upcoming' | 'completed';
    meetLink?: string;
}

interface TodaySessionsWidgetProps {
    sessions: Session[];
    className?: string;
}

export default function TodaySessionsWidget({
    sessions,
    className = '',
}: TodaySessionsWidgetProps) {
    const liveSessions = sessions.filter((s) => s.status === 'live');
    const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    const getStatusBadge = (status: Session['status']) => {
        switch (status) {
            case 'live':
                return (
                    <span className="admin-badge admin-badge-live flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        مباشر
                    </span>
                );
            case 'upcoming':
                return <span className="admin-badge admin-badge-upcoming">قادم</span>;
            case 'completed':
                return <span className="admin-badge admin-badge-completed">منتهي</span>;
        }
    };

    const getStatusIcon = (status: Session['status']) => {
        switch (status) {
            case 'live':
                return <Video className="w-4 h-4 text-red-500" />;
            case 'upcoming':
                return <Clock className="w-4 h-4 text-teal-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getSessionHref = (session: Session) =>
        session.status === 'live'
            ? `/admin/live?session=${session.id}`
            : `/admin/lessons?lesson=${session.id}`;

    return (
        <div className={`admin-card ${className}`}>
            <div className="admin-card-header flex items-center justify-between">
                <h3 className="admin-card-title">
                    <Video className="w-5 h-5 text-teal-500" />
                    جلسات اليوم
                </h3>
                <Link
                    href="/admin/live"
                    className="text-sm text-teal-600 hover:underline"
                >
                    عرض الكل
                </Link>
            </div>
            <div className="admin-card-body p-0">
                {sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        لا توجد جلسات اليوم
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sessions.slice(0, 5).map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.status === 'live'
                                                ? 'bg-red-100'
                                                : session.status === 'upcoming'
                                                    ? 'bg-teal-100'
                                                    : 'bg-gray-100'
                                            }`}
                                    >
                                        {getStatusIcon(session.status)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{session.title}</p>
                                        <p className="text-sm text-gray-500">{session.teacherName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-700">
                                            {session.time}
                                        </p>
                                        {getStatusBadge(session.status)}
                                    </div>
                                    {session.status === 'live' && session.meetLink && (
                                        <a
                                            href={session.meetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="admin-btn admin-btn-primary text-sm py-1.5 px-3"
                                        >
                                            <Play className="w-4 h-4" />
                                            انضم
                                        </a>
                                    )}
                                    <Link
                                        href={getSessionHref(session)}
                                        className="admin-btn admin-btn-ghost text-sm py-1.5 px-3"
                                    >
                                        التفاصيل
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-around text-center">
                <div>
                    <p className="text-lg font-bold text-red-500">{liveSessions.length}</p>
                    <p className="text-xs text-gray-500">مباشر الآن</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-teal-500">{upcomingSessions.length}</p>
                    <p className="text-xs text-gray-500">قادمة</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-500">{completedSessions.length}</p>
                    <p className="text-xs text-gray-500">منتهية</p>
                </div>
            </div>
        </div>
    );
}
