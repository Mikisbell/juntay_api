'use client'

import { QueryClient, QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, Suspense, lazy } from 'react'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

// 🚀 PERFORMANCE: Lazy load RxDB para evitar cargar 3000+ módulos en arranque inicial
// RxDB solo se carga cuando:
// 1. El usuario está offline
// 2. El usuario accede a features que requieren offline-first (POS)
const LazyRxDBProvider = lazy(() =>
    import('@/components/providers/RxDBProvider').then(mod => ({ default: mod.RxDBProvider }))
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

    // Handle app visibility changes for mobile (when app goes to background)
    useEffect(() => {
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
        <QueryClientProvider client={queryClient}>
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
                {/* DevTools only in development */}
                {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </ConditionalRxDBProvider>
        </QueryClientProvider>
    )
}
