"use client"

/**
 * DashboardShell - Contains all hydration-sensitive components
 * 
 * This component is dynamically imported with ssr: false in layout.tsx
 * to prevent hydration mismatch from viewport/cookie detection
 */

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface DashboardShellProps {
    children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    // Activar atajos de teclado globales
    useKeyboardShortcuts()

    return (
        <PrintProvider>
            <SidebarProvider>
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
