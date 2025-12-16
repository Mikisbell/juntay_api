"use client"

import React from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

/**
 * DashboardContent - Client-only component
 * 
 * This component is dynamically imported with ssr:false in layout.tsx
 * to prevent hydration mismatches from viewport-dependent rendering
 * in the Sidebar component.
 */
export default function DashboardContent({
    children,
}: {
    children: React.ReactNode
}) {
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
