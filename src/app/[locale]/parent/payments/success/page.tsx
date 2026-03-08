import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { stripe } from '@/lib/stripe';

export default async function PaymentSuccessPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { session_id?: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(withLocalePrefix('/login', locale));
    }

    if (!searchParams.session_id) {
        redirect(withLocalePrefix('/parent/home', locale));
    }

    let customerName = 'Parent';
    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(searchParams.session_id);
        customerName = checkoutSession.customer_details?.name || session.user?.name || 'Parent';

        // Optionally verify payment status here if not relying solely on webhook
        // But for UX, we just show success message
    } catch (error) {
        console.error('Error retrieving session', error);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>

                <p className="text-gray-600">
                    Thank you, {customerName}. Your enrollment has been processed. You will receive a confirmation email shortly.
                </p>

                <div className="pt-4 space-y-3">
                    <Button className="w-full bg-brand-primary text-black hover:bg-yellow-400" asChild>
                        <Link href={withLocalePrefix('/parent/home', locale)}>
                            Go to Dashboard
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-full" asChild>
                        <Link href={withLocalePrefix('/parent/invoices', locale)}>
                            View Invoice
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
