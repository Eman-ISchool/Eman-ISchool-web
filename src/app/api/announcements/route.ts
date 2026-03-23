import { NextRequest, NextResponse } from 'next/server';

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    target: 'all' | 'students' | 'teachers' | 'parents';
    publishedAt: string;
    expiresAt?: string;
    isPinned: boolean;
    views: number;
}

// Mock announcements data - in production this would come from database
const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'إعلان هام: الامتحانات النهائية test1',
        content: 'نود إعلامكم بأن الامتحانات النهائية ستبدأ يوم الأحد القادم. يرجى الاستعداد جيداً ومراجعة جدول الامتحانات.',
        priority: 'high',
        target: 'all',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        views: 450,
    },
    {
        id: '2',
        title: 'تحديث: موعد اجتماع أولياء الأمور',
        content: 'تم تغيير موعد اجتماع أولياء الأمور إلى يوم الثلاثاء الساعة 4 مساءً.',
        priority: 'medium',
        target: 'parents',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        views: 234,
    },
    {
        id: '3',
        title: 'ورشة عمل المعلمين',
        content: 'دعوة لجميع المعلمين لحضور ورشة العمل حول أساليب التدريس الحديثة.',
        priority: 'medium',
        target: 'teachers',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        views: 89,
    },
    {
        id: '4',
        title: 'إجازة عيد الفطر المبارك',
        content: 'تعلن المدرسة عن إجازة عيد الفطر المبارك ابتداءً من يوم... وحتى...',
        priority: 'high',
        target: 'all',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isPinned: true,
        views: 678,
    },
    {
        id: '5',
        title: 'مسابقة الرياضيات السنوية',
        content: 'يسعدنا الإعلان عن انطلاق مسابقة الرياضيات السنوية. سجلوا الآن!',
        priority: 'low',
        target: 'students',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        isPinned: false,
        views: 145,
    },
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'all';

    // Filter announcements based on role
    let filteredAnnouncements = mockAnnouncements.filter((ann) => {
        // Filter by target audience
        if (ann.target === 'all') return true;
        if (role === 'student' && ann.target === 'students') return true;
        if (role === 'teacher' && ann.target === 'teachers') return true;
        if (role === 'parent' && ann.target === 'parents') return true;
        if (role === 'admin') return true;
        return false;
    });

    // Filter out expired announcements
    filteredAnnouncements = filteredAnnouncements.filter((ann) => {
        if (!ann.expiresAt) return true;
        return new Date(ann.expiresAt) > new Date();
    });

    // Sort by: pinned first, then priority (high > medium > low), then by date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filteredAnnouncements.sort((a, b) => {
        // Pinned items first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by priority
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Then by date (newest first)
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    const response = NextResponse.json({
        success: true,
        data: filteredAnnouncements,
        count: filteredAnnouncements.length,
    });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
}
