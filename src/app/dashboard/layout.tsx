"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { MarketTicker } from "@/components/dashboard/MarketTicker"
import { CommandMenu } from "@/components/dashboard/CommandMenu"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { PrintProvider } from "@/components/printing/PrintProvider"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

import { DashboardHeader } from "@/components/layout/DashboardHeader"

export default function DashboardLayout({
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
