'use client';

import { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JoinMeetButtonProps {
    lessonId: string;
    meetLink: string;
    isLive?: boolean;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    children?: React.ReactNode;
}

export function JoinMeetButton({
    lessonId,
    meetLink,
    isLive = false,
    className = "",
    variant = "default",
    size = "default",
    children
}: JoinMeetButtonProps) {
    const [isLogging, setIsLogging] = useState(false);

    const handleJoin = async (e: React.MouseEvent) => {
        // We don't prevent default as we want to open the link, 
        // but we'll try to log the attendance in parallel

        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    action: 'join'
                })
            });
        } catch (error) {
            console.error('Failed to log attendance:', error);
        }
    };

    return (
        <Button
            className={`${className} ${isLive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
            variant={variant}
            size={size}
            asChild
            onClick={handleJoin}
        >
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Video className="h-4 w-4" />
                {children || (isLive ? "انضم الآن" : "رابط الدرس")}
            </a>
        </Button>
    );
}
