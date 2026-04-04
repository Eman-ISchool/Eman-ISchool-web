'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export function PublishCourseButton({
    courseId,
    isPublished,
    locale
}: {
    courseId: string;
    isPublished: boolean;
    locale: string
}) {
    const t = useTranslations('teacher.courseDetails');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleTogglePublish = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: !isPublished }),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to toggle publish status', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={isPublished ? "outline" : "default"}
            onClick={handleTogglePublish}
            disabled={isLoading}
            className={!isPublished ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isPublished ? t('unpublish') : t('publish')}
        </Button>
    );
}
