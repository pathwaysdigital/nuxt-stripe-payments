import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {
        priceId,
        customerId,
        customerEmail,
        mode = 'subscription',
        allowPromotionCodes = false,
        trialPeriodDays,
        quantity = 1,
        billingAddressCollection = 'auto',
        collectShippingAddress = false,
        metadata = {},
        successUrl,
        cancelUrl
    } = body

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY')
        
        // Prepare line items
        const lineItems = Array.isArray(priceId) 
            ? priceId.map((id: string) => ({ price: id, quantity }))
            : [{ price: priceId, quantity }]

        // Create checkout session
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: mode as 'subscription' | 'setup' | 'payment',
            line_items: lineItems,
            success_url: successUrl || `${getRequestURL(event).origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${getRequestURL(event).origin}/subscription-cancel`,
            allow_promotion_codes: allowPromotionCodes,
            billing_address_collection: billingAddressCollection as 'auto' | 'required',
            collect_shipping_address: collectShippingAddress,
            metadata
        }

        // Add customer if provided
        if (customerId) {
            sessionParams.customer = customerId
        } else if (customerEmail) {
            sessionParams.customer_email = customerEmail
        }

        // Add trial period if specified
        if (trialPeriodDays && mode === 'subscription') {
            const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
                trial_period_days: trialPeriodDays
            }
            sessionParams.subscription_data = subscriptionData
        }

        const session = await stripe.checkout.sessions.create(sessionParams)
        
        return {
            sessionId: session.id,
            url: session.url
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to create checkout session'
        })
    }
})

