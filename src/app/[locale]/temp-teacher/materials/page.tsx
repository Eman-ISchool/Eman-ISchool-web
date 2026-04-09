/**
 * Teacher Materials Page
 * Displays lesson materials with AI reel generation buttons
 */

'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageError } from '@/components/ui/page-error';

export default function MaterialsPage() {
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMaterials = async () => {
        try {
            setError(null);
            setLoading(true);
            // TODO: Implement API call to fetch materials
            // const res = await fetch('/api/materials');
            // if (res.ok) { setMaterials(await res.json()); }
            setMaterials([]);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError(isArabic ? 'فشل في تحميل المواد. يرجى المحاولة مرة أخرى.' : 'Failed to load materials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isArabic ? 'مواد الدروس' : 'Lesson Materials'}</h1>
                    <p className="text-gray-500 mt-1">{isArabic ? 'إدارة الموارد التعليمية والمواد الدراسية' : 'Manage your teaching materials and resources'}</p>
                </div>
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isArabic ? 'مواد الدروس' : 'Lesson Materials'}</h1>
                    <p className="text-gray-500 mt-1">{isArabic ? 'إدارة الموارد التعليمية والمواد الدراسية' : 'Manage your teaching materials and resources'}</p>
                </div>
                <PageError message={error} onRetry={fetchMaterials} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{isArabic ? 'مواد الدروس' : 'Lesson Materials'}</h1>
                <p className="text-gray-500 mt-1">{isArabic ? 'إدارة الموارد التعليمية والمواد الدراسية' : 'Manage your teaching materials and resources'}</p>
            </div>
            {materials.length === 0 ? (
                <EmptyState
                    icon={<FileText className="w-8 h-8 text-gray-400" />}
                    title={isArabic ? 'لم يتم العثور على مواد' : 'No materials found'}
                    description={isArabic ? 'ارفع مواد الدروس لمشاركتها مع طلابك.' : 'Upload lesson materials to share with your students.'}
                />
            ) : (
                <div className="space-y-3">
                    {materials.map((material: any) => (
                        <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="font-semibold text-gray-900">{material.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
