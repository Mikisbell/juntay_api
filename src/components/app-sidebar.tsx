"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    LayoutDashboard,
    PlusCircle,
    FileText,
    Banknote,
    Wallet,
    Package,
    PieChart,
    Settings,
    ChevronRight,
    Landmark,
    Users,
    RefreshCw,
    Gavel,
    AlertCircle,
    MessageSquare,
    LogOut,
    User,
    ChevronUp,
    UserPlus,
    Sparkles
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
    operations: [
        {
            title: "Renovaciones",
            url: "/dashboard/renovaciones",
            icon: RefreshCw,
        },
        {
            title: "Remates",
            url: "/dashboard/remates",
            icon: Gavel,
        },
        {
            title: "Gestión de Vencimientos",
            url: "/dashboard/vencimientos",
            icon: AlertCircle,
        },
    ],
    admin: [
        {
            title: "Tesorería",
            url: "/dashboard/admin/tesoreria",
            icon: Landmark,
        },
        {
            title: "Empleados",
            url: "/dashboard/admin/empleados",
            icon: UserPlus,
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
            title: "WhatsApp Business",
            url: "/dashboard/whatsapp",
            icon: MessageSquare,
        },
        {
            title: "Configuración",
            url: "/dashboard/admin/configuracion",
            icon: Settings,
        },
    ],
}

type MenuItem = {
    title: string
    url?: string
    icon: React.ComponentType<{ className?: string }>
    items?: { title: string; url: string }[]
}

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = React.useState<{ email: string; nombre: string } | null>(null)

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

                setUser({
                    email: authUser.email || '',
                    nombre: ((userData as any)?.nombres) || authUser.email?.split('@')[0] || 'Usuario'
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

    const renderMenuItem = (item: MenuItem) => {
        if (item.title === 'Terminal de Caja' || item.title === 'Nuevo Crédito') {
            // Special Highlight for Critical Operations
            const active = item.url ? isActive(item.url) : false
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`h-11 transition-all duration-300 relative overflow-hidden group/btn ${active
                            ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20'
                            : 'hover:bg-blue-50 text-slate-700 hover:text-blue-600'}`}
                    >
                        <Link href={item.url!}>
                            {active && <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50"></div>}
                            <item.icon className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )
        }

        const active = item.url ? isActive(item.url) : false

        if (item.items) {
            const isSubActive = item.items.some((sub) => isActive(sub.url))
            return (
                <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={isSubActive}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={item.title}
                                className={`h-10 transition-all duration-300 ${isSubActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold border-l-2 border-blue-500 pl-3'
                                    : 'hover:bg-slate-100 hover:pl-3 border-l-2 border-transparent pl-2 text-slate-600 hover:text-slate-900'}`}
                            >
                                <item.icon className={`h-4 w-4 transition-colors ${isSubActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-50" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub className="border-l border-slate-200 ml-3.5 pl-2">
                                {item.items.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={`h-9 transition-colors ${isActive(subItem.url) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Link href={subItem.url}>
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            )
        }

        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-10 transition-all duration-300 ${active
                        ? 'bg-blue-50 text-blue-600 font-semibold border-l-2 border-blue-500 pl-3'
                        : 'hover:bg-slate-100 hover:pl-3 border-l-2 border-transparent pl-2 text-slate-600 hover:text-slate-900'}`}
                >
                    <Link href={item.url!}>
                        <item.icon className={`h-4 w-4 transition-colors ${active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white transition-all duration-300">
            <SidebarHeader className="border-b border-slate-200 px-6 py-5 bg-slate-50">
                <div className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-md border border-slate-200 transition-all">
                        <div className="absolute inset-0 bg-blue-500/5"></div>
                        <Image
                            src="/logo.png"
                            alt="Antigravity Logo"
                            width={40}
                            height={40}
                            className="object-contain relative z-10 p-1 drop-shadow-lg"
                        />
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                            ANTIGRAVITY
                            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                        </span>
                        <span className="text-[10px] font-medium text-blue-600 uppercase tracking-[0.2em] pl-0.5">Agent Manager</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0 py-2">
                <SidebarGroup className="py-2">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {menuItems.main.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-3">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                        Terminal Operativa
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuItems.terminal.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                        Gestión de Activos
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuItems.portfolio.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                        Operaciones Especiales
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuItems.operations.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                        Administración
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuItems.admin.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 p-2 bg-slate-50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-14 px-3 hover:bg-slate-100 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md ring-2 ring-white/10">
                                        <User className="h-4 w-4 text-white" />
                                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-semibold truncate text-slate-800">
                                            {user?.nombre || 'Iniciando...'}
                                        </span>
                                        <span className="text-xs text-slate-500 truncate">
                                            {user?.email || ''}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-slate-500 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-60 p-2 bg-white border-slate-200 text-slate-700">
                                <DropdownMenuLabel className="font-normal p-2 mb-2 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium text-slate-800">{user?.nombre}</p>
                                        <p className="text-xs text-slate-500">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-slate-100 focus:text-slate-900">
                                    <Link href="/dashboard/admin/configuracion" className="flex items-center">
                                        <Settings className="mr-2 h-4 w-4 text-slate-400" />
                                        Configuración
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-200" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer rounded-md"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
