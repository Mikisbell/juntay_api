"use client"

import * as React from "react"
import {
    LayoutDashboard,
    PlusCircle,
    FileText,
    Banknote,
    Wallet,
    Package,
    TrendingUp,
    PieChart,
    Settings,
    ChevronRight,
    Landmark,
    History,
    Users
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Estructura Bancaria: Front Office vs Back Office
const menuItems = {
    main: [
        {
            title: "Visión General",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
    ],
    terminal: [
        {
            title: "Terminal de Caja",
            url: "/dashboard/caja",
            icon: Wallet,
        },
        {
            title: "Nuevo Crédito",
            url: "/dashboard/mostrador/nuevo-empeno",
            icon: PlusCircle,
        },
        {
            title: "Cobranzas",
            url: "/dashboard/pagos",
            icon: Banknote,
        },
    ],
    portfolio: [
        {
            title: "Cartera de Contratos",
            url: "/dashboard/contratos",
            icon: FileText,
        },
        {
            title: "Directorio de Clientes",
            url: "/dashboard/clientes",
            icon: Users,
        },
        {
            title: "Bóveda de Garantías",
            url: "/dashboard/inventario",
            icon: Package,
        },
    ],
    admin: [
        {
            title: "Tesorería",
            url: "/dashboard/admin/tesoreria",
            icon: Landmark,
        },
        {
            title: "Reportes y Auditoría",
            icon: PieChart,
            items: [
                {
                    title: "Cierre Diario",
                    url: "/dashboard/reportes/caja-diaria",
                },
                {
                    title: "Análisis de Cartera",
                    url: "/dashboard/reportes/cartera",
                },
                {
                    title: "Historial de Transacciones",
                    url: "/dashboard/reportes/transacciones",
                },
            ],
        },
        {
            title: "Configuración",
            url: "/dashboard/admin/configuracion",
            icon: Settings,
        },
    ],
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-sidebar-accent/10">
                <div className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 text-primary-foreground shadow-lg shadow-primary/20">
                        <span className="text-xl font-bold">J</span>
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-bold tracking-wide text-sidebar-foreground">JUNTAY</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Financial System</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {/* Main Section */}
                <SidebarGroup className="py-2">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.main.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="h-10">
                                        <a href={item.url}>
                                            <item.icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                                            <span className="font-medium">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <div className="h-[1px] bg-sidebar-border/60" />
                </div>

                {/* Terminal Operativa */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Terminal Operativa
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.terminal.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="h-10">
                                        <a href={item.url}>
                                            <item.icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                                            <span className="font-medium">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Gestión de Cartera */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Gestión de Activos
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.portfolio.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="h-10">
                                        <a href={item.url}>
                                            <item.icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                                            <span className="font-medium">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Administración
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.admin.map((item) =>
                                item.items ? (
                                    <Collapsible key={item.title} asChild className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title} className="h-10">
                                                    <item.icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                                                    <span className="font-medium">{item.title}</span>
                                                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild className="h-9">
                                                                <a href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} className="h-10">
                                            <a href={item.url}>
                                                <item.icon className="h-5 w-5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                                                <span className="font-medium">{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar-accent/5">
                <div className="flex items-center gap-3 px-1 transition-all group-data-[collapsible=icon]:justify-center">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 border-2 border-white shadow-sm">
                        <span className="text-xs font-bold text-slate-600">AD</span>
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold truncate text-sidebar-foreground">Administrador</span>
                        <span className="text-xs text-muted-foreground truncate">Sede Principal</span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
