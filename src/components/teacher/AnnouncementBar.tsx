'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Announcement {
    id: string;
    text: string;
    createdAt: string;
}

interface AnnouncementBarProps {
    announcement: Announcement;
    onViewAll?: () => void;
}

export function AnnouncementBar({ announcement, onViewAll }: AnnouncementBarProps) {
    const { t, language } = useLanguage();

    return (
        <div className="bg-amber-400 text-amber-900 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium truncate">
                {announcement.text}
            </p>
            <span className="text-xs opacity-75 flex-shrink-0 hidden sm:block">
                {new Date(announcement.createdAt).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { month: 'short', day: 'numeric' }
                )}
            </span>
            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1 text-xs font-medium hover:underline flex-shrink-0"
                >
                    {t('home.viewAll')}
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
