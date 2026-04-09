import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { LessonForm } from '@/components/teacher/LessonForm';

export default async function NewLessonPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { courseId?: string; subjectId?: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'teacher') {
        redirect(withLocalePrefix('/', locale));
    }

    return (
        <div className="space-y-6">
            <LessonForm
                courseId={searchParams.courseId}
                subjectId={searchParams.subjectId}
                locale={locale}
            />
        </div>
    );
}
