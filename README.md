# Nuxt Stripe Payments

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Lightweight Stripe payment integration for Nuxt 3 with support for all payment methods including Apple Pay, Google Pay, SEPA, EPS, and more.

## Features

✅ **Zero Dependencies** - Loads Stripe.js dynamically, no heavy dependencies  
✅ **All Payment Methods** - Cards, Apple Pay, Google Pay, SEPA, EPS, Revolut Pay, etc.  
✅ **Subscriptions** - Full support for Stripe subscriptions with Checkout Sessions  
✅ **Subscription Management** - Cancel, update, resume, and manage subscriptions easily  
✅ **TypeScript Support** - Full type safety out of the box  
✅ **Auto-configured** - Works with Nuxt's auto-imports  
✅ **Customizable** - Full control over appearance and behavior  
✅ **SSR Compatible** - Works with Nuxt's server-side rendering  

## Quick Setup

1. Add `nuxt-stripe-payments` dependency to your project

```bash
npm install nuxt-stripe-payments stripe
# or
yarn add nuxt-stripe-payments stripe
# or
pnpm add nuxt-stripe-payments stripe
```

2. Add `nuxt-stripe-payments` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-stripe-payments'
  ],
  
  stripePayments: {
    // Set your default Stripe publishable key
    publishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // or hardcode for development: publishableKey: 'pk_test_xxxxx',
    defaultCurrency: 'eur',
    apiEndpoint: '/api/create-payment-intent'
  }
})
```

3. Add your Stripe keys to `.env`:

```env
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

4. Create a backend endpoint for payment intents

Create `server/api/create-payment-intent.post.ts`:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const { amount, currency, metadata } = await readBody(event)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'always'
        },
        metadata: metadata || {}  // e.g. { orderNumber: '12345', customerId: 'cus_abc' }
    })
    
    return {
        clientSecret: paymentIntent.client_secret
    }
})
```

That's it! You can now use the `StripePayment` component in your application ✨

## Usage

### Basic Example

```vue
<template>
  <div>
    <!-- Uses publishableKey from nuxt.config.ts -->
    <StripePayment
      :amount="1099"
      @success="handleSuccess"
      @error="handleError"
    />
  </div>
</template>

<script setup>
const handleSuccess = (paymentIntent) => {
  console.log('Payment successful!', paymentIntent)
  navigateTo('/success')
}

const handleError = (error) => {
  console.error('Payment failed:', error)
}
</script>
```

### Advanced Example with Overrides

```vue
<template>
  <StripePayment
    :amount="2499"
    currency="usd"
    api-endpoint="/api/custom-payment"
    return-url="https://yourdomain.com/complete"
    button-text="Subscribe Now"
    button-class="custom-btn"
    :appearance="stripeAppearance"
    :metadata="paymentMetadata"
    @success="handleSuccess"
    @error="handleError"
    @ready="handleReady"
  />
</template>

<script setup>
const stripeAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de'
  }
}

const paymentMetadata = {
  orderNumber: '12345',
  customerId: 'cus_abc123',
  source: 'web'
}
</script>
```

### Using Different Keys per Component

```vue
<template>
  <StripePayment
    publishable-key="pk_test_different_account_xxx"
    :amount="1099"
    @success="handleSuccess"
  />
</template>
```

### Programmatic Submit

```vue
<template>
  <div>
    <StripePayment
      ref="paymentRef"
      :amount="1099"
      hide-button
      @success="handleSuccess"
    />
    
    <button @click="submitPayment">
      Pay Now
    </button>
  </div>
</template>

<script setup>
const paymentRef = ref(null)

const submitPayment = () => {
  paymentRef.value?.submit()
}
</script>
```

## Subscriptions

The module includes full support for Stripe subscriptions using Checkout Sessions. Subscriptions redirect users to Stripe's hosted checkout page for a seamless experience.

### Getting a Stripe Price ID

Before using the `StripeSubscription` component, you need to create a Price in your Stripe Dashboard. Here's how:

**Option 1: Stripe Dashboard (Recommended for beginners)**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Click **"Add product"** or select an existing product
3. Set up your pricing:
   - Choose **Recurring** for subscriptions
   - Set the billing period (monthly, yearly, etc.)
   - Set the price amount
   - Configure any additional options (trial period, metered billing, etc.)
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`) from the product page

**Option 2: Stripe API (For programmatic setup)**

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create a product first
const product = await stripe.products.create({
  name: 'Premium Plan',
  description: 'Monthly subscription to premium features'
})

// Create a price for the product
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2999, // $29.99 in cents
  currency: 'usd',
  recurring: {
    interval: 'month'
  }
})

console.log('Price ID:', price.id) // Use this in your component
```

**Option 3: Stripe CLI (For testing)**

```bash
# Create a test price
stripe prices create \
  --product prod_test123 \
  --unit-amount 2999 \
  --currency usd \
  --recurring interval=month
```

The price ID will look like: `price_1ABC123def456GHI789jkl012`

### Basic Subscription Example

```vue
<template>
  <StripeSubscription
    price-id="price_xxxxxxxxxxxxx"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup>
const handleSuccess = (session) => {
  console.log('Checkout session created:', session)
  // User will be redirected to Stripe Checkout
}

const handleError = (error) => {
  console.error('Subscription error:', error)
}
</script>
```

### Subscription with Trial Period

```vue
<template>
  <StripeSubscription
    price-id="price_xxxxxxxxxxxxx"
    :trial-period-days="14"
    customer-email="customer@example.com"
    @success="handleSuccess"
  />
</template>
```

### Multiple Prices / Add-ons

```vue
<template>
  <StripeSubscription
    :price-id="['price_basic', 'price_addon']"
    :quantity="1"
    @success="handleSuccess"
  />
</template>
```

### Subscription Management

Use the `useStripeSubscription` composable to manage subscriptions:

```vue
<template>
  <div>
    <button @click="cancelSub">Cancel Subscription</button>
    <button @click="openPortal">Manage Subscription</button>
  </div>
</template>

<script setup>
const { cancelSubscription, createPortalSession } = useStripeSubscription()
const subscriptionId = 'sub_xxxxxxxxxxxxx'
const customerId = 'cus_xxxxxxxxxxxxx'

const cancelSub = async () => {
  try {
    // Cancel at period end (recommended)
    await cancelSubscription(subscriptionId, false)
    alert('Subscription will cancel at period end')
  } catch (error) {
    console.error('Failed to cancel:', error)
  }
}

const openPortal = async () => {
  try {
    const { url } = await createPortalSession(customerId)
    window.location.href = url
  } catch (error) {
    console.error('Failed to open portal:', error)
  }
}
</script>
```

### Update Subscription

```vue
<script setup>
const { updateSubscription } = useStripeSubscription()

const upgradePlan = async () => {
  try {
    await updateSubscription('sub_xxxxxxxxxxxxx', {
      priceId: 'price_premium',
      quantity: 1
    })
    alert('Subscription updated!')
  } catch (error) {
    console.error('Failed to update:', error)
  }
}
</script>
```

### Backend Endpoints for Subscriptions

Create `server/api/create-checkout-session.post.ts`:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const {
        priceId,
        customerId,
        customerEmail,
        mode = 'subscription',
        allowPromotionCodes = false,
        trialPeriodDays,
        quantity = 1,
        metadata = {},
        successUrl,
        cancelUrl
    } = await readBody(event)
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    const lineItems = Array.isArray(priceId) 
        ? priceId.map((id: string) => ({ price: id, quantity }))
        : [{ price: priceId, quantity }]
    
    const session = await stripe.checkout.sessions.create({
        mode,
        line_items: lineItems,
        success_url: successUrl || `${getRequestURL(event).origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${getRequestURL(event).origin}/subscription-cancel`,
        allow_promotion_codes: allowPromotionCodes,
        customer: customerId,
        customer_email: customerEmail,
        subscription_data: trialPeriodDays ? {
            trial_period_days: trialPeriodDays
        } : undefined,
        metadata
    })
    
    return {
        sessionId: session.id,
        url: session.url
    }
})
```

Create `server/api/subscriptions/[id].put.ts` for updating subscriptions:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const { priceId, quantity, metadata } = await readBody(event)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    const subscription = await stripe.subscriptions.retrieve(id!)
    const subscriptionItemId = subscription.items.data[0]?.id
    
    const updated = await stripe.subscriptions.update(id!, {
        items: [{
            id: subscriptionItemId,
            price: priceId,
            quantity
        }],
        metadata: metadata || {}
    })
    
    return updated
})
```

Create `server/api/subscriptions/[id]/cancel.post.ts` for canceling:

```typescript
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const { immediately = false } = await readBody(event)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    if (immediately) {
        return await stripe.subscriptions.cancel(id!)
    } else {
        return await stripe.subscriptions.update(id!, {
            cancel_at_period_end: true
        })
    }
})
```

See the `playground/server/api` directory for complete examples of all subscription endpoints.

## Module Configuration

Configure default values in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  stripePayments: {
    // Required: Your Stripe publishable key
    publishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    
    // Optional: Default currency for all payments
    defaultCurrency: 'eur', // 'usd', 'gbp', etc.
    
    // Optional: Default API endpoint
    apiEndpoint: '/api/create-payment-intent'
  }
})
```

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `publishableKey` | `string` | `''` | Default Stripe publishable key |
| `defaultCurrency` | `string` | `'eur'` | Default currency for payments |
| `apiEndpoint` | `string` | `'/api/create-payment-intent'` | Default API endpoint for payment intents |
| `checkoutSessionEndpoint` | `string` | `'/api/create-checkout-session'` | Default API endpoint for checkout sessions (subscriptions) |
| `subscriptionEndpoint` | `string` | `'/api/subscriptions'` | Default API endpoint for subscription management |

All configuration options can be overridden per component via props.

## Component Props

### StripePayment Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `publishableKey` | `string` | from config | Stripe publishable key (overrides config) |
| `amount` | `number` | **required** | Amount in cents |
| `currency` | `string` | from config | Currency code (overrides config) |
| `apiEndpoint` | `string` | `'/api/create-payment-intent'` | Backend endpoint |
| `returnUrl` | `string` | `''` | Redirect URL after payment |
| `buttonText` | `string` | `'Pay Now'` | Submit button text |
| `submittingText` | `string` | `'Processing...'` | Loading button text |
| `loadingText` | `string` | `'Loading payment form...'` | Initial loading text |
| `buttonClass` | `string` | Default styles | Custom button CSS classes |
| `hideButton` | `boolean` | `false` | Hide built-in button |
| `appearance` | `object` | `{}` | Stripe Elements appearance |
| `metadata` | `object` | `{}` | Custom metadata to attach to the payment |

### StripeSubscription Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `priceId` | `string \| string[]` | **required** | Stripe price ID(s) for subscription |
| `customerId` | `string` | `''` | Existing Stripe customer ID |
| `customerEmail` | `string` | `''` | Customer email (creates customer if not exists) |
| `checkoutSessionEndpoint` | `string` | from config | Backend endpoint for checkout sessions |
| `successUrl` | `string` | `''` | URL to redirect after successful checkout |
| `cancelUrl` | `string` | `''` | URL to redirect if checkout is canceled |
| `buttonText` | `string` | `'Subscribe Now'` | Button text |
| `submittingText` | `string` | `'Redirecting...'` | Loading button text |
| `buttonClass` | `string` | Default styles | Custom button CSS classes |
| `hideButton` | `boolean` | `false` | Hide built-in button |
| `metadata` | `object` | `{}` | Custom metadata to attach to subscription |
| `mode` | `'subscription' \| 'setup' \| 'payment'` | `'subscription'` | Checkout session mode |
| `allowPromotionCodes` | `boolean` | `false` | Allow promotion codes in checkout |
| `trialPeriodDays` | `number` | `undefined` | Number of trial days |
| `quantity` | `number` | `1` | Subscription quantity |
| `billingAddressCollection` | `'auto' \| 'required'` | `'auto'` | Billing address collection |
| `collectShippingAddress` | `boolean` | `false` | Collect shipping address |

## Styling

### Default Styling

The component comes with clean, framework-agnostic CSS styling that works out of the box without any CSS framework:

```vue
<StripePayment :amount="1099" />
```

The default button uses vanilla CSS with a nice blue theme, hover states, and disabled states.

### Custom Button Styling

You can customize the button with your own CSS classes:

```vue
<StripePayment
  :amount="1099"
  button-class="my-custom-button"
/>
```

```css
.my-custom-button {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.my-custom-button:hover:not(:disabled) {
  opacity: 0.9;
}

.my-custom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### shadcn-vue Integration

The component automatically detects and uses [shadcn-vue](https://www.shadcn-vue.com/) Button component if it's installed in your project:

```vue
<!-- If shadcn-vue is installed, this automatically uses the shadcn Button -->
<StripePayment :amount="1099" />
```

**How it works:**
- The component tries to import `@/components/ui/button/Button.vue`
- If found, it uses the shadcn Button with `variant="default"`
- If not found, it falls back to a native HTML button with custom styling
- When using shadcn, the `buttonClass` prop is ignored to preserve shadcn's styling

**Manual shadcn setup:**

If you want to ensure shadcn-vue is being used, install it first:

```bash
npx shadcn-vue@latest init
npx shadcn-vue@latest add button
```

Then use the payment component as normal - it will automatically use your shadcn Button!

### Hiding the Default Button

If you want complete control over the button styling or layout:

```vue
<template>
  <div>
    <StripePayment
      ref="paymentRef"
      :amount="1099"
      hide-button
      @success="handleSuccess"
    />
    
    <!-- Your custom button -->
    <YourCustomButton @click="submitPayment">
      Complete Purchase
    </YourCustomButton>
  </div>
</template>

<script setup>
const paymentRef = ref(null)

const submitPayment = () => {
  paymentRef.value?.submit()
}
</script>
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@success` | `paymentIntent` | Payment succeeded |
| `@error` | `errorMessage` | Error occurred |
| `@ready` | - | Form ready for input |

## Composables

### useStripe()

Composable to load Stripe.js script dynamically:

```typescript
const { loadStripe, stripeInstance, isLoaded } = useStripe()

// Load Stripe
const stripe = await loadStripe('pk_test_xxxxx')
```

### useStripeSubscription()

Composable for managing Stripe subscriptions:

```typescript
const {
  cancelSubscription,
  updateSubscription,
  getSubscription,
  resumeSubscription,
  createPortalSession,
  listSubscriptions
} = useStripeSubscription()

// Cancel subscription
await cancelSubscription('sub_xxxxx', false) // false = cancel at period end

// Update subscription
await updateSubscription('sub_xxxxx', {
  priceId: 'price_new',
  quantity: 2
})

// Get subscription
const subscription = await getSubscription('sub_xxxxx')

// Resume canceled subscription
await resumeSubscription('sub_xxxxx')

// Open customer portal
const { url } = await createPortalSession('cus_xxxxx')
window.location.href = url

// List customer subscriptions
const { subscriptions } = await listSubscriptions('cus_xxxxx')
```

## Payment Methods Supported

The module automatically enables all Stripe payment methods:

- 💳 Credit/Debit Cards
- 🍎 Apple Pay
- 🤖 Google Pay
- 🏦 SEPA Direct Debit
- 🇦🇹 EPS (Austria)
- 🇩🇪 Giropay (Germany)
- 💶 Sofort
- 💜 Revolut Pay
- And many more...

## Testing

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Requires 3DS**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run tests
npm run test

# Release new version
npm run release
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-stripe-payments/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-stripe-payments

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-stripe-payments.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-stripe-payments

[license-src]: https://img.shields.io/npm/l/nuxt-stripe-payments.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-stripe-payments

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
