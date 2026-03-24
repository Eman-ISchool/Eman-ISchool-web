'use client';

import { useCoursesList } from '@/lib/api/courses';
import { CardView } from '@/components/admin';
import { BookOpen, Users } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/admin/StateComponents';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/admin/PageHeader';

export default function CoursesPage() {
    const { data: courses, isLoading, error, refetch } = useCoursesList();
    const router = useRouter();
    const params = useParams();
    const locale = params?.locale || 'ar';

    const navigateToCreate = () => {
        router.push(`/${locale}/dashboard/courses/create`);
    };

    if (isLoading) return <LoadingState message="جاري تحميل المواد الدراسية..." />;
    if (error) return <ErrorState title="حدث خطأ" message="تعذر تحميل المواد الدراسية." onRetry={() => refetch()} />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="المواد الدراسية"
                subtitle="إدارة المواد الدراسية والمحتوى التعليمي"
                primaryAction={{
                    label: 'إضافة مادة دراسية',
                    icon: <BookOpen className="h-4 w-4" />,
                    onClick: navigateToCreate,
                }}
            />
            <CardView
                data={courses || []}
                viewMode="grid"
                gridCols={3}
                emptyTitle="لا توجد مواد دراسية"
                emptyMessage="لم يتم العثور على أي مواد دراسية. أضف مادتك الأولى!"
                emptyAction={{ label: 'إضافة مادة دراسية', onClick: navigateToCreate }}
            />
        </div>
    );
}
