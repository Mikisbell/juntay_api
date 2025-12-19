'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CierreCajaSheet } from './CierreCajaSheet'
import { PendientesPanel } from './PendientesPanel'
import {
    Clock,
    Lightbulb,
    ArrowRight,
    Phone,
    TrendingUp,
    AlertTriangle,
    User
} from 'lucide-react'
import type { CajaCompleta } from '@/lib/actions/caja-actions'

interface Props {
    caja: CajaCompleta
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(value)
}

function TurnoTimer({ fechaApertura }: { fechaApertura: string }) {
    const [elapsed, setElapsed] = useState('--:--:--')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const updateTimer = () => {
            const start = new Date(fechaApertura).getTime()
            const now = Date.now()
            const diff = now - start

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [fechaApertura])

    if (!mounted) return <span className="font-mono">--:--:--</span>
    return <span className="font-mono">{elapsed}</span>
}

// Oportunidades will be fetched from server in the component
const defaultOportunidades = {
    renovaciones: [] as Array<{ nombre: string; dias: number }>,
    upgrades: [] as Array<{ nombre: string; prestamos: number }>,
    recuperacion: 0
}

function OportunidadesPanel() {
    const totalOportunidades =
        defaultOportunidades.renovaciones.length +
        defaultOportunidades.upgrades.length +
        (defaultOportunidades.recuperacion > 0 ? 1 : 0)

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="w-full group">
                    <div className="flex items-center justify-between p-4 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Lightbulb className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="font-medium text-amber-800">
                                {totalOportunidades} oportunidades hoy
                            </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Oportunidades del Día
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Renovaciones próximas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Phone className="h-4 w-4 text-blue-500" />
                            Renovaciones por vencer
                        </div>
                        <div className="space-y-2">
                            {defaultOportunidades.renovaciones.map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="font-medium">{r.nombre}</span>
                                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                        {r.dias === 1 ? 'Mañana' : `En ${r.dias} días`}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upgrades */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Clientes para mayor crédito
                        </div>
                        <div className="space-y-2">
                            {defaultOportunidades.upgrades.map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <span className="font-medium">{u.nombre}</span>
                                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                        {u.prestamos} préstamos OK
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recuperación */}
                    {defaultOportunidades.recuperacion > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Recuperación
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <span className="font-medium text-orange-800">
                                    {defaultOportunidades.recuperacion} clientes en mora leve
                                </span>
                                <p className="text-sm text-orange-600 mt-1">
                                    Contactar hoy puede evitar mora grave
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export function CajeroTerminal({ caja }: Props) {
    const diferencia = caja.saldoActual - caja.saldoInicial
    const isPositive = diferencia >= 0

    return (
        <div className="max-w-lg mx-auto space-y-3">
            {/* Header ultra-compacto */}
            <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-800 leading-tight">
                            Caja #{caja.numeroCaja}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {caja.usuario.nombres}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5">
                        Activa
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                        <TurnoTimer fechaApertura={caja.fechaApertura} />
                    </span>
                </div>
            </div>

            {/* Saldo - Ultra compacto */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                <CardContent className="py-4 text-center">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Saldo</p>
                    <p className="text-3xl font-bold">{formatCurrency(caja.saldoActual)}</p>
                    {diferencia !== 0 && (
                        <p className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(diferencia)}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Oportunidades - Una línea */}
            <OportunidadesPanel />

            {/* Pendientes de Desembolso */}
            <PendientesPanel cajaId={caja.id} />

            {/* Cierre - Inline con Sheet */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <span className="text-sm text-slate-600">¿Fin de turno?</span>
                <CierreCajaSheet saldoEsperado={caja.saldoActual} cajaId={caja.id} />
            </div>
        </div>
    )
}
