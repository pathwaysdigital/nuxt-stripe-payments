import { defineNuxtModule, addComponent, createResolver, addImportsDir } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Default Stripe publishable key
   * Can be overridden per component
   */
  publishableKey?: string
  
  /**
   * Default currency for payments
   * @default 'eur'
   */
  defaultCurrency?: string
  
  /**
   * Default API endpoint for creating payment intents
   * @default '/api/create-payment-intent'
   */
  apiEndpoint?: string
  
  /**
   * Default API endpoint for creating checkout sessions (subscriptions)
   * @default '/api/create-checkout-session'
   */
  checkoutSessionEndpoint?: string
  
  /**
   * Default API endpoint for managing subscriptions
   * @default '/api/subscriptions'
   */
  subscriptionEndpoint?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-stripe-payments',
    configKey: 'stripePayments',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    defaultCurrency: 'eur',
    apiEndpoint: '/api/create-payment-intent',
    checkoutSessionEndpoint: '/api/create-checkout-session',
    subscriptionEndpoint: '/api/subscriptions'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Add StripePayment component
    addComponent({
      name: 'StripePayment',
      filePath: resolver.resolve('./runtime/components/StripePayment.vue')
    })

    // Add StripeSubscription component
    addComponent({
      name: 'StripeSubscription',
      filePath: resolver.resolve('./runtime/components/StripeSubscription.vue')
    })

    // Add module options to runtime config
    nuxt.options.runtimeConfig.public.stripePayments = {
      publishableKey: options.publishableKey || '',
      defaultCurrency: options.defaultCurrency,
      apiEndpoint: options.apiEndpoint,
      checkoutSessionEndpoint: options.checkoutSessionEndpoint,
      subscriptionEndpoint: options.subscriptionEndpoint
    }
  }
})
