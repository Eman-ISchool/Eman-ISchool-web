import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY environment variable is missing, using a dummy key for build/development.');
}

const finalKey = stripeKey || 'sk_test_dummy';

export const stripe = new Stripe(finalKey, {
    apiVersion: '2023-10-16',
    typescript: true,
});
