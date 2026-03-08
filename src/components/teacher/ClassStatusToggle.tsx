'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface ClassStatusToggleProps {
    lessonId: string;
    currentStatus: string;
    locale: string;
}

export function ClassStatusToggle({ lessonId, currentStatus, locale }: ClassStatusToggleProps) {
    const t = useTranslations('teacher.lessons');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const isLive = status === 'live';
    const isCompleted = status === 'completed';
    const isScheduled = status === 'scheduled';

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const newStatus = isLive ? 'completed' : 'live';
            const res = await fetch(`/api/lessons/${lessonId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update lesson status');
            }

            setStatus(newStatus);
        } catch (error: any) {
            console.error('Error toggling class status:', error);
            alert(error.message || 'Failed to update lesson status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={handleToggle}
                disabled={isLoading || isCompleted}
                variant={isLive ? 'destructive' : 'default'}
                className="w-full"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLive ? t('endClass') : t('startClass')}
                    </>
                ) : (
                    <>
                        {isLive ? t('endClass') : t('startClass')}
                    </>
                )}
            </Button>
            {isCompleted && (
                <p className="text-sm text-gray-500 text-center">
                    This class has ended
                </p>
            )}
        </div>
    );
}
