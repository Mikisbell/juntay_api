"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    LayoutDashboard,
    Monitor, // "Ventanilla"
    Users,
    Package,
    PieChart,
    Settings,
    ChevronRight,
    LogOut,
    ChevronUp,
    Gem, // "Juntay Icon"
    Gavel, // Remates
    Landmark, // Banco
    Building2, // Empresas
    CreditCard, // Billing
    Bell, // Alertas
    FileText, // Audit
    Activity, // Health
    Shield // Compliance
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ============================================================================
// NUEVA ARQUITECTURA: JERARQUÍA BASADA EN ROLES
// ============================================================================

const SECTIONS = [
    {
        id: "principal",
        label: "Principal",
        items: [
            {
                title: "Visión General",
                url: "/dashboard",
                icon: LayoutDashboard,
            }
        ]
    },
    {
        id: "front_office",
        label: "FRONT OFFICE (Operativa)",
        items: [
            {
                title: "Ventanilla", // Antes "Terminal de Caja"
                url: "/dashboard/caja",
                icon: Monitor,
                desc: "Caja y Operaciones Rápidas"
            },
            {
                title: "Clientes",
                url: "/dashboard/clientes",
                icon: Users,
            }
        ]
    },
    {
        id: "middle_office",
        label: "MIDDLE OFFICE (Negocio)",
        items: [
            {
                title: "Inventario (Garantías)",
                url: "/dashboard/inventario",
                icon: Package,
            },
            {
                title: "Remates",
                url: "/dashboard/remates",
                icon: Gavel,
                desc: "Catálogo de artículos a rematar"
            }
        ]
    },
    {
        id: "back_office",
        label: "BACK OFFICE (Sistema)",
        items: [
            {
                title: "Reportes",
                url: "/dashboard/reportes",
                icon: PieChart,
            },
            {
                title: "Banco",
                url: "/dashboard/banco",
                icon: Landmark,
                desc: "Conciliación bancaria"
            },
            {
                title: "Admin",
                url: "/dashboard/admin",
                icon: Settings,
                items: [
                    { title: "Analytics de Uso", url: "/dashboard/sysadmin/analytics" },
                    { title: "Centro de Monitoreo", url: "/dashboard/admin/monitoreo" },
                    { title: "Tesorería Central", url: "/dashboard/admin/tesoreria" },
                    { title: "Sucursales", url: "/dashboard/admin/sucursales" },
                    { title: "Socios e Inversores", url: "/dashboard/admin/inversionistas" },
                    { title: "Empleados", url: "/dashboard/admin/empleados" },
                    { title: "Configuración", url: "/dashboard/admin/configuracion" },
                    { title: "WhatsApp Business", url: "/dashboard/whatsapp" },
                    { title: "App Cobradores", url: "/cobrador" }
                ]
            }
        ]
    }
]

// ============================================================================

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = React.useState<{ email: string; nombre: string } | null>(null)
    const [rol, setRol] = React.useState<string | null>(null)

    // Obtener usuario al montar
    React.useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('nombres, apellido_paterno, rol')
                    .eq('id', authUser.id)
                    .single()

                setRol((userData as { rol: string } | null)?.rol || null)

                setUser({
                    email: authUser.email || '',
                    nombre: ((userData as { nombres: string } | null)?.nombres) || authUser.email?.split('@')[0] || 'Usuario'
                })
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (url: string) => {
        if (url === '/dashboard') return pathname === '/dashboard'
        return pathname.startsWith(url)
    }

    // Helper para renderizar items (Recursivo si fuera necesario, aqui solo 2 niveles)
    interface SidebarItem {
        title: string
        url?: string
        icon?: React.ElementType
        items?: SidebarItem[]
        badge?: string
        desc?: string
    }

    const renderMenuItem = (item: SidebarItem) => {
        const isGroupActive = item.items?.some((sub: SidebarItem) => isActive(sub.url || '')) || (item.url && isActive(item.url))

        // --- ITEM CON SUBMENÚ (Accordion) ---
        if (item.items) {
            return (
                <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={isGroupActive}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={item.title}
                                className={`h-9 w-full justify-between transition-all duration-200 group-data-[state=open]/collapsible:font-semibold ${isGroupActive
                                    ? 'text-slate-900 dark:text-white font-medium'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className={`h-4 w-4 ${isGroupActive ? 'text-blue-600' : 'text-slate-500'}`} />
                                    <span>{item.title}</span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-50" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub className="border-l border-slate-200/60 ml-5 pl-0 space-y-0.5 my-1">
                                {item.items?.map((subItem: SidebarItem) => {
                                    const isSubActive = isActive(subItem.url || '')
                                    return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton
                                                asChild
                                                className={`h-8 pl-4 pr-2 transition-colors relative flex items-center justify-between ${isSubActive
                                                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/10'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                            >
                                                <Link href={subItem.url}>
                                                    <span>{subItem.title}</span>
                                                    {subItem.badge && (
                                                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSubActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {subItem.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    )
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            )
        }

        // --- ITEM SIMPLE ---
        const active = isActive(item.url)
        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                    className={`h-9 transition-all duration-200 group relative overflow-hidden ${active
                        ? 'bg-slate-900 dark:bg-blue-600 text-white font-medium shadow-md shadow-slate-900/10 dark:shadow-blue-900/20 hover:bg-slate-800 dark:hover:bg-blue-500' // PRO ACTIVE STATE
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50' // PRO HOVER
                        }`}
                >
                    <Link href={item.url}>
                        <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? 'text-white' : 'text-slate-500 group-hover:scale-110 group-hover:text-slate-700'
                            }`} />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && (
                            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                                {item.badge}
                            </span>
                        )}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300">
            <SidebarHeader className="border-b border-transparent px-4 py-4 pt-6">
                <div className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-lg ring-1 ring-white/50 group-hover:scale-105 transition-transform duration-300">
                        <Gem className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white leading-none font-display">
                            JUNTAY
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-1.5">
                            Casa de Empeño
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-4 px-3 py-4">
                {/* SAAS SUPER ADMIN SECTION */}
                {rol === 'SUPER_ADMIN' && (
                    <SidebarGroup className="p-0">
                        <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-indigo-500/80 mb-2">
                            🔐 Super Admin
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1.5">
                                {renderMenuItem({
                                    title: "Control Panel",
                                    icon: Shield,
                                    items: [
                                        { title: "Empresas", url: "/dashboard/sysadmin/empresas" },
                                        { title: "Billing Center", url: "/dashboard/sysadmin/billing" },
                                        { title: "Alertas", url: "/dashboard/sysadmin/alertas", badge: "!" },
                                        { title: "Audit Logs", url: "/dashboard/sysadmin/audit" },
                                        { title: "Health", url: "/dashboard/sysadmin/health" },
                                        { title: "Analytics", url: "/dashboard/sysadmin/analytics" }
                                    ]
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {SECTIONS.map((section) => (
                    <SidebarGroup key={section.id} className="p-0">
                        {section.label !== 'Principal' && (
                            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-2">
                                {section.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1.5">
                                {section.items.map(renderMenuItem)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-100 dark:border-slate-800 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-12 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 group">
                                    <Avatar className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105">
                                        <AvatarImage src="#" alt={user?.nombre} />
                                        <AvatarFallback className="rounded-lg bg-slate-900 text-white font-bold">
                                            {user?.nombre?.slice(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col gap-0.5 overflow-hidden ml-2 group-data-[collapsible=icon]:hidden text-left transition-opacity">
                                        <span className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                                            {user?.nombre || 'Usuario'}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                            {user?.email || 'Conectando...'}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-950">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/admin/configuracion" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Configuración</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
