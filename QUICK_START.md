# Quick Setup Guide

## 1. Install

```bash
npm install nuxt-stripe-payments stripe
```

## 2. Configure nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-stripe-payments'],
  
  stripePayments: {
    publishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    defaultCurrency: 'eur'
  }
})
```

## 3. Add .env

```env
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

## 4. Create API endpoint

`server/api/create-payment-intent.post.ts`:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const { amount, currency } = await readBody(event)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'always'
        }
    })
    
    return { clientSecret: paymentIntent.client_secret }
})
```

## 5. Use in any component

```vue
<template>
  <StripePayment
    :amount="1099"
    @success="handleSuccess"
  />
</template>

<script setup>
const handleSuccess = (paymentIntent) => {
  console.log('Payment successful!', paymentIntent)
}
</script>
```

That's it! 🎉

## Subscriptions

### 1. Create Checkout Session Endpoint

`server/api/create-checkout-session.post.ts`:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const { priceId, customerEmail, trialPeriodDays } = await readBody(event)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${getRequestURL(event).origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getRequestURL(event).origin}/subscription-cancel`,
        customer_email: customerEmail,
        subscription_data: trialPeriodDays ? {
            trial_period_days: trialPeriodDays
        } : undefined
    })
    
    return { sessionId: session.id, url: session.url }
})
```

### 2. Use Subscription Component

```vue
<template>
  <StripeSubscription
    price-id="price_xxxxxxxxxxxxx"
    customer-email="user@example.com"
    :trial-period-days="14"
    @success="handleSuccess"
  />
</template>

<script setup>
const handleSuccess = (session) => {
  console.log('Redirecting to checkout...', session)
}
</script>
```

### 3. Manage Subscriptions

```vue
<script setup>
const { cancelSubscription, createPortalSession } = useStripeSubscription()

// Cancel at period end
await cancelSubscription('sub_xxxxx', false)

// Open customer portal
const { url } = await createPortalSession('cus_xxxxx')
window.location.href = url
</script>
```

See the README for complete subscription documentation! 🚀
