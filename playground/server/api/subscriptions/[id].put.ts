import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { priceId, quantity, metadata, trialEnd, cancelAtPeriodEnd } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Subscription ID is required'
        })
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        const updateParams: Stripe.SubscriptionUpdateParams = {}
        
        if (priceId) {
            // Get current subscription to find the subscription item
            const subscription = await stripe.subscriptions.retrieve(id)
            const subscriptionItemId = subscription.items.data[0]?.id
            
            if (subscriptionItemId) {
                updateParams.items = [{
                    id: subscriptionItemId,
                    price: priceId
                }]
            } else {
                throw createError({
                    statusCode: 400,
                    message: 'No subscription items found'
                })
            }
        }
        
        if (quantity !== undefined) {
            const subscription = await stripe.subscriptions.retrieve(id)
            const subscriptionItemId = subscription.items.data[0]?.id
            
            if (subscriptionItemId) {
                updateParams.items = [{
                    id: subscriptionItemId,
                    quantity
                }]
            }
        }
        
        if (metadata) {
            updateParams.metadata = metadata
        }
        
        if (trialEnd !== undefined) {
            updateParams.trial_end = trialEnd
        }
        
        if (cancelAtPeriodEnd !== undefined) {
            updateParams.cancel_at_period_end = cancelAtPeriodEnd
        }
        
        const subscription = await stripe.subscriptions.update(id, updateParams)
        
        return subscription
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to update subscription'
        })
    }
})

