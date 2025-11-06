export default defineNuxtConfig({
  modules: ['../src/module'],
  
  stripePayments: {
    // Set your default Stripe publishable key here
    publishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SQ2lHDsSip5SFzNFJJ9tFtVCfyV9LmXFyvmc9NxTNXVw1Whu6bU4O9stglCSvCfCsceFF24DyomtMsN9eWRXPEt00DrqO60zz',
    defaultCurrency: 'eur',
    apiEndpoint: '/api/create-payment-intent'
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-04-12'
})
