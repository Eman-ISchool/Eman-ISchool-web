import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { CreateTicketForm } from '@/components/support/CreateTicketForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewTicketPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    const initialValues = {
        subject: typeof searchParams.subject === 'string' ? searchParams.subject : undefined,
        category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
        description: typeof searchParams.description === 'string' ? searchParams.description : undefined,
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" asChild>
                <Link href={withLocalePrefix('/parent/support', locale)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Support
                </Link>
            </Button>

            <CreateTicketForm locale={locale} initialValues={initialValues} />
        </div>
    );
}
