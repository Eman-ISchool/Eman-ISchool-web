'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader2 } from 'lucide-react';

interface JoinLessonButtonProps {
    lessonId: string;
    isJoined?: boolean;
    isLive?: boolean;
    onJoin?: () => void;
    onLeave?: () => void;
    disabled?: boolean;
}

export function JoinLessonButton({
    lessonId,
    isJoined = false,
    isLive = false,
    onJoin,
    onLeave,
    disabled = false
}: JoinLessonButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            if (isJoined) {
                if (onLeave) {
                    await onLeave();
                }
            } else {
                if (onJoin) {
                    await onJoin();
                }
            }
        } catch (error) {
            console.error('Error handling lesson join/leave:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLive) {
        return (
            <Button disabled variant="outline" size="lg">
                <Video className="h-4 w-4 mr-2" />
                Lesson Not Started
            </Button>
        );
    }

    if (isJoined) {
        return (
            <Button
                onClick={handleClick}
                disabled={disabled || isLoading}
                variant="destructive"
                size="lg"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Leave Lesson
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || isLoading}
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary/90"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Video className="h-4 w-4 mr-2" />
            )}
            Join Live Lesson
        </Button>
    );
}
