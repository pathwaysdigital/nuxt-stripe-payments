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
