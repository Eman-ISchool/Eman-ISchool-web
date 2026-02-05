import { redirect } from 'next/navigation';

export default function StudentPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/student/home`);
}
