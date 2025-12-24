'use client'

import { QueryClient, QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState, useEffect, Suspense, lazy } from 'react'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'
import ConsoleFix from '@/components/ui/console-fix'

// 🚀 PERFORMANCE: Lazy load RxDB para evitar cargar 3000+ módulos en arranque inicial
const LazyRxDBProvider = lazy(() =>
    import('@/components/providers/RxDBProvider').then(mod => ({ default: mod.RxDBProvider }))
)

// 🚀 PERFORMANCE: Lazy load DevTools solo en desarrollo (Code Splitting)
const ReactQueryDevtools = lazy(() =>
    import('@tanstack/react-query-devtools').then(d => ({
        default: d.ReactQueryDevtools,
    }))
)

// Feature flag para habilitar/deshabilitar RxDB en desarrollo
const ENABLE_RXDB = process.env.NEXT_PUBLIC_ENABLE_RXDB !== 'false'

// Wrapper que carga RxDB solo cuando es necesario
function ConditionalRxDBProvider({ children }: { children: React.ReactNode }) {
    const [shouldLoadRxDB, setShouldLoadRxDB] = useState(false)

    useEffect(() => {
        // Solo cargar RxDB si:
        // 1. Está habilitado via env
        // 2. Estamos en una ruta que lo necesita (POS, pagos offline)
        if (ENABLE_RXDB) {
            const offlineRoutes = ['/dashboard/caja', '/dashboard/pagos', '/dashboard/pos']
            const isOfflineRoute = offlineRoutes.some(route =>
                window.location.pathname.startsWith(route)
            )

            // Cargar si estamos offline O en una ruta que lo necesita
            if (!navigator.onLine || isOfflineRoute) {
                setShouldLoadRxDB(true)
            }

            // También cargar si el usuario se desconecta
            const handleOffline = () => setShouldLoadRxDB(true)
            window.addEventListener('offline', handleOffline)

            return () => window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!shouldLoadRxDB) {
        // Sin RxDB - modo normal online
        return <>{children}</>
    }

    return (
        <Suspense fallback={<>{children}</>}>
            <LazyRxDBProvider>
                {children}
            </LazyRxDBProvider>
        </Suspense>
    )
}

export function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient inside component to ensure one instance per request
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache data for 5 minutes before considering it stale
                staleTime: 5 * 60 * 1000,
                // Keep unused data in cache for 30 minutes (gcTime in v5)
                gcTime: 30 * 60 * 1000,
                // Refetch on window focus (good UX for dashboard apps)
                refetchOnWindowFocus: true,
                // Retry failed requests twice with exponential backoff
                retry: 2,
                retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
                // Show cached data while refetching
                refetchOnMount: 'always',
                // Network mode: always fetch when online, use cache when offline
                networkMode: 'offlineFirst',
            },
            mutations: {
                retry: 1,
                networkMode: 'offlineFirst',
            },
        },
    }))

    // Prevent hydration mismatch for DevTools
    const [mounted, setMounted] = useState(false)

    // Handle app visibility changes for mobile (when app goes to background)
    useEffect(() => {
        setMounted(true)

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                focusManager.setFocused(true)
            } else {
                focusManager.setFocused(false)
            }
        }

        // Handle online/offline status
        const handleOnline = () => onlineManager.setOnline(true)
        const handleOffline = () => onlineManager.setOnline(false)

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <ConsoleFix />
                <ConditionalRxDBProvider>
                    <PrintProvider>
                        <TooltipProvider>
                            {children}
                            {/* Indicador de conexión flotante - solo en dashboard */}
                            <div className="fixed bottom-4 right-4 z-50">
                                <ConnectionStatus />
                            </div>
                        </TooltipProvider>
                    </PrintProvider>
                    <Toaster />
                    {/* DevTools only in development - after mount to prevent hydration mismatch */}
                    {mounted && process.env.NODE_ENV === 'development' && (
                        <Suspense fallback={null}>
                            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                        </Suspense>
                    )}
                </ConditionalRxDBProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

