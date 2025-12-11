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
    UserPlus
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
                    nombre: userData?.nombres || authUser.email?.split('@')[0] || 'Usuario'
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
        const active = item.url ? isActive(item.url) : false

        if (item.items) {
            const isSubActive = item.items.some((sub) => isActive(sub.url))
            return (
                <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={isSubActive}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={item.title}
                                className={`h-10 ${isSubActive ? 'bg-primary/10 text-primary' : ''}`}
                            >
                                <item.icon className={`h-5 w-5 transition-colors ${isSubActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary'}`} />
                                <span className="font-medium">{item.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.items.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            className={`h-9 ${isActive(subItem.url) ? 'bg-primary/10 text-primary font-medium' : ''}`}
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
                    className={`h-10 ${active ? 'bg-primary/10 text-primary' : ''}`}
                >
                    <Link href={item.url!}>
                        <item.icon className={`h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary'}`} />
                        <span className="font-medium">{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-sidebar-accent/10">
                <div className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:justify-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg">
                        <Image
                            src="/logo.png"
                            alt="Juntay Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-bold tracking-wide text-sidebar-foreground">JUNTAY</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Financial System</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                <SidebarGroup className="py-2">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.main.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 py-2">
                    <div className="h-[1px] bg-sidebar-border/60" />
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Terminal Operativa
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.terminal.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Gestión de Activos
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.portfolio.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Operaciones Especiales
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.operations.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                        Administración
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.admin.map(renderMenuItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2 bg-sidebar-accent/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-14 px-3 hover:bg-sidebar-accent/20">
                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-white shadow-sm">
                                        <User className="h-4 w-4 text-primary" />
                                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-semibold truncate text-sidebar-foreground">
                                            {user?.nombre || 'Cargando...'}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {user?.email || ''}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user?.nombre}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/admin/configuracion" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configuración
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
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
