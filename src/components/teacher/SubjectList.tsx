'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Trash2, Plus, Edit, ChevronRight, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withLocalePrefix } from '@/lib/locale-path';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Lesson {
    id: string;
    title: string;
    start_date_time: string;
}

interface Subject {
    id: string;
    title: string;
    lessons: Lesson[];
}

export function SubjectList({
    courseId,
    initialSubjects,
    locale
}: {
    courseId: string;
    initialSubjects: Subject[];
    locale: string
}) {
    const t = useTranslations('teacher.courseDetails');
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [isAdding, setIsAdding] = useState(false);
    const [newSubjectTitle, setNewSubjectTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSubject = async () => {
        if (!newSubjectTitle.trim()) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/courses/${courseId}/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newSubjectTitle }),
            });

            if (res.ok) {
                const newSubject = await res.json();
                setSubjects([...subjects, { ...newSubject, lessons: [] }]);
                setNewSubjectTitle('');
                setIsAdding(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to add subject', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubject = async (subjectId: string) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            const res = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== subjectId));
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to delete subject', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('subjects')}</h2>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addSubject')}
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-gray-50">
                    <CardContent className="pt-6 flex gap-4">
                        <Input
                            value={newSubjectTitle}
                            onChange={(e) => setNewSubjectTitle(e.target.value)}
                            placeholder={t('subjectTitle')}
                            disabled={isLoading}
                        />
                        <Button onClick={handleAddSubject} disabled={isLoading || !newSubjectTitle}>
                            {t('save')}
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isLoading}>
                            {t('cancel')}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {subjects.length > 0 ? (
                    subjects.map((subject) => (
                        <Card key={subject.id}>
                            <CardHeader className="py-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">{subject.title}</CardTitle>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {subject.lessons?.length || 0} {t('lessons')}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteSubject(subject.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4 pt-0">
                                <div className="pl-4 border-l-2 border-gray-100 space-y-2 mt-2">
                                    {subject.lessons && subject.lessons.length > 0 ? (
                                        subject.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex justify-between items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-brand-primary" />
                                                    <span className="font-medium text-sm">{lesson.title}</span>
                                                </div>
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={withLocalePrefix(`/teacher/courses/${courseId}/lessons/${lesson.id}`, locale)}>
                                                        <Edit className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-400 italic py-2">
                                            No lessons yet
                                        </div>
                                    )}
                                    <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                                        <Link href={withLocalePrefix(`/teacher/lessons/new?subjectId=${subject.id}&courseId=${courseId}`, locale)}>
                                            <Plus className="h-3 w-3 mr-2" />
                                            {t('addLesson')}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    !isAdding && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                            {t('noSubjects')}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
