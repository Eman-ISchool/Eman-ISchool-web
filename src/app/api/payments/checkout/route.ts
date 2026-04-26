import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    try {
        const body = await req.json();
        const { checkouts } = body; // Array of { enrollmentId, courseId, studentId }

        if (!checkouts || !Array.isArray(checkouts) || checkouts.length === 0) {
            return NextResponse.json({ error: 'Invalid checkout data' }, { status: 400 });
        }

        // Generate idempotency key from enrollment IDs to prevent duplicate charges
        const enrollmentIds = checkouts.map(c => c.enrollmentId).sort().join(',');
        const idempotencyKey = createHash('sha256')
            .update(`${user.id}-${enrollmentIds}`)
            .digest('hex');

        // Fetch course details for pricing
        const courseIds = checkouts.map(c => c.courseId);
        const { data: courses } = await supabaseAdmin
            .from('courses')
            .select('id, title, price, image_url')
            .in('id', courseIds);

        const courseMap = new Map(courses?.map(c => [c.id, c]) || []);

        // Fetch parent's existing children to determine sibling count
        const { count: existingSiblingCount } = await supabaseAdmin
            .from('parent_student')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', user.id);
        
        const lineItems = [];
        const metadata: any = {
            parentId: user.id,
            enrollmentIds: checkouts.map(c => c.enrollmentId).join(','),
        };

        // Track child index for progressive discounts
        let childIndex = existingSiblingCount || 0;

        for (const item of checkouts) {
            const course = courseMap.get(item.courseId);
            if (!course) continue;
            
            // Calculate Discount based on child index (1st child: 0%, 2nd: 10%, 3rd+: 15%)
            childIndex++;
            let discountPercent = 0;
            if (childIndex === 2) discountPercent = 10;
            if (childIndex >= 3) discountPercent = 15;

            const originalPrice = course.price;
            const discountAmount = (originalPrice * discountPercent) / 100;
            const finalPrice = originalPrice - discountAmount;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${course.title} ${discountPercent > 0 ? `(${discountPercent}% Sibling Discount)` : ''}`,
                        images: course.image_url ? [course.image_url] : [],
                        metadata: {
                            courseId: course.id,
                            studentId: item.studentId,
                            enrollmentId: item.enrollmentId,
                            originalPrice: originalPrice,
                            discountPercent: discountPercent
                        }
                    },
                    unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
                },
                quantity: 1,
            });

            // Discount applies to each enrollment based on total children count
        }

        // Create Checkout Session with idempotency key
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/parent/payments/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/parent/courses?canceled=true`,
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: metadata,
        }, {
            idempotencyKey, // Prevent duplicate charges on retries
        });

        return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
