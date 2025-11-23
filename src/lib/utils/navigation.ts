/**
 * Navigation utility with View Transitions API support
 * Provides smooth page transitions similar to Vercel/Linear
 */

export function smoothNavigate(url: string) {
    // Check if View Transitions API is supported
    if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => {
            window.location.href = url
        })
    } else {
        // Fallback for unsupported browsers
        window.location.href = url
    }
}

/**
 * React hook for smooth navigation
 * Usage: const navigate = useSmoothNavigate()
 *        navigate('/dashboard')
 */
export function useSmoothNavigate() {
    return (url: string) => smoothNavigate(url)
}

/**
 * Prefetch a page for instant navigation
 * Call this on hover to preload the page
 */
export function prefetchPage(url: string) {
    // Create a link element to trigger Next.js prefetch
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)

    // Clean up after 5 seconds
    setTimeout(() => link.remove(), 5000)
}
