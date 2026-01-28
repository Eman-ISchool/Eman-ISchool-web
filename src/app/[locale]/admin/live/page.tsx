'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Video,
    Play,
    Users,
    Clock,
    CheckCircle,
    Calendar,
    RefreshCw,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';

interface LiveSession {
    id: string;
    title: string;
    teacherName: string;
    teacherImage?: string;
    className: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    status: 'live' | 'starting_soon' | 'completed';
    attendees: number;
    maxAttendees: number;
    meetLink?: string;
}

function SessionCard({ session, onJoin }: { session: LiveSession; onJoin: () => void }) {
    const statusConfig = {
        live: {
            badge: 'admin-badge-live',
            label: 'مباشر الآن',
            bgClass: 'border-red-200 bg-red-50/50',
        },
        starting_soon: {
            badge: 'admin-badge-upcoming',
            label: 'يبدأ قريباً',
            bgClass: 'border-teal-200 bg-teal-50/50',
        },
        completed: {
            badge: 'admin-badge-completed',
            label: 'منتهي',
            bgClass: 'border-gray-200 bg-gray-50/50',
        },
    };

    const config = statusConfig[session.status];

    return (
        <div className={`admin-card p-4 border-2 ${config.bgClass}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {session.teacherImage ? (
                            <img
                                src={session.teacherImage}
                                alt={session.teacherName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Users className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{session.title}</h3>
                        <p className="text-sm text-gray-500">{session.teacherName}</p>
                    </div>
                </div>
                <span className={`admin-badge ${config.badge}`}>
                    {session.status === 'live' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                    )}
                    {config.label}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{session.className}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                        {session.startTime.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Video className="w-4 h-4" />
                    <span>{session.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                        {session.attendees} / {session.maxAttendees}
                    </span>
                </div>
            </div>

            {/* Attendance Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>نسبة الحضور</span>
                    <span>{Math.round((session.attendees / session.maxAttendees) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{
                            width: `${(session.attendees / session.maxAttendees) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {session.status === 'live' && session.meetLink && (
                    <button
                        onClick={onJoin}
                        className="flex-1 admin-btn admin-btn-primary"
                    >
                        <Play className="w-4 h-4" />
                        انضم للجلسة
                    </button>
                )}
                {session.status !== 'completed' && (
                    <button className="admin-btn admin-btn-secondary flex-1">
                        <Users className="w-4 h-4" />
                        تسجيل الحضور
                    </button>
                )}
                {session.status === 'completed' && (
                    <button className="admin-btn admin-btn-ghost flex-1">
                        <CheckCircle className="w-4 h-4" />
                        عرض التقرير
                    </button>
                )}
            </div>
        </div>
    );
}

export default function LiveSessionsPage() {
    const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<LiveSession[]>([]);

    useEffect(() => {
        // Mock data - replace with API
        const mockSessions: LiveSession[] = [
            {
                id: '1',
                title: 'درس الرياضيات - الجبر',
                teacherName: 'أ. أحمد محمد',
                className: 'الصف التاسع أ',
                subject: 'الرياضيات',
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                status: 'live',
                attendees: 18,
                maxAttendees: 25,
                meetLink: 'https://meet.google.com/abc-defg-hij',
            },
            {
                id: '2',
                title: 'درس الفيزياء - الحركة',
                teacherName: 'أ. سارة أحمد',
                className: 'الصف العاشر ب',
                subject: 'الفيزياء',
                startTime: new Date(Date.now() + 30 * 60 * 1000),
                endTime: new Date(Date.now() + 90 * 60 * 1000),
                status: 'starting_soon',
                attendees: 0,
                maxAttendees: 30,
                meetLink: 'https://meet.google.com/xyz-uvwx-yz',
            },
            {
                id: '3',
                title: 'درس اللغة العربية',
                teacherName: 'أ. محمد علي',
                className: 'الصف الثامن أ',
                subject: 'اللغة العربية',
                startTime: new Date(Date.now() - 120 * 60 * 1000),
                endTime: new Date(Date.now() - 60 * 60 * 1000),
                status: 'completed',
                attendees: 22,
                maxAttendees: 25,
            },
        ];

        setTimeout(() => {
            setSessions(mockSessions);
            setLoading(false);
        }, 500);
    }, []);

    const liveSessions = sessions.filter((s) => s.status === 'live');
    const upcomingSessions = sessions.filter((s) => s.status === 'starting_soon');
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    if (loading) {
        return <LoadingState message="جاري تحميل الجلسات..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الجلسات المباشرة</h1>
                    <p className="text-gray-500">متابعة جميع الجلسات الحية والمجدولة</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="admin-btn admin-btn-ghost">
                        <RefreshCw className="w-4 h-4" />
                        تحديث
                    </button>
                    <Link href="/admin/calendar" className="admin-btn admin-btn-secondary">
                        <Calendar className="w-4 h-4" />
                        عرض التقويم
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="admin-card p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                        <Video className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{liveSessions.length}</p>
                    <p className="text-sm text-gray-500">مباشر الآن</p>
                </div>
                <div className="admin-card p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-teal-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-teal-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{upcomingSessions.length}</p>
                    <p className="text-sm text-gray-500">قادمة</p>
                </div>
                <div className="admin-card p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{completedSessions.length}</p>
                    <p className="text-sm text-gray-500">منتهية</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-card p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'today'
                            ? 'bg-teal-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    اليوم
                </button>
                <button
                    onClick={() => setActiveTab('week')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'week'
                            ? 'bg-teal-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    هذا الأسبوع
                </button>
            </div>

            {/* Sessions Grid */}
            {sessions.length === 0 ? (
                <EmptyState
                    icon={<Video className="w-8 h-8 text-gray-400" />}
                    title="لا توجد جلسات"
                    message={`لا توجد جلسات ${activeTab === 'today' ? 'اليوم' : 'هذا الأسبوع'}`}
                />
            ) : (
                <>
                    {/* Live Now */}
                    {liveSessions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                مباشر الآن
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {liveSessions.map((session) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onJoin={() => window.open(session.meetLink, '_blank')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Starting Soon */}
                    {upcomingSessions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                يبدأ قريباً
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcomingSessions.map((session) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onJoin={() => { }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {completedSessions.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                جلسات منتهية
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {completedSessions.map((session) => (
                                    <SessionCard
                                        key={session.id}
                                        session={session}
                                        onJoin={() => { }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
