import MultiStepForm from "@/components/enrollment/MultiStepForm";

export const metadata = {
    title: "School Enrollment | Eduverse",
    description: "Enroll your child in our school",
};

export default function EnrollmentPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight">
                        School Enrollment
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Join our community. Please complete the steps below to enroll your child.
                    </p>
                </div>

                <MultiStepForm />
            </div>
        </div>
    );
}
