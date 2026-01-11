'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Video,
    Calendar,
    Users,
    Clock,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Play,
    CheckCircle,
    XCircle,
    ExternalLink,
    Filter,
} from 'lucide-react';

interface MeetingLog {
    id: string;
    event_type: string;
    metadata: any;
    created_at: string;
    lesson: {
        id: string;
        title: string;
        start_date_time: string;
        end_date_time: string;
        status: string;
        meet_link: string | null;
    };
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    } | null;
}

export default function AdminMeetingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<MeetingLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [eventFilter, setEventFilter] = useState<string>('');

    const limit = 50;

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || session.user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchLogs();
    }, [session, status, router, page, eventFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Fetch meeting logs from a dedicated endpoint or use lessons with attendance
            const res = await fetch('/api/lessons?limit=50');
            const data = await res.json();

            // Transform lessons data to meeting log format for display
            const meetingData = data.map((lesson: any) => ({
                id: lesson._id,
                event_type: lesson.status === 'completed' ? 'ended' :
                    lesson.status === 'live' ? 'started' : 'scheduled',
                metadata: { meet_link: lesson.meetLink },
                created_at: lesson.startDateTime,
                lesson: {
                    id: lesson._id,
                    title: lesson.title,
                    start_date_time: lesson.startDateTime,
                    end_date_time: lesson.endDateTime,
                    status: lesson.status,
                    meet_link: lesson.meetLink,
                },
                user: lesson.teacher,
            }));

            setLogs(meetingData);
        } catch (error) {
            console.error('Error fetching meeting logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventInfo = (eventType: string) => {
        switch (eventType) {
            case 'scheduled':
                return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100', label: 'مجدول' };
            case 'started':
                return { icon: Play, color: 'text-green-500', bg: 'bg-green-100', label: 'بدأ' };
            case 'ended':
                return { icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'انتهى' };
            case 'participant_joined':
                return { icon: Users, color: 'text-green-500', bg: 'bg-green-100', label: 'انضم مشارك' };
            case 'participant_left':
                return { icon: XCircle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'غادر مشارك' };
            default:
                return { icon: Video, color: 'text-gray-500', bg: 'bg-gray-100', label: eventType };
        }
    };

    // Calculate summary stats from logs
    const stats = {
        total: logs.length,
        completed: logs.filter(l => l.event_type === 'ended').length,
        scheduled: logs.filter(l => l.event_type === 'scheduled').length,
        live: logs.filter(l => l.event_type === 'started').length,
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            سجل الاجتماعات
                        </h1>
                        <p className="text-gray-500">تتبع جميع اجتماعات Google Meet</p>
                    </div>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Video className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-gray-500">إجمالي الاجتماعات</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                            <Play className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.live}</p>
                            <p className="text-sm text-gray-500">مباشر الآن</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.scheduled}</p>
                            <p className="text-sm text-gray-500">مجدول</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-gray-500">مكتمل</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={eventFilter}
                            onChange={(e) => {
                                setEventFilter(e.target.value);
                                setPage(0);
                            }}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="">كل الأحداث</option>
                            <option value="scheduled">مجدول</option>
                            <option value="started">بدأ</option>
                            <option value="ended">انتهى</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Meetings List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="h-20 bg-gray-100 rounded animate-pulse" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            لا توجد سجلات اجتماعات
                        </CardContent>
                    </Card>
                ) : (
                    logs
                        .filter(log => !eventFilter || log.event_type === eventFilter)
                        .map((log) => {
                            const eventInfo = getEventInfo(log.event_type);
                            const EventIcon = eventInfo.icon;

                            return (
                                <Card key={log.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 ${eventInfo.bg} rounded-full`}>
                                                    <EventIcon className={`h-5 w-5 ${eventInfo.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {log.lesson?.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {log.lesson?.start_date_time
                                                                ? new Date(log.lesson.start_date_time).toLocaleDateString('ar-EG', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })
                                                                : '-'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {log.lesson?.start_date_time
                                                                ? new Date(log.lesson.start_date_time).toLocaleTimeString('ar-EG', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })
                                                                : '-'}
                                                        </span>
                                                        {log.user && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                {log.user.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm ${eventInfo.bg} ${eventInfo.color}`}>
                                                    {eventInfo.label}
                                                </span>
                                                {log.lesson?.meet_link && (
                                                    <a
                                                        href={log.lesson.meet_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                                    >
                                                        <Video className="h-4 w-4" />
                                                        انضم
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                )}
            </div>
        </div>
    );
}
