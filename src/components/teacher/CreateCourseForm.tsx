'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Grade {
    id: string;
    name: string;
    slug: string;
}
interface Subject {
    id: string;
    title: string;
}

export function CreateCourseForm({
    grades,
    subjects,
    locale,
    initialGradeId = '',
}: {
    grades: Grade[];
    subjects: Subject[];
    locale: string;
    initialGradeId?: string;
}) {
    const t = useTranslations('teacher.courses.create');
    const tTitle = t.has('title') ? t('title') : 'Create New Course';
    const tName = t.has('name') ? t('name') : 'Course Name';
    const tDescription = t.has('description') ? t('description') : 'Description';
    const tPrice = t.has('price') ? t('price') : 'Price';
    const tCurrency = t.has('currency') ? t('currency') : 'EGP';
    const tGrade = t.has('grade') ? t('grade') : 'Grade Level';
    const tImage = t.has('image') ? t('image') : 'Course Image (URL)';
    const tDuration = t.has('duration') ? t('duration') : 'Duration (Hours)';
    const tCancel = t.has('cancel') ? t('cancel') : 'Cancel';
    const tSubmit = t.has('submit') ? t('submit') : 'Create';
    const tSelectGrade = t.has('selectGrade') ? t('selectGrade') : 'Select Grade';
    const tSelectSubject = t.has('selectSubject') ? t('selectSubject') : 'Select Subject';
    const tNoGrades = t.has('noGrades') ? t('noGrades') : 'No grade levels available. Contact your administrator to set up grade levels.';
    const tNoSubjects = t.has('noSubjects') ? t('noSubjects') : 'No subjects found. Create a subject first.';
    const tImageUrlPlaceholder = t.has('imageUrlPlaceholder') ? t('imageUrlPlaceholder') : 'https://example.com/image.jpg';

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '0',
        gradeId: initialGradeId,
        subjectId: '',
        imageUrl: '',
        durationHours: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!formData.title) {
                throw new Error('Course title is required');
            }
            if (!formData.gradeId) {
                throw new Error('Grade level is required');
            }
            if (!formData.subjectId) {
                throw new Error('Subject is required');
            }

            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    durationHours: formData.durationHours ? parseFloat(formData.durationHours) : null,
                    grade_id: formData.gradeId,
                    subject_id: formData.subjectId,
                    image_url: formData.imageUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create course');
            }

            // Redirect to course details or list
            router.push(withLocalePrefix(`/teacher/courses/${data.course.id}`, locale));
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
                <CardTitle>{tTitle}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">{tName} *</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{tDescription}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            rows={4}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">{tPrice} ({tCurrency})</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="durationHours">{tDuration}</Label>
                            <Input
                                id="durationHours"
                                name="durationHours"
                                type="number"
                                min="0"
                                step="any"
                                value={formData.durationHours}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="e.g. 10.5"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gradeId">{tGrade} *</Label>
                            {grades.length === 0 ? (
                                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm border border-yellow-200">
                                    <p>{tNoGrades}</p>
                                    <Link
                                        href={withLocalePrefix('/teacher/grades', locale)}
                                        className="inline-block mt-2 underline font-medium"
                                    >
                                        Open Grades
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    id="gradeId"
                                    name="gradeId"
                                    value={formData.gradeId}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>{tSelectGrade}</option>
                                    {grades.map((grade) => (
                                        <option key={grade.id} value={grade.id}>
                                            {grade.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subjectId">Subject *</Label>
                            {subjects.length === 0 ? (
                                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm border border-yellow-200">
                                    <p>{tNoSubjects}</p>
                                    <Link
                                        href={withLocalePrefix('/teacher/subjects/create', locale)}
                                        className="inline-block mt-2 underline font-medium"
                                    >
                                        Create Subject
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    id="subjectId"
                                    name="subjectId"
                                    value={formData.subjectId}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>{tSelectSubject}</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">{tImage}</Label>
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder={tImageUrlPlaceholder}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        {tCancel}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !formData.title || !formData.gradeId || !formData.subjectId}
                        className="bg-brand-primary text-black hover:bg-yellow-400"
                    >
                        {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {tSubmit}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
