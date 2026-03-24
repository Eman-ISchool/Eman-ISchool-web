'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.about': 'من نحن',
        'nav.curriculum': 'المواد الدراسية',
        'nav.studyWithUs': 'ادرس معنا',
        'nav.blog': 'المدونة',
        'nav.national': 'تعليم عام (لغات)',
        'nav.azhar': 'تعليم أزهري',
        'nav.vr': 'تجربة VR التعليمية ✨',
        'nav.exams': 'محاكاة الامتحانات',
        'nav.parent': 'لوحة ولي الأمر',
        'nav.login': 'سجل الآن',
        'nav.dashboard': 'لوحة التحكم',
        'nav.logout': 'تسجيل الخروج',
        'nav.calendar': 'الجدول',
        'nav.chat': 'المحادثات',
        'nav.profile': 'الملف الشخصي',
        'header.search': 'بحث...',
        'header.greeting': 'مساء الخير',
        'home.announcements': 'الإعلانات',
        'home.viewAll': 'عرض الكل',
        'home.upcomingLessons': 'الدروس القادمة',
        'home.assignments': 'الواجبات والاختبارات',
        'home.teachers': 'المعلمون',
        'home.subjects': 'تصفح المواد',
        'home.join': 'انضم الآن',
        'home.live': 'مباشر الآن',
        'home.startsIn': 'يبدأ خلال',
        'home.noLessons': 'لا توجد دروس قادمة',
        'home.viewCalendar': 'عرض النتيجة',
        'home.searchPlaceholder': 'ابحث عن الدروس، الواجبات...',
        'calendar.title': 'الجدول الدراسي',
        'calendar.today': 'اليوم',
        'calendar.month': 'شهر',
        'calendar.week': 'أسبوع',
        'calendar.upcoming': 'القادم',
        'chat.title': 'الرسائل',
        'chat.search': 'بحث في المحادثات...',
        'chat.typeMessage': 'اكتب رسالة...',
        'chat.noMessages': 'لا توجد محادثات',
        'profile.update': 'تحديث الملف الشخصي',
        'profile.language': 'اللغة',
        'profile.fees': 'دفع الرسوم',
        'profile.class': 'فصلي',
        'profile.certificates': 'الشهادات',
        'profile.exams': 'الامتحانات والنتائج',
        'profile.settings': 'الإعدادات',
        'profile.logout': 'تسجيل الخروج',
        'nav.reels': 'المقاطع',
        'reels.title': 'مقاطع تعليمية ذكية',
        'reels.subtitle': 'تعلم سريع في أقل من دقيقتين',
        'reels.today': 'مقاطع اليوم',
        'reels.week': 'مقاطع هذا الأسبوع',
        'reels.all': 'كل المقاطع',
        'reels.subjectAll': 'كل المواد',
        'reels.teacherAll': 'كل المعلمين',
        'reels.lessonAll': 'كل الدروس',
        'reels.filter.subject': 'المادة',
        'reels.filter.teacher': 'المعلم',
        'reels.filter.lesson': 'الدرس',
        'reels.filter.date': 'التاريخ',
        'reels.save': 'احفظ لوقت لاحق',
        'reels.saved': 'تم الحفظ',
        'reels.markCompleted': 'وضع كمكتمل',
        'reels.completed': 'مكتمل',
        'reels.next': 'التالي',
        'reels.objective': 'هدف الدرس',
        'reels.keywords': 'الكلمات المفتاحية',
        'reels.captions': 'الشرح',
        'reels.noResults': 'لا توجد مقاطع مطابقة للفلاتر',
        'reels.mute': 'كتم الصوت',
        'reels.unmute': 'تشغيل الصوت',
        'reels.duration': 'المدة',
    },
    en: {
        'nav.home': 'Home',
        'nav.about': 'About Us',
        'nav.curriculum': 'Curriculum',
        'nav.studyWithUs': 'Study With Us',
        'nav.blog': 'Blog',
        'nav.national': 'National School',
        'nav.azhar': 'Al-Azhar School',
        'nav.vr': 'VR Experience ✨',
        'nav.exams': 'Exam Simulation',
        'nav.parent': 'Parent Dashboard',
        'nav.login': 'Register Now',
        'nav.dashboard': 'Dashboard',
        'nav.logout': 'Logout',
        'nav.calendar': 'Calendar',
        'nav.chat': 'Chat',
        'nav.profile': 'Profile',
        'header.search': 'Search...',
        'header.greeting': 'Good Evening',
        'home.announcements': 'Announcements',
        'home.viewAll': 'View All',
        'home.upcomingLessons': 'Upcoming Lessons',
        'home.assignments': 'Assignments & Quizzes',
        'home.teachers': 'Teachers',
        'home.subjects': 'Explore Subjects',
        'home.join': 'Join Now',
        'home.live': 'Live Now',
        'home.startsIn': 'Starts in',
        'home.noLessons': 'No upcoming lessons scheduled',
        'home.viewCalendar': 'View Calendar',
        'home.searchPlaceholder': 'Search lessons, assignments...',
        'calendar.title': 'Calendar',
        'calendar.today': 'Today',
        'calendar.month': 'Month',
        'calendar.week': 'Week',
        'calendar.upcoming': 'Upcoming',
        'chat.title': 'Messages',
        'chat.search': 'Search conversations...',
        'chat.typeMessage': 'Type a message...',
        'chat.noMessages': 'No conversations found',
        'profile.update': 'Update Profile',
        'profile.language': 'Language',
        'profile.fees': 'Pay Fees',
        'profile.class': 'My Class',
        'profile.certificates': 'Certificates',
        'profile.exams': 'Exams & Results',
        'profile.settings': 'Settings',
        'profile.logout': 'Logout',
        'nav.reels': 'Reels',
        'reels.title': 'AI Learning Reels',
        'reels.subtitle': 'Bite-sized lessons under 2 minutes',
        'reels.today': "Today's Reels",
        'reels.week': 'This Week',
        'reels.all': 'All Reels',
        'reels.subjectAll': 'All Subjects',
        'reels.teacherAll': 'All Teachers',
        'reels.lessonAll': 'All Lessons',
        'reels.filter.subject': 'Subject',
        'reels.filter.teacher': 'Teacher',
        'reels.filter.lesson': 'Lesson',
        'reels.filter.date': 'Date',
        'reels.save': 'Save for later',
        'reels.saved': 'Saved',
        'reels.markCompleted': 'Mark as completed',
        'reels.completed': 'Completed',
        'reels.next': 'Next reel',
        'reels.objective': 'Lesson objective',
        'reels.keywords': 'Keywords',
        'reels.captions': 'Captions',
        'reels.noResults': 'No reels match the selected filters',
        'reels.mute': 'Mute',
        'reels.unmute': 'Unmute',
        'reels.duration': 'Duration',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider that derives language from next-intl's useLocale().
 * No duplicate state — single source of truth is the URL locale.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const locale = useLocale() as Language;
    const router = useRouter();
    const pathname = usePathname();

    const language: Language = locale === 'en' ? 'en' : 'ar';
    const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

    const toggleLanguage = useCallback(() => {
        const nextLocale = language === 'ar' ? 'en' : 'ar';
        const switchedPath = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${nextLocale}`);
        router.push(switchedPath || `/${nextLocale}`);
    }, [language, pathname, router]);

    const t = useCallback((key: string): string => {
        return translations[language]?.[key] || key;
    }, [language]);

    const value = useMemo(() => ({
        language,
        direction,
        toggleLanguage,
        t,
    }), [language, direction, toggleLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
