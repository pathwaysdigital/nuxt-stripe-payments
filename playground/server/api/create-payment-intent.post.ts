import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const amount = body?.amount || 1099
    const currency = body?.currency || 'eur'

    try {
        // In production, use environment variable
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'always'
            },
        })
        
        return {
            clientSecret: paymentIntent.client_secret
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to create payment intent'
        })
    }
})
