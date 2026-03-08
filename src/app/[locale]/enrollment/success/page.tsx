import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function EnrollmentSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Application Submitted!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for submitting your enrollment application. We have received your details and payment. Our administration team will review your application and contact you soon.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link href="/parent-dashboard">
                            <Button className="w-full bg-brand-primary text-black font-bold hover:bg-brand-primary-hover">
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
