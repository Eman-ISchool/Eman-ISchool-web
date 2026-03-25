'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { withLocalePrefix } from '@/lib/locale-path';

interface LessonFormProps {
    courseId?: string;
    subjectId?: string;
    lesson?: any; // If editing
    locale: string;
}

export function LessonForm({ courseId, subjectId, lesson, locale }: LessonFormProps) {
    const t = useTranslations('teacher.lessons');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Support both camelCase (API list response) and snake_case (Supabase direct)
    const lessonStart = lesson?.start_date_time || lesson?.startDateTime;
    const lessonEnd = lesson?.end_date_time || lesson?.endDateTime;

    const [formData, setFormData] = useState({
        title: lesson?.title || '',
        startDateTime: lessonStart ? new Date(lessonStart).toISOString().slice(0, 16) : '',
        duration: lessonStart && lessonEnd
            ? Math.round((new Date(lessonEnd).getTime() - new Date(lessonStart).getTime()) / 60000)
            : 60,
        description: lesson?.description || '',
        meetLink: lesson?.meet_link || lesson?.meetLink || '',
        meetingProvider: lesson?.meeting_provider || lesson?.meetingProvider || '',
        meetingTitle: lesson?.meeting_title || lesson?.meetingTitle || '',
        meetingDurationMin: lesson?.meeting_duration_min || lesson?.meetingDurationMin || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!formData.title || !formData.startDateTime || !formData.duration) {
                throw new Error('Please fill in required fields');
            }

            // Calculate endDateTime
            const startDate = new Date(formData.startDateTime);
            const endDate = new Date(startDate.getTime() + Number(formData.duration) * 60000);

            // If teacher pasted a manual meet link, skip auto-generation
            const hasManualLink = !!formData.meetLink.trim();
            const wantsAutoGenerate = formData.meetingProvider === 'google_meet' && !hasManualLink;

            const payload = {
                title: formData.title,
                description: formData.description,
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                courseId: courseId,
                subjectId: subjectId,
                meetLink: formData.meetLink.trim() || undefined,
                skipMeetGeneration: !wantsAutoGenerate,
                meetingTitle: formData.meetingTitle || undefined,
                meetingProvider: formData.meetingProvider || undefined,
                meetingDurationMin: formData.meetingDurationMin ? Number(formData.meetingDurationMin) : undefined,
            };

            const url = lesson ? '/api/lessons' : '/api/lessons';
            const method = lesson ? 'PATCH' : 'POST';

            // For PATCH, we need to pass ID in body as per verify in api/lessons/route.ts
            const finalPayload = lesson ? { ...payload, id: lesson._id || lesson.id } : payload;

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.details ? `${data.error}: ${data.details} (${data.code})` : (data.error || 'Failed to save lesson');
                if (data.requiresGoogleAuth) {
                    throw new Error(errorMessage);
                }
                throw new Error(errorMessage);
            }

            // Redirect back to course details
            // We need to know where to go back. If we have courseId, go to course details.
            // If editing, go to lesson details or course details.

            if (courseId) {
                router.push(withLocalePrefix(`/teacher/courses/${courseId}`, locale));
            } else if (lesson && lesson.course?.id) {
                router.push(withLocalePrefix(`/teacher/courses/${lesson.course.id}`, locale));
            } else {
                router.back();
            }

            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{lesson ? t('edit') : t('create')}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">{t('lessonTitle')} *</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDateTime">{t('time')} *</Label>
                            <Input
                                id="startDateTime"
                                name="startDateTime"
                                type="datetime-local"
                                value={formData.startDateTime}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">{t('duration')} *</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            rows={4}
                        />
                    </div>

                    {/* ── Google Meet Section ── */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                        <p className="text-sm font-semibold text-blue-700">Google Meet</p>

                        <div className="space-y-2">
                            <Label htmlFor="meetLink">رابط الميتينج (الصق هنا لو عندك رابط)</Label>
                            <Input
                                id="meetLink"
                                name="meetLink"
                                type="url"
                                value={formData.meetLink || ''}
                                onChange={handleChange}
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                اتركه فارغاً + اختر &quot;Google Meet&quot; أسفله عشان يتولّد أوتوماتيك
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meetingProvider">Meeting Provider</Label>
                            <select
                                id="meetingProvider"
                                name="meetingProvider"
                                value={formData.meetingProvider || ''}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">— بدون ميتينج —</option>
                                <option value="google_meet">Google Meet (أوتوماتيك)</option>
                                <option value="zoom">Zoom</option>
                                <option value="teams">Microsoft Teams</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-brand-primary text-black hover:bg-yellow-400"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save')}
                    </Button>
                </CardFooter>
            </form>
        </Card >
    );
}
