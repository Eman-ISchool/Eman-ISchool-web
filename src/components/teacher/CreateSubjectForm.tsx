'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { withLocalePrefix } from '@/lib/locale-path';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateSubjectFormProps {
    locale: string;
    titleLabel?: string;
    nameLabel?: string;
    descriptionLabel?: string;
    imageLabel?: string;
    cancelLabel?: string;
    submitLabel?: string;
    imageUrlPlaceholder?: string;
}

export function CreateSubjectForm({ 
    locale, 
    titleLabel = 'Create New Subject',
    nameLabel = 'Subject Name',
    descriptionLabel = 'Description',
    imageLabel = 'Cover Image URL',
    cancelLabel = 'Cancel',
    submitLabel = 'Create Subject',
    imageUrlPlaceholder = 'https://example.com/image.jpg'
}: CreateSubjectFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                throw new Error('Please provide a subject title');
            }

            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    image_url: formData.imageUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create subject');
            }

            // Redirect to subjects list or detail page
            router.push(withLocalePrefix(`/teacher/subjects`, locale));
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
                <CardTitle>{titleLabel}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">{nameLabel} *</Label>
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
                        <Label htmlFor="description">{descriptionLabel}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">{imageLabel}</Label>
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder={imageUrlPlaceholder}
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
                        {cancelLabel}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !formData.title}
                        className="bg-brand-primary text-black hover:bg-yellow-400"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
