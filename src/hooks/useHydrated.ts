'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that returns false during SSR and initial hydration,
 * then true after the component has hydrated on the client.
 * 
 * Use this to prevent hydration mismatches in components that
 * have different server/client rendering (like viewport detection).
 */
export function useHydrated() {
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    return hydrated
}
