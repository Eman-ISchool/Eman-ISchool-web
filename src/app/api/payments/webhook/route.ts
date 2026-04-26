import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
// This is your Stripe CLI webhook secret for testing your endpoint locally.
// In production, update this with real secret.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 401 });
    }

    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;
    const requestId = crypto.randomUUID();

    // Log incoming webhook for security auditing
    console.log(`[${requestId}] Received Stripe webhook`, {
        signature: signature ? 'present' : 'missing',
        bodyLength: body.length,
        timestamp: new Date().toISOString()
    });

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        
        // Additional security: Validate event timestamp to prevent replay attacks
        // Stripe events should be processed within 5 minutes of creation
        // Allow 60 seconds of clock skew tolerance
        const eventTimestamp = event.created;
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDiff = currentTime - eventTimestamp;
        const MAX_AGE_SECONDS = 300; // 5 minutes
        const CLOCK_SKEW_TOLERANCE = 60; // 1 minute tolerance
        
        if (timeDiff > MAX_AGE_SECONDS + CLOCK_SKEW_TOLERANCE) {
            console.warn(`[${requestId}] Event timestamp too old: ${timeDiff}s ago`, {
                eventId: event.id,
                eventType: event.type,
                eventCreated: new Date(eventTimestamp * 1000).toISOString()
            });
            return NextResponse.json({ error: 'Event too old' }, { status: 400 });
        }
        
        console.log(`[${requestId}] Webhook signature verified`, {
            eventId: event.id,
            eventType: event.type
        });
    } catch (err: any) {
        console.error(`[${requestId}] Webhook signature verification failed`, {
            error: err.message,
            signature: signature ? 'present' : 'missing',
            bodyLength: body.length
        });
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCompleted(session);
        } else if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await handlePaymentIntentSucceeded(paymentIntent);
        } else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment failed: ${paymentIntent.id}`);
            // Handle failed payment (e.g., notify user)
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook: ${err.message}`);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const parentId = session.metadata?.parentId;
    const enrollmentIds = session.metadata?.enrollmentIds?.split(',') || [];

    if (!parentId || enrollmentIds.length === 0) {
        console.error('Missing metadata in checkout session', {
            sessionId: session.id,
            metadata: session.metadata,
            parentId,
            enrollmentIds
        });
        // Return error to Stripe for potential retry
        throw new Error('Invalid metadata: parentId and enrollmentIds are required');
    }

    // Idempotency check: Verify this session hasn't been processed already
    const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('stripe_checkout_session_id', session.id)
        .single();

    if (existingPayment) {
        console.log(`Session ${session.id} already processed, skipping`);
        return;
    }

    // 1. Create Invoice Record
    const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert({
            parent_id: parentId,
            stripe_invoice_id: session.invoice as string || session.id, // Use session ID if not subscription
            status: 'paid',
            invoice_number: (await supabaseAdmin.rpc('generate_invoice_number')) || `INV-${Date.now()}`,
            subtotal: (session.amount_subtotal || 0) / 100,
            total: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            paid_at: new Date().toISOString(),
            pdf_url: null // Can be updated if Stripe generates one
        })
        .select()
        .single();

    if (invoiceError) throw invoiceError;

    // 2. Create Payment Record
    const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
            invoice_id: invoice.id,
            parent_id: parentId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            status: 'succeeded',
            payment_method: 'card', // Simplified
        })
        .select()
        .single();

    if (paymentError) throw paymentError;

    // 3. Update Enrollments to 'active' status
    const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({ status: 'active' })
        .in('id', enrollmentIds);

    if (updateError) {
        // Compensation: Clean up payment and invoice if enrollment update fails
        console.error('Failed to update enrollments, cleaning up payment and invoice:', updateError);
        await supabaseAdmin.from('payments').delete().eq('id', payment.id);
        await supabaseAdmin.from('invoices').delete().eq('id', invoice.id);
        throw updateError;
    }

    // 4. Send notification to parent about successful payment
    await createNotification(
        parentId,
        'payment',
        'Payment Successful',
        `Your payment of ${(session.amount_total || 0) / 100} ${session.currency || 'USD'} has been processed successfully.`
    );
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const parentId = paymentIntent.metadata?.parentId;
    const enrollmentIds = paymentIntent.metadata?.enrollmentIds?.split(',') || [];

    if (!parentId || enrollmentIds.length === 0) {
        console.error('Missing metadata in payment intent', {
            paymentIntentId: paymentIntent.id,
            metadata: paymentIntent.metadata,
            parentId,
            enrollmentIds
        });
        // Return error to Stripe for potential retry
        throw new Error('Invalid metadata: parentId and enrollmentIds are required');
    }

    // Idempotency check: Verify this payment intent hasn't been processed already
    const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

    if (existingPayment) {
        console.log(`Payment intent ${paymentIntent.id} already processed, skipping`);
        return;
    }

    // 1. Update Enrollments to 'active' status
    const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({ status: 'active' })
        .in('id', enrollmentIds);

    if (updateError) {
        // Compensation: Log error and notify admins
        console.error('Failed to update enrollments for payment intent:', paymentIntent.id, updateError);
        // Note: Since there's no invoice created in this flow, we can't clean up
        // The payment will need manual review and enrollment activation
        throw updateError;
    }
    
    // 2. Fetch enrollment details to build course list
    const { data: enrollmentDetails } = await supabaseAdmin
        .from('enrollments')
        .select('id, course_id')
        .in('id', enrollmentIds);
    
    // Fetch course details
    const courseIds = enrollmentDetails?.map(e => e.course_id) || [];
    const { data: courses } = await supabaseAdmin
        .from('courses')
        .select('id, title')
        .in('id', courseIds);
    
    const courseMap = new Map(courses?.map(c => [c.id, c]) || []);
    
    // 3. Send notification to parent with course list
    const courseList = enrollmentDetails
        .map(e => courseMap.get(e.course_id)?.title)
        .filter(Boolean)
        .join(', ');
    
    await createNotification(
        parentId,
        'payment_confirmed',
        'Payment Confirmed',
        `Your payment has been processed successfully. Activated courses: ${courseList}`
    );
}
