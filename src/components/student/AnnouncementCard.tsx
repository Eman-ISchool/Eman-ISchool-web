import { Bell } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    body?: string;
    priority?: 'normal' | 'high' | 'urgent';
    createdAt: string;
}

interface AnnouncementCardProps {
    announcement: Announcement;
    onViewAll?: () => void;
}

export function AnnouncementCard({ announcement, onViewAll }: AnnouncementCardProps) {
    const priorityStyles = {
        normal: 'bg-[var(--color-primary)] text-white',
        high: 'bg-amber-500 text-white',
        urgent: 'bg-red-500 text-white',
    };

    const priorityClass = priorityStyles[announcement.priority || 'normal'];

    return (
        <div className={`card-soft p-5 ${priorityClass} relative overflow-hidden max-h-48`}>
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="80" cy="20" r="40" fill="currentColor" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-90">Announcement</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
                        {announcement.body && (
                            <p className="text-sm opacity-90 line-clamp-2">{announcement.body}</p>
                        )}
                        <p className="text-xs opacity-75 mt-3">
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="mt-4 text-sm font-medium underline opacity-90 hover:opacity-100 transition-opacity"
                    >
                        View all announcements
                    </button>
                )}
            </div>
        </div>
    );
}
