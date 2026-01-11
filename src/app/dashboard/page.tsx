'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { LessonCard } from '@/components/LessonCard';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { NextLessonCard } from '@/components/dashboard/NextLessonCard';
import { JoinMeetButton } from '@/components/JoinMeetButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, Calendar, List, Plus, X, Video, AlertCircle } from 'lucide-react';

type TabType = 'overview' | 'calendar' | 'list';

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    teacher?: { name: string; image?: string };
}

interface Stats {
    totalLessons: number;
    upcomingLessons: number;
    completedLessons: number;
    totalStudents: number;
    todayLessons: Lesson[];
    thisWeekLessons: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        if (session) {
            fetchLessons();
            fetchStats();
        }
    }, [session]);

    const fetchLessons = async () => {
        try {
            const res = await fetch('/api/lessons');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLessons(data);
            }
        } catch (error) {
            console.error('Failed to fetch lessons', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    startDateTime: new Date(startTime).toISOString(),
                    endDateTime: new Date(endTime).toISOString(),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message || 'تم إنشاء الدرس بنجاح');
                await fetchLessons();
                await fetchStats();
                // Reset form
                setTitle('');
                setDescription('');
                setStartTime('');
                setEndTime('');
                setShowForm(false);
            } else {
                setError(data.error || 'فشل إنشاء الدرس');
            }
        } catch (error) {
            console.error(error);
            setError('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

        try {
            const res = await fetch(`/api/lessons?id=${lessonId}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccess('تم حذف الدرس بنجاح');
                await fetchLessons();
                await fetchStats();
            } else {
                setError('فشل حذف الدرس');
            }
        } catch (error) {
            setError('حدث خطأ أثناء حذف الدرس');
        }
    };

    if (status === 'loading') {
        return (
            <div className="container mx-auto p-10 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container mx-auto p-10 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">يجب تسجيل الدخول لعرض هذه الصفحة</h1>
                    <p className="text-gray-500 mb-6">سجل دخولك للوصول إلى لوحة التحكم وإدارة الدروس</p>
                    <Button onClick={() => signIn('google')} className="bg-brand-primary text-black hover:bg-yellow-400 font-bold">
                        تسجيل الدخول باستخدام Google
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">لوحة التحكم</h1>
                    <p className="text-gray-500">أهلاً بك، {session.user?.name}</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brand-primary text-black hover:bg-yellow-400 font-bold gap-2"
                >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? 'إلغاء' : 'درس جديد'}
                </Button>
            </header>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="mr-auto">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
                    <Video className="h-5 w-5 flex-shrink-0" />
                    <p>{success}</p>
                    <button onClick={() => setSuccess(null)} className="mr-auto">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Create Lesson Form - Collapsible */}
            {showForm && (
                <Card className="border-brand-primary border-2 animate-in slide-in-from-top-2 duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-brand-primary" />
                            جدولة درس جديد مع Google Meet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateLesson} className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">عنوان الدرس *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="مثال: مراجعة الرياضيات"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">الوصف</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="تفاصيل الدرس..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start">وقت البدء *</Label>
                                <Input
                                    id="start"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">وقت الانتهاء *</Label>
                                <Input
                                    id="end"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-brand-primary text-black hover:bg-yellow-400 font-bold gap-2"
                                    disabled={isCreating}
                                >
                                    <Video className="h-4 w-4" />
                                    {isCreating ? 'جاري الإنشاء...' : 'جدولة وإنشاء رابط Meet'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Next Lesson Card - Prominent display for students */}
            {!loading && lessons.length > 0 && (
                <NextLessonCard lessons={lessons} />
            )}

            {/* Stats */}
            <DashboardStats stats={stats} isLoading={statsLoading} />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'overview'
                        ? 'bg-brand-primary text-black'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <LayoutGrid className="h-4 w-4" />
                    نظرة عامة
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'calendar'
                        ? 'bg-brand-primary text-black'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Calendar className="h-4 w-4" />
                    التقويم
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'list'
                        ? 'bg-brand-primary text-black'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <List className="h-4 w-4" />
                    كل الدروس
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Today's Lessons */}
                    <Card>
                        <CardHeader>
                            <CardTitle>دروس اليوم</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.todayLessons && stats.todayLessons.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.todayLessons.map((lesson) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{lesson.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(lesson.startDateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {lesson.meetLink && (
                                                <JoinMeetButton
                                                    lessonId={lesson._id}
                                                    meetLink={lesson.meetLink}
                                                    isLive={true}
                                                    size="sm"
                                                    className="rounded-full"
                                                >
                                                    انضم
                                                </JoinMeetButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">لا توجد دروس مجدولة لليوم</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Lessons */}
                    <Card>
                        <CardHeader>
                            <CardTitle>الدروس القادمة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : lessons.filter(l => l.status === 'scheduled').slice(0, 5).length > 0 ? (
                                <div className="space-y-3">
                                    {lessons.filter(l => l.status === 'scheduled').slice(0, 5).map((lesson) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{lesson.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(lesson.startDateTime).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    {' - '}
                                                    {new Date(lesson.startDateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {lesson.meetLink && <Video className="h-4 w-4 text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">لا توجد دروس قادمة</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'calendar' && (
                <CalendarView
                    lessons={lessons}
                    onLessonClick={(lesson) => {
                        // Could open a modal here
                        console.log('Clicked lesson:', lesson);
                    }}
                />
            )}

            {activeTab === 'list' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : lessons.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lessons.map((lesson) => (
                                <LessonCard key={lesson._id} lesson={lesson} onDelete={handleDeleteLesson} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">لا توجد دروس مجدولة حالياً</p>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="mt-4 bg-brand-primary text-black hover:bg-yellow-400"
                            >
                                أنشئ درسك الأول
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
