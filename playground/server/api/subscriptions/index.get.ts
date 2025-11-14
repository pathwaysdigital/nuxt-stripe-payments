import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const customerId = query.customerId as string

    if (!customerId) {
        throw createError({
            statusCode: 400,
            message: 'customerId is required'
        })
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 100
        })
        
        return {
            subscriptions: subscriptions.data
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to list subscriptions'
        })
    }
})

