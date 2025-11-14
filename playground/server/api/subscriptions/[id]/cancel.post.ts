import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { immediately = false } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Subscription ID is required'
        })
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        let subscription: Stripe.Subscription
        
        if (immediately) {
            // Cancel immediately
            subscription = await stripe.subscriptions.cancel(id)
        } else {
            // Cancel at period end
            subscription = await stripe.subscriptions.update(id, {
                cancel_at_period_end: true
            })
        }
        
        return subscription
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to cancel subscription'
        })
    }
})

