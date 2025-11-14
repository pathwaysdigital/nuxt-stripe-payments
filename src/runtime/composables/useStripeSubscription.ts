import { useRuntimeConfig } from '#app'
import { $fetch } from 'ofetch'

/**
 * Composable for managing Stripe subscriptions
 * Provides methods to cancel, update, and retrieve subscription information
 */
export const useStripeSubscription = () => {
    const runtimeConfig = useRuntimeConfig()
    const moduleConfig = runtimeConfig.public.stripePayments || {}
    const subscriptionEndpoint = moduleConfig.subscriptionEndpoint || '/api/subscriptions'

    /**
     * Cancel a subscription
     * @param subscriptionId - The Stripe subscription ID
     * @param immediately - If true, cancel immediately; if false, cancel at period end
     * @returns The canceled subscription object
     */
    const cancelSubscription = async (subscriptionId: string, immediately: boolean = false) => {
        try {
            const response = await $fetch(`${subscriptionEndpoint}/${subscriptionId}/cancel`, {
                method: 'POST',
                body: {
                    immediately
                }
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to cancel subscription')
        }
    }

    /**
     * Update a subscription
     * @param subscriptionId - The Stripe subscription ID
     * @param updates - Object containing updates (priceId, quantity, metadata, etc.)
     * @returns The updated subscription object
     */
    const updateSubscription = async (subscriptionId: string, updates: {
        priceId?: string
        quantity?: number
        metadata?: Record<string, any>
        trialEnd?: number
        cancelAtPeriodEnd?: boolean
    }) => {
        try {
            const response = await $fetch(`${subscriptionEndpoint}/${subscriptionId}`, {
                method: 'PUT',
                body: updates
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update subscription')
        }
    }

    /**
     * Retrieve a subscription
     * @param subscriptionId - The Stripe subscription ID
     * @returns The subscription object
     */
    const getSubscription = async (subscriptionId: string) => {
        try {
            const response = await $fetch(`${subscriptionEndpoint}/${subscriptionId}`, {
                method: 'GET'
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve subscription')
        }
    }

    /**
     * Resume a canceled subscription
     * @param subscriptionId - The Stripe subscription ID
     * @returns The resumed subscription object
     */
    const resumeSubscription = async (subscriptionId: string) => {
        try {
            const response = await $fetch(`${subscriptionEndpoint}/${subscriptionId}/resume`, {
                method: 'POST'
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to resume subscription')
        }
    }

    /**
     * Create a customer portal session for subscription management
     * @param customerId - The Stripe customer ID
     * @param returnUrl - URL to return to after portal session
     * @returns The portal session URL
     */
    const createPortalSession = async (customerId: string, returnUrl?: string) => {
        try {
            const defaultReturnUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}/account` 
                : '/account'
            
            const response = await $fetch(`${subscriptionEndpoint}/portal`, {
                method: 'POST',
                body: {
                    customerId,
                    returnUrl: returnUrl || defaultReturnUrl
                }
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create portal session')
        }
    }

    /**
     * List subscriptions for a customer
     * @param customerId - The Stripe customer ID
     * @returns Array of subscription objects
     */
    const listSubscriptions = async (customerId: string) => {
        try {
            const response = await $fetch(`${subscriptionEndpoint}`, {
                method: 'GET',
                query: {
                    customerId
                }
            })
            return response
        } catch (error: any) {
            throw new Error(error.message || 'Failed to list subscriptions')
        }
    }

    return {
        cancelSubscription,
        updateSubscription,
        getSubscription,
        resumeSubscription,
        createPortalSession,
        listSubscriptions
    }
}

