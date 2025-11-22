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

export function DashboardHeader() {
    const router = useRouter()
    const [cajaEstado, setCajaEstado] = useState({
        monto: 1540.00,
        estado: 'Cierre pendiente',
        abierta: true
    })

    // TODO: Obtener datos reales del usuario desde sesión
    const usuario = {
        nombre: 'Administrador',
        email: 'admin@juntay.com',
        rol: 'AD'
    }

    const handleLogout = () => {
        // TODO: Implementar logout
        router.push('/login')
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Izquierda: Estado de Caja */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <Wallet className="h-4 w-4 text-emerald-600" />
                        <div className="hidden sm:block">
                            <p className="text-xs text-emerald-700 font-medium">ESTADO CAJA</p>
                            <p className="text-lg font-bold text-emerald-900">
                                S/ {cajaEstado.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="sm:hidden">
                            <p className="text-sm font-bold text-emerald-900">
                                S/ {cajaEstado.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant={cajaEstado.abierta ? "default" : "secondary"}
                        className={cajaEstado.abierta ? "bg-amber-500 hover:bg-amber-600" : ""}
                    >
                        {cajaEstado.estado}
                    </Badge>
                </div>

                {/* Derecha: Usuario */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 sm:gap-3 hover:bg-slate-100 rounded-lg px-2 sm:px-3 py-2 transition-colors focus:outline-none">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {usuario.rol}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-slate-900">{usuario.nombre}</p>
                            <p className="text-xs text-slate-500">{usuario.email}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 bg-white">
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

                        <DropdownMenuItem onClick={() => router.push('/dashboard/caja')}>
                            <Wallet className="mr-2 h-4 w-4" />
                            Gestión de Caja
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
