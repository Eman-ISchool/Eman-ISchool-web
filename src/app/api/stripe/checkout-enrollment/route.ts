import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any, // Using older version string to be safe or whatever is in node_modules, but this is standard
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { applicationId, amount, currency, title } = body;

        if (!applicationId || !amount || !currency) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Create Checkout Sessions from body params.
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: session.user?.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: title || 'School Enrollment Fee',
                            description: `Payment for Enrollment Application #${applicationId.split('-')[0]}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/enrollment/success?session_id={CHECKOUT_SESSION_ID}&application_id=${applicationId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/enrollment?step=payment&application_id=${applicationId}`,
            metadata: {
                applicationId: applicationId,
                userId: session.user?.id || '',
                type: 'enrollment_application'
            },
        });

        return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
    }
}
