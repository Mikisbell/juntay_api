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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <PrintProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <DynamicBreadcrumb />
                        <div className="ml-auto flex items-center gap-4">
                            <CommandMenu />
                            <MarketTicker />
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </PrintProvider>
    )
}
