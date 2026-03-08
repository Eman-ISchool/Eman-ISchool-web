import { CourseCatalog } from '@/components/courses/CourseCatalog';
import { getTranslations } from 'next-intl/server';

export default async function ParentCoursesPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const t = await getTranslations('parent.courses');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-orange-500 w-fit">
                    Browse Courses
                </h1>
                <p className="text-gray-500 mt-2">
                    Explore our catalog and find the perfect courses for your children.
                </p>
            </div>

            <CourseCatalog
                searchParams={searchParams}
                locale={locale}
                role="parent"
            />
        </div>
    );
}
