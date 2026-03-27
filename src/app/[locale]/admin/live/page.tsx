'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Video,
    Play,
    Users,
    Clock,
    CheckCircle,
    Calendar,
    RefreshCw,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '@/components/admin/StateComponents';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface MeetingData {
    lessonId: string;
    meetUrl: string;
    meetingCode: string;
    provider: string;
    status: string;
    spaceName?: string;
    ownerGoogleEmail?: string;
    startedAt?: string;
    endedAt?: string;
}

interface ApiMeetingItem {
    lessonId: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    course: { id: string; title: string } | null;
    teacher: { id: string; name: string; email: string; image?: string } | null;
    attendanceCount: number;
    meeting: MeetingData | null;
}

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

function deriveSessionStatus(startDateTime: string, endDateTime: string, lessonStatus: string): 'live' | 'starting_soon' | 'completed' {
    if (lessonStatus === 'completed') return 'completed';
    const now = Date.now();
    const start = new Date(startDateTime).getTime();
    const end = new Date(endDateTime).getTime();

    if (now >= start && now <= end) return 'live';
    if (start > now && start - now <= 30 * 60 * 1000) return 'starting_soon';
    if (now > end) return 'completed';
    return 'starting_soon';
}

function mapApiToSession(item: ApiMeetingItem): LiveSession {
    const status = deriveSessionStatus(item.startDateTime, item.endDateTime, item.status);
    return {
        id: item.lessonId,
        title: item.title,
        teacherName: item.teacher?.name || 'Unknown',
        teacherImage: item.teacher?.image,
        className: item.course?.title || '',
        subject: item.course?.title || '',
        startTime: new Date(item.startDateTime),
        endTime: new Date(item.endDateTime),
        status,
        attendees: item.attendanceCount,
        maxAttendees: 30,
        meetLink: item.meeting?.meetUrl,
    };
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
                    <span>{session.attendees}</span>
                </div>
            </div>

            {session.meetLink && (
                <div className="mb-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2 break-all">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span>{session.meetLink}</span>
                </div>
            )}

            <div className="flex gap-2">
                {(session.status === 'live' || session.status === 'starting_soon') && session.meetLink && (
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
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<LiveSession[]>([]);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/meetings?limit=50');
            if (!res.ok) {
                throw new Error(`Failed to load meetings (${res.status})`);
            }
            const data = await res.json();
            const mapped = (data.meetings || []).map(mapApiToSession);
            setSessions(mapped);
        } catch (err: any) {
            console.error('[admin/live] fetch error:', err);
            setError(err.message || 'Failed to load live sessions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const liveSessions = sessions.filter((s) => s.status === 'live');
    const upcomingSessions = sessions.filter((s) => s.status === 'starting_soon');
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    if (loading) {
        return <LoadingState message="جاري تحميل الجلسات..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchSessions} />;
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
                    <button onClick={fetchSessions} className="admin-btn admin-btn-ghost">
                        <RefreshCw className="w-4 h-4" />
                        تحديث
                    </button>
                    <Link href={withLocalePrefix('/admin/calendar', locale)} className="admin-btn admin-btn-secondary">
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
                                        onJoin={() => window.open(session.meetLink, '_blank')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

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
