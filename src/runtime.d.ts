import type { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    stripePayments?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    stripePayments?: ModuleOptions
  }
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    stripePayments?: {
      publishableKey: string
      defaultCurrency: string
      apiEndpoint: string
      checkoutSessionEndpoint: string
      subscriptionEndpoint: string
    }
  }
}

export { ModuleOptions }
