"use client"

import React from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

/**
 * Test 5: + useKeyboardShortcuts (complete - same as DashboardShell)
 */
export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
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
