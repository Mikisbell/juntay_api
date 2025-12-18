'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut, Wallet, Zap, Plus, Banknote, UserPlus, ClipboardList, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
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
    const { isOpen: isPaletteOpen, open: openPalette, close: closePalette } = useCommandPalette()

    // Fetch real caja status
    const { data: caja } = useQuery({
        queryKey: ['caja', 'estado'],
        queryFn: () => obtenerEstadoCaja(),
        refetchInterval: 30000,
        staleTime: 0
    })

    // TODO: Obtener datos reales del usuario desde sesión
    const usuario = {
        nombre: 'Administrador',
        email: 'admin@juntay.com',
        rol: 'AD'
    }

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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 bg-white sticky top-0 z-40">
            {/* Elementos de Navegación del Dashboard */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
            </div>

            {/* Zona Central / Derecha */}
            <div className="ml-auto flex items-center gap-3">

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
                                            S/ {caja.saldoActual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
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

                {/* 3. Command Palette */}
                <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
            </div>
        </header>
    )
}

