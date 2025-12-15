'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, User, Settings, LogOut, Wallet } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { CommandMenu } from "@/components/dashboard/CommandMenu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardHeader() {
    const router = useRouter()

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

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 bg-white sticky top-0 z-40">
            {/* Elementos de Navegación del Dashboard */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
            </div>

            {/* Zona Central / Derecha */}
            <div className="ml-auto flex items-center gap-4">

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

                {/* 2. Herramientas y Menú */}
                <CommandMenu />

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 hover:bg-slate-100 rounded-lg px-2 sm:px-3 py-2 transition-colors focus:outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-sm">
                            {usuario.rol}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-slate-900">{usuario.nombre}</p>
                            <p className="text-xs text-slate-500">{usuario.email}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-2 md:hidden">
                            <p className="text-sm font-semibold text-slate-900">{usuario.nombre}</p>
                            <p className="text-xs text-slate-500">{usuario.email}</p>
                        </div>
                        <DropdownMenuSeparator className="md:hidden" />

                        <DropdownMenuItem onClick={() => router.push('/dashboard/perfil')}>
                            <User className="mr-2 h-4 w-4" />
                            Mi Perfil
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push('/dashboard/configuracion')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
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
            </div>
        </header>
    )
}
