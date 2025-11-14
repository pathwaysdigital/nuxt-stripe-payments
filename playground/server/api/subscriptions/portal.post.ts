import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { customerId, returnUrl } = body

    if (!customerId) {
        throw createError({
            statusCode: 400,
            message: 'customerId is required'
        })
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${getRequestURL(event).origin}/account`
        })
        
        return {
            url: session.url
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to create portal session'
        })
    }
})

