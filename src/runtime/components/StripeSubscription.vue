<template>
    <div>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <component 
            :is="ButtonComponent"
            v-if="!hideButton"
            @click="handleCheckout" 
            :class="isShadcnButton ? undefined : buttonClass"
            :disabled="loading || isSubmitting"
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

// Dynamically check for shadcn-vue Button component
const ButtonComponent = shallowRef<Component | string>('button')
const isShadcnButton = ref(false)

interface Props {
    priceId: string | string[]
    customerId?: string
    customerEmail?: string
    checkoutSessionEndpoint?: string
    successUrl?: string
    cancelUrl?: string
    buttonText?: string
    submittingText?: string
    buttonClass?: string
    hideButton?: boolean
    metadata?: Record<string, any>
    mode?: 'subscription' | 'setup' | 'payment'
    allowPromotionCodes?: boolean
    trialPeriodDays?: number
    quantity?: number
    billingAddressCollection?: 'auto' | 'required'
    collectShippingAddress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    checkoutSessionEndpoint: '',
    successUrl: '',
    cancelUrl: '',
    buttonText: 'Subscribe Now',
    submittingText: 'Redirecting...',
    buttonClass: 'stripe-subscription-button',
    hideButton: false,
    metadata: () => ({}),
    mode: 'subscription',
    allowPromotionCodes: false,
    trialPeriodDays: undefined,
    quantity: 1,
    billingAddressCollection: 'auto',
    collectShippingAddress: false
})

const emit = defineEmits(['success', 'error', 'loading'])

// Get runtime config
const runtimeConfig = useRuntimeConfig()
const moduleConfig = runtimeConfig.public.stripePayments || {}

// Use prop or fallback to module config
const checkoutSessionEndpoint = computed(() => props.checkoutSessionEndpoint || moduleConfig.checkoutSessionEndpoint || '/api/create-checkout-session')

const loading = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)

const handleCheckout = async () => {
    if (isSubmitting.value) return
    
    isSubmitting.value = true
    error.value = null
    emit('loading', true)
    
    try {
        // Validate priceId
        if (!props.priceId || (Array.isArray(props.priceId) && props.priceId.length === 0)) {
            throw new Error('Stripe price ID is required for subscriptions.')
        }
        
        const successUrl = props.successUrl || (typeof window !== 'undefined' ? `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}` : '/subscription-success?session_id={CHECKOUT_SESSION_ID}')
        const cancelUrl = props.cancelUrl || (typeof window !== 'undefined' ? `${window.location.origin}/subscription-cancel` : '/subscription-cancel')
        
        // Create checkout session
        const response: any = await $fetch(checkoutSessionEndpoint.value, {
            method: 'POST',
            body: { 
                priceId: props.priceId,
                customerId: props.customerId,
                customerEmail: props.customerEmail,
                mode: props.mode,
                allowPromotionCodes: props.allowPromotionCodes,
                trialPeriodDays: props.trialPeriodDays,
                quantity: props.quantity,
                billingAddressCollection: props.billingAddressCollection,
                collectShippingAddress: props.collectShippingAddress,
                metadata: props.metadata,
                successUrl,
                cancelUrl
            }
        })
        
        if (!response.sessionId && !response.url) {
            throw new Error('No checkout session URL returned from server')
        }
        
        // Redirect to Stripe Checkout
        if (response.url && typeof window !== 'undefined') {
            window.location.href = response.url
        } else if (response.sessionId) {
            // If only sessionId is returned, construct the URL
            if (typeof window !== 'undefined') {
                const stripe = (window as any).Stripe
                if (stripe) {
                    // This shouldn't happen, but handle it gracefully
                    throw new Error('Checkout session URL is required')
                }
            }
        }
        
        emit('success', response)
    } catch (err: any) {
        error.value = err.message || 'Failed to create checkout session'
        emit('error', error.value)
        isSubmitting.value = false
        emit('loading', false)
    }
}

// Expose checkout method for external use
defineExpose({
    checkout: handleCheckout
})

onMounted(async () => {
    try {
        // Try to load shadcn-vue Button component if available
        try {
            const componentPath = '@/components/ui/button/Button.vue'
            const shadcnButton = await import(/* @vite-ignore */ componentPath).catch(() => null)
            if (shadcnButton?.default) {
                ButtonComponent.value = shadcnButton.default
                isShadcnButton.value = true
            }
        } catch {
            // Fallback to native button element
        }
    } catch (err: any) {
        // Silently fail - component will still work with native button
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

.stripe-subscription-button {
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

.stripe-subscription-button:hover:not(:disabled) {
    background-color: #1d4ed8;
}

.stripe-subscription-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
}
</style>

