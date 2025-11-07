<template>
    <div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading-message">{{ loadingText }}</div>
        
        <div ref="paymentEl"></div>
        
        <component 
            :is="ButtonComponent"
            v-if="!hideButton"
            @click="handleSubmit" 
            :class="isShadcnButton ? undefined : buttonClass"
            :disabled="loading || isSubmitting || !canSubmit"
            variant="default"
        >
            {{ isSubmitting ? submittingText : buttonText }}
        </component>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef, type Component } from 'vue'
import { useRuntimeConfig } from '#app'
import { $fetch } from 'ofetch'
import { useStripe } from '../composables/useStripe'

// Dynamically check for shadcn-vue Button component
const ButtonComponent = shallowRef<Component | string>('button')
const isShadcnButton = ref(false)

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
    buttonClass: 'stripe-payment-button',
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
        // Try to load shadcn-vue Button component if available
        try {
            // Use dynamic import with a variable to prevent build-time resolution
            const componentPath = '@/components/ui/button/Button.vue'
            const shadcnButton = await import(/* @vite-ignore */ componentPath).catch(() => null)
            if (shadcnButton?.default) {
                ButtonComponent.value = shadcnButton.default
                isShadcnButton.value = true
            }
        } catch {
            // Fallback to native button element
        }

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
        
        // Listen for ready event
        paymentElement.on('ready', () => {
            canSubmit.value = true
        })
        
        // Listen for changes to enable/disable submit button
        paymentElement.on('change', (event: any) => {
            if (event.complete) {
                canSubmit.value = true
            }
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

<style scoped>
.error-message {
    color: #dc2626;
    margin-bottom: 1rem;
}

.loading-message {
    color: #6b7280;
    margin-bottom: 1rem;
}

.stripe-payment-button {
    margin-top: 1rem;
    width: 100%;
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
}

.stripe-payment-button:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.stripe-payment-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
}
</style>
