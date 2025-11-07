# Nuxt Stripe Payments

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Lightweight Stripe payment integration for Nuxt 3 with support for all payment methods including Apple Pay, Google Pay, SEPA, EPS, and more.

## Features

✅ **Zero Dependencies** - Loads Stripe.js dynamically, no heavy dependencies  
✅ **All Payment Methods** - Cards, Apple Pay, Google Pay, SEPA, EPS, Revolut Pay, etc.  
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
| `apiEndpoint` | `string` | `'/api/create-payment-intent'` | Default API endpoint |

All configuration options can be overridden per component via props.

## Component Props

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

## Composable

You can also use the `useStripe()` composable directly:

```typescript
const { loadStripe, stripeInstance, isLoaded } = useStripe()

// Load Stripe
const stripe = await loadStripe('pk_test_xxxxx')
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
