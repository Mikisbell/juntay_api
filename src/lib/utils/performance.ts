/**
 * Performance utilities for debouncing and throttling
 * Used to optimize user input handling and reduce unnecessary API calls
 */

/**
 * Debounce function - delays execution until after wait time has elapsed since last call
 * Perfect for search inputs, auto-save, etc.
 * 
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle function - ensures function is called at most once per specified time
 * Perfect for scroll handlers, resize events, etc.
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => {
                inThrottle = false
            }, limit)
        }
    }
}

/**
 * Simple sleep utility for testing/demos
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
    name: string,
    fn: () => T | Promise<T>
): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
    return result
}
