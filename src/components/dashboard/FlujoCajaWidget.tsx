'use client'

import { useEffect, useState } from 'react'
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    obtenerFlujoCaja,
    obtenerFlujoCajaSemanal,
    type FlujoCajaDiario
} from '@/lib/actions/dashboard-gerencial-actions'
import { cn } from '@/lib/utils'

/**
 * Widget de Flujo de Caja
 */
export function FlujoCajaWidget() {
    const [data, setData] = useState<FlujoCajaDiario[]>([])
    const [loading, setLoading] = useState(true)
    const [vista, setVista] = useState<'diario' | 'semanal'>('diario')
    const [resumenSemanal, setResumenSemanal] = useState<{
        semanas: { semana: number; inicio: string; fin: string; ingresos: number; egresos: number; neto: number }[]
        totalIngresos: number
        totalEgresos: number
    } | null>(null)

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const [diario, semanal] = await Promise.all([
                obtenerFlujoCaja(7),
                obtenerFlujoCajaSemanal()
            ])
            setData(diario)
            setResumenSemanal(semanal)
        } catch (err) {
            console.error('Error cargando flujo:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha + 'T00:00:00')
        return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        )
    }

    const totalIngresos = data.reduce((s, d) => s + d.ingresos, 0)
    const totalEgresos = data.reduce((s, d) => s + d.egresos, 0)
    const neto = totalIngresos - totalEgresos
    const maxValor = Math.max(...data.map(d => Math.max(d.ingresos, d.egresos)), 1)

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Flujo de Caja
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant={vista === 'diario' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setVista('diario')}
                        >
                            7 días
                        </Button>
                        <Button
                            variant={vista === 'semanal' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setVista('semanal')}
                        >
                            4 sem
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cargarDatos}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <TrendingUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
                        <div className="text-lg font-bold text-green-600">{formatMonto(totalIngresos)}</div>
                        <div className="text-xs text-muted-foreground">Ingresos</div>
                    </div>
                    <div className="text-center">
                        <TrendingDown className="h-4 w-4 mx-auto text-red-500 mb-1" />
                        <div className="text-lg font-bold text-red-600">{formatMonto(totalEgresos)}</div>
                        <div className="text-xs text-muted-foreground">Egresos</div>
                    </div>
                    <div className="text-center">
                        <div className={cn(
                            'text-lg font-bold',
                            neto >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {formatMonto(neto)}
                        </div>
                        <div className="text-xs text-muted-foreground">Neto</div>
                    </div>
                </div>

                {/* Gráfico de barras simple */}
                {vista === 'diario' && (
                    <div className="flex items-end gap-1 h-32">
                        {data.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-0.5" style={{ height: '100px' }}>
                                    <div
                                        className="flex-1 bg-green-400 rounded-t"
                                        style={{
                                            height: `${(d.ingresos / maxValor) * 100}%`,
                                            marginTop: 'auto'
                                        }}
                                        title={`Ingresos: ${formatMonto(d.ingresos)}`}
                                    />
                                    <div
                                        className="flex-1 bg-red-400 rounded-t"
                                        style={{
                                            height: `${(d.egresos / maxValor) * 100}%`,
                                            marginTop: 'auto'
                                        }}
                                        title={`Egresos: ${formatMonto(d.egresos)}`}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {formatFecha(d.fecha)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {vista === 'semanal' && resumenSemanal && (
                    <div className="space-y-2">
                        {resumenSemanal.semanas.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 border rounded">
                                <span className="text-sm font-medium w-16">Sem {s.semana}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-green-600">+{formatMonto(s.ingresos)}</span>
                                        <span className="text-red-600">-{formatMonto(s.egresos)}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded overflow-hidden flex">
                                        <div
                                            className="bg-green-400"
                                            style={{
                                                width: `${(s.ingresos / (s.ingresos + s.egresos || 1)) * 100}%`
                                            }}
                                        />
                                        <div
                                            className="bg-red-400"
                                            style={{
                                                width: `${(s.egresos / (s.ingresos + s.egresos || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className={cn(
                                    'text-sm font-bold w-24 text-right',
                                    s.neto >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {formatMonto(s.neto)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-400 rounded" /> Ingresos
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-400 rounded" /> Egresos
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
