import { redirect } from 'next/navigation';

export default function TeacherPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/temp-teacher/home`);
}
