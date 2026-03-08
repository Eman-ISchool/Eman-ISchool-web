import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { getTranslations } from 'next-intl/server';
import { CreateSubjectForm } from '@/components/teacher/CreateSubjectForm';

export default async function NewSubjectPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('teacher.subjects');

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Get translated strings server-side and pass as props
    const tTitle = t('createTitle');
    const tName = t('name');
    const tDesc = t('description');
    const tImage = t('image');
    const tCancel = t('cancel');
    const tSubmit = t('submit');
    const tImageUrlPlaceholder = t('imageUrlPlaceholder');

    return (
        <div className="space-y-6">
            <CreateSubjectForm 
                locale={locale}
                titleLabel={tTitle}
                nameLabel={tName}
                descriptionLabel={tDesc}
                imageLabel={tImage}
                cancelLabel={tCancel}
                submitLabel={tSubmit}
                imageUrlPlaceholder={tImageUrlPlaceholder}
            />
        </div>
    );
}
