import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Subscription ID is required'
        })
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        const subscription = await stripe.subscriptions.retrieve(id)
        
        return subscription
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to retrieve subscription'
        })
    }
})

