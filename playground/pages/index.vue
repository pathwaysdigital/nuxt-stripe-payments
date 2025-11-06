<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold mb-2">Stripe Payment Test</h1>
            <p class="text-gray-600 mb-6">Using config from nuxt.config.ts</p>
            
            <!-- No need to pass publishableKey - it uses the config from nuxt.config.ts -->
            <StripePayment
                :amount="1099"
                @success="handleSuccess"
                @error="handleError"
                @ready="handleReady"
            />
            
            <div v-if="successMessage" class="mt-4 p-4 bg-green-100 text-green-800 rounded">
                {{ successMessage }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const successMessage = ref('')

const handleSuccess = (paymentIntent: any) => {
    console.log('Payment successful!', paymentIntent)
    successMessage.value = `Payment successful! ID: ${paymentIntent.id}`
}

const handleError = (error: string) => {
    console.error('Payment error:', error)
}

const handleReady = () => {
    console.log('Payment form is ready')
}
</script>

<style>
body {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
}
</style>
