'use client';

import { useState } from 'react';
import { useMeetingHeartbeat } from '@/hooks/useMeetingHeartbeat';
import { ExternalLink } from 'lucide-react';

export function MeetingJoinTracker({ lessonId, meetLink }: { lessonId: string, meetLink: string }) {
    const [meetingActive, setMeetingActive] = useState(false);

    // Activates the heartbeat when the user clicks the join link
    useMeetingHeartbeat(lessonId, meetingActive);

    const handleJoin = () => {
        setMeetingActive(true);
        window.open(meetLink, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleJoin}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
        >
            <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <ExternalLink className="w-3 h-3 mr-1" />
            Join Live Class
        </button>
    );
}
