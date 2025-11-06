<template>
    <div>
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
        <div v-if="loading" class="text-gray-500 mb-4">{{ loadingText }}</div>
        
        <div ref="paymentEl"></div>
        
        <button 
            v-if="!loading && !hideButton"
            @click="handleSubmit" 
            :class="buttonClass"
            :disabled="isSubmitting || !canSubmit"
        >
            {{ isSubmitting ? submittingText : buttonText }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app'

interface Props {
    publishableKey?: string
    amount: number
    currency?: string
    apiEndpoint?: string
    returnUrl?: string
    buttonText?: string
    submittingText?: string
    loadingText?: string
    buttonClass?: string
    hideButton?: boolean
    appearance?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
    currency: '',
    apiEndpoint: '',
    returnUrl: '',
    buttonText: 'Pay Now',
    submittingText: 'Processing...',
    loadingText: 'Loading payment form...',
    buttonClass: 'mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400',
    hideButton: false,
    appearance: () => ({})
})

const emit = defineEmits(['success', 'error', 'ready'])

// Get runtime config
const runtimeConfig = useRuntimeConfig()
const moduleConfig = runtimeConfig.public.stripePayments || {}

// Use prop or fallback to module config
const publishableKey = computed(() => props.publishableKey || moduleConfig.publishableKey || '')
const currency = computed(() => props.currency || moduleConfig.defaultCurrency || 'eur')
const apiEndpoint = computed(() => props.apiEndpoint || moduleConfig.apiEndpoint || '/api/create-payment-intent')

const paymentEl = ref<HTMLElement | null>(null)
const stripe = ref<any>(null)
const elements = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const canSubmit = ref(false)

const { loadStripe } = useStripe()

const handleSubmit = async () => {
    if (!stripe.value || !elements.value || !canSubmit.value) return
    
    isSubmitting.value = true
    error.value = null
    
    try {
        const returnUrl = props.returnUrl || `${window.location.origin}/payment-success`
        
        const { error: submitError, paymentIntent } = await stripe.value.confirmPayment({
            elements: elements.value,
            confirmParams: { return_url: returnUrl },
            redirect: 'if_required'
        })
        
        if (submitError) {
            error.value = submitError.message
            emit('error', submitError.message)
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            emit('success', paymentIntent)
        }
    } catch (err: any) {
        error.value = err.message
        emit('error', err.message)
    } finally {
        isSubmitting.value = false
    }
}

// Expose submit method for external use
defineExpose({
    submit: handleSubmit,
    isReady: computed(() => canSubmit.value)
})

onMounted(async () => {
    try {
        // Validate publishable key
        if (!publishableKey.value) {
            throw new Error('Stripe publishable key is required. Set it in nuxt.config.ts or via publishableKey prop.')
        }
        
        // Load Stripe
        stripe.value = await loadStripe(publishableKey.value)
        
        // Fetch client secret from backend
        const response: any = await $fetch(apiEndpoint.value, {
            method: 'POST',
            body: { 
                amount: props.amount,
                currency: currency.value 
            }
        })
        
        if (!response.clientSecret) {
            throw new Error('No client secret returned from server')
        }
        
        // Create elements
        const elementsOptions: any = {
            clientSecret: response.clientSecret
        }
        
        if (Object.keys(props.appearance).length > 0) {
            elementsOptions.appearance = props.appearance
        }
        
        elements.value = stripe.value.elements(elementsOptions)
        
        // Create and mount payment element
        const paymentElement = elements.value.create('payment')
        
        // Listen for changes to enable submit button
        paymentElement.on('change', (event: any) => {
            canSubmit.value = event.complete
        })
        
        paymentElement.mount(paymentEl.value)
        
        loading.value = false
        emit('ready')
    } catch (err: any) {
        error.value = err.message || 'Failed to initialize payment'
        loading.value = false
        emit('error', error.value)
    }
})
</script>
