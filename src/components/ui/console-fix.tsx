'use client'

import { useEffect } from 'react'

export default function ConsoleFix() {
    useEffect(() => {
        const originalError = console.error
        const originalWarn = console.warn

        console.error = (...args) => {
            // Suppress "Unable to add filesystem" (Emscripten/Wasm polyfill issue)
            if (args[0]?.toString().includes('Unable to add filesystem')) return

            originalError.apply(console, args)
        }

        console.warn = (...args) => {
            // Suppress "Multiple GoTrueClient instances" (Benign dev warning)
            if (args[0]?.toString().includes('Multiple GoTrueClient instances')) return
            // Suppress "Sin sesión" RxDB dev warning
            if (args[0]?.toString().includes('[RxDB] Sin sesión')) return

            originalWarn.apply(console, args)
        }

    }, [])

    return null
}
