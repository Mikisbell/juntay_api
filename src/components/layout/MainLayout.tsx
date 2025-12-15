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

export function MainLayout({
    children,
    defaultOpen
}: MainLayoutProps) {
    // Activar atajos de teclado globales
    useKeyboardShortcuts()

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
