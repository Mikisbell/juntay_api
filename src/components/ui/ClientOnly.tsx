'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnlyProps {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * ClientOnly - Wrapper that ONLY renders children after client-side hydration
 * 
 * Purpose: Prevents hydration mismatch for components that use:
 * - window/document APIs
 * - viewport detection (useIsMobile)
 * - cookies/localStorage
 * - Date/locale formatting
 * 
 * The children are not rendered at all during SSR, only the fallback (if provided)
 * is rendered. After useEffect runs (client-only), children are rendered.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
