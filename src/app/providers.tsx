'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient inside component to ensure one instance per request
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache data for 5 minutes before considering it stale
                staleTime: 5 * 60 * 1000,
                // Keep unused data in cache for 10 minutes (gcTime in v5)
                gcTime: 10 * 60 * 1000,
                // Refetch on window focus (good UX for dashboard apps)
                refetchOnWindowFocus: true,
                // Retry failed requests once
                retry: 1,
                // Show cached data while refetching
                refetchOnMount: 'always',
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <PrintProvider>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </PrintProvider>
            <Toaster />
            {/* DevTools only in development */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
