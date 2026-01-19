'use client';

import { useState } from 'react';
import { Video, Loader2 } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);

    const logAttendance = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lessonId,
                    action: 'join',
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                console.warn('Failed to log attendance, but proceeding with join');
                return true; // Don't block join if logging fails
            }

            return true;
        } catch (err) {
            console.error('Attendance logging error:', err);
            return true; // Don't block join if logging fails
        }
    };

    const handleJoin = async (e: React.MouseEvent) => {
        e.preventDefault();
        setError(null);
        setIsLogging(true);

        try {
            // Log attendance before redirecting
            await logAttendance();

            // Navigate to the appropriate destination
            if (isLive) {
                window.location.href = `/dashboard/classroom/${lessonId}`;
            } else {
                window.open(meetLink, '_blank', 'noopener,noreferrer');
            }
        } catch (err) {
            setError('حدث خطأ أثناء الانضمام');
            console.error('Join error:', err);
        } finally {
            setIsLogging(false);
        }
    };

    if (isLive) {
        return (
            <Button
                className={`${className} bg-green-500 hover:bg-green-600 text-white gap-2`}
                variant={variant}
                size={size}
                onClick={handleJoin}
                disabled={isLogging}
            >
                {isLogging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Video className="h-4 w-4" />
                )}
                {children || "انضم الآن"}
            </Button>
        );
    }

    return (
        <Button
            className={`${className} gap-2`}
            variant={variant}
            size={size}
            onClick={handleJoin}
            disabled={isLogging}
        >
            {isLogging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Video className="h-4 w-4" />
            )}
            {children || "رابط الدرس"}
        </Button>
    );
}

