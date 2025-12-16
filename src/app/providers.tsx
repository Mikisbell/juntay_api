'use client'

import { QueryClient, QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect } from 'react'
import { RxDBProvider } from '@/components/providers/RxDBProvider'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

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
            <RxDBProvider>
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
            </RxDBProvider>
        </QueryClientProvider>
    )
}

