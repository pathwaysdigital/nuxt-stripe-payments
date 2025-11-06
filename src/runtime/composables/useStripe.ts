/**
 * Composable to load Stripe.js script dynamically
 * No external dependencies - works in any Nuxt project
 */
export const useStripe = () => {
    const stripeInstance = useState<any>('stripe', () => null)
    const isLoaded = useState<boolean>('stripe-loaded', () => false)
    const isLoading = useState<boolean>('stripe-loading', () => false)

    const loadStripe = async (publishableKey: string) => {
        // Return existing instance if already loaded
        if (stripeInstance.value) {
            return stripeInstance.value
        }

        // Wait if currently loading
        if (isLoading.value) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (isLoaded.value && stripeInstance.value) {
                        clearInterval(checkInterval)
                        resolve(stripeInstance.value)
                    }
                }, 100)
            })
        }

        isLoading.value = true

        return new Promise((resolve, reject) => {
            // Check if Stripe is already in window
            if ((window as any).Stripe) {
                stripeInstance.value = (window as any).Stripe(publishableKey)
                isLoaded.value = true
                isLoading.value = false
                resolve(stripeInstance.value)
                return
            }

            // Load Stripe.js script
            const script = document.createElement('script')
            script.src = 'https://js.stripe.com/v3/'
            script.async = true
            
            script.onload = () => {
                if ((window as any).Stripe) {
                    stripeInstance.value = (window as any).Stripe(publishableKey)
                    isLoaded.value = true
                    isLoading.value = false
                    resolve(stripeInstance.value)
                } else {
                    reject(new Error('Stripe failed to load'))
                }
            }
            
            script.onerror = () => {
                isLoading.value = false
                reject(new Error('Failed to load Stripe.js'))
            }
            
            document.head.appendChild(script)
        })
    }

    return {
        loadStripe,
        stripeInstance,
        isLoaded
    }
}
