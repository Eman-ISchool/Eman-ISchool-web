import { redirect } from 'next/navigation';

export const metadata = {
    title: "School Enrollment | Eduverse",
    description: "Enroll your child in our school",
};

export default function EnrollmentPage({
    params: { locale },
}: {
    params: { locale: string };
}) {
    redirect(`/${locale}/enrollment/apply`);
}
