"use client"

import React from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface MainLayoutProps {
    children: React.ReactNode
    defaultOpen: boolean
}

export default function MainLayout({
    children,
    defaultOpen
}: MainLayoutProps) {
    const [isClient, setIsClient] = React.useState(false)

    // Activar atajos de teclado globales
    useKeyboardShortcuts()

    React.useEffect(() => {
        setIsClient(true)
    }, [])

    // Force return null or loader during SSR and first client render to prevent hydration mismatch
    // and ensuring state is consistent
    if (!isClient) {
        return (
            <div className="flex min-h-screen w-full bg-slate-50 items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando Juntay...</div>
            </div>
        )
    }

    return (
        <PrintProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset>
                    <DashboardHeader />
                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </PrintProvider>
    )
}
