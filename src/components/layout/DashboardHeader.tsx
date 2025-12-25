'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut, Wallet, Zap, Plus, Banknote, UserPlus, ClipboardList, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { obtenerEstadoCajaV2 } from '@/lib/actions/caja-actions'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardHeader() {
    const router = useRouter()
    const { isOpen: isPaletteOpen, open: _openPalette, close: closePalette } = useCommandPalette()

    // Fetch real caja status
    const { data: caja } = useQuery({
        queryKey: ['caja', 'estado'],
        queryFn: () => obtenerEstadoCajaV2(),
        refetchInterval: 30000,
        staleTime: 0
    })

    // Fetch real user data from session
    const [usuario, setUsuario] = useState({
        nombre: 'Cargando...',
        email: '',
        rol: ''
    })

    useEffect(() => {
        // Get user from localStorage auth or session
        const getUserFromSession = async () => {
            try {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Get user info - simplified to avoid type issues with complex joins
                    const { data: userData } = await supabase
                        .from('usuarios')
                        .select('rol')
                        .eq('id', user.id)
                        .single()

                    setUsuario({
                        nombre: user.email?.split('@')[0] || 'Usuario',
                        email: user.email || '',
                        rol: (userData as { rol?: string } | null)?.rol || 'US'
                    })
                }
            } catch (e) {
                console.error('Error fetching user:', e)
            }
        }
        getUserFromSession()
    }, [])

    const handleLogout = () => {
        router.push('/login')
    }

    // Quick Actions handlers
    const quickActions = [
        {
            label: 'Nuevo Empeño',
            icon: Plus,
            shortcut: 'Ctrl+N',
            action: () => router.push('/dashboard/clientes/nuevo'),
            primary: true
        },
        {
            label: 'Registrar Pago',
            icon: Banknote,
            shortcut: 'F3',
            action: () => router.push('/dashboard/pagos')
        },
        {
            label: 'Nuevo Cliente',
            icon: UserPlus,
            action: () => router.push('/dashboard/clientes/nuevo')
        },
        null, // separator
        {
            label: 'Arqueo de Caja',
            icon: Calculator,
            action: () => router.push('/dashboard/caja')
        }
    ]

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 sticky top-0 z-40 transition-colors">
            {/* Elementos de Navegación del Dashboard */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
            </div>

            {/* Zona Central / Derecha */}
            <div className="ml-auto flex items-center gap-3">

                {/* 0. Theme Toggle */}
                <ThemeToggle />

                {/* 1. Estado de Caja (Minimalista) */}
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                                {caja ? (
                                    <>
                                        <div className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-700 text-sm">
                                            S/ {(caja.saldoActual ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                                        <span className="text-sm font-medium text-slate-500">Caja Cerrada</span>
                                    </>
                                )}
                            </div>
                        </TooltipTrigger>

                        {caja && (
                            <TooltipContent side="bottom" align="end" className="p-4 w-64">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="font-semibold text-slate-900">Caja #{caja.numeroCaja}</span>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            Abierta
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Saldo Inicial:</span>
                                            <span className="font-mono">S/ {caja.saldoInicial.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Apertura:</span>
                                            <span className="font-mono">{new Date(caja.fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t mt-2">
                                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                                            <span className="text-xs font-medium text-slate-500 uppercase">Disponible</span>
                                            <span className="font-bold font-mono text-emerald-700">
                                                S/ {caja.saldoActual.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                {/* 2. ⚡ QUICK ACTIONS BUTTON (Banking-Style CTA) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                            size="sm"
                        >
                            <Zap className="h-4 w-4" />
                            <span className="hidden sm:inline">Acción Rápida</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">
                            Operaciones Frecuentes
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {quickActions.map((action, index) =>
                            action === null ? (
                                <DropdownMenuSeparator key={`sep-${index}`} />
                            ) : (
                                <DropdownMenuItem
                                    key={action.label}
                                    onClick={action.action}
                                    className={action.primary ? 'text-blue-600 font-medium' : ''}
                                >
                                    <action.icon className="mr-2 h-4 w-4" />
                                    {action.label}
                                    {action.shortcut && (
                                        <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {action.shortcut}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            )
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 3. USER MENU - Perfil y Configuración */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 hover:bg-slate-100"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium text-slate-700">{usuario.nombre}</span>
                                <span className="text-[10px] text-slate-500 uppercase">{usuario.rol}</span>
                            </div>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{usuario.nombre}</p>
                                <p className="text-xs text-slate-500">{usuario.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Saldo de Caja Personal */}
                        {caja && (
                            <>
                                <div className="px-2 py-2">
                                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                                        <Wallet className="h-4 w-4 text-emerald-600" />
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-600 font-medium">Mi Caja</p>
                                            <p className="text-sm font-bold text-emerald-700">
                                                S/ {(caja.saldoActual ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                            </>
                        )}

                        <DropdownMenuItem onClick={() => router.push('/dashboard/configuracion')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/caja')}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Mi Caja
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 4. Command Palette */}
                <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
            </div>
        </header>
    )
}

