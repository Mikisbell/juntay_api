'use client'

import { useEffect, useState } from 'react'
import {
    Smartphone,
    RefreshCw,
    Calendar,
    DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { obtenerPagosDigitalesHoy } from '@/lib/actions/pagos-digitales-actions'
import { cn } from '@/lib/utils'

/**
 * Panel de Conciliación de Pagos Digitales
 */
export function ConciliacionPagosDigitalesPanel() {
    const [data, setData] = useState<{
        pagos: {
            id: string
            monto: number
            metodo: string
            referencia: string | null
            hora: string
            codigoCredito: string
        }[]
        totalYape: number
        totalPlin: number
        totalTransferencia: number
    } | null>(null)
    const [loading, setLoading] = useState(true)

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const resultado = await obtenerPagosDigitalesHoy()
            setData(resultado)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    const getMetodoColor = (metodo: string) => {
        switch (metodo) {
            case 'yape': return 'bg-purple-100 text-purple-700'
            case 'plin': return 'bg-green-100 text-green-700'
            case 'transferencia': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    const total = (data?.totalYape || 0) + (data?.totalPlin || 0) + (data?.totalTransferencia || 0)

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Pagos Digitales Hoy
                        {data?.pagos.length ? (
                            <Badge variant="secondary">{data.pagos.length}</Badge>
                        ) : null}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={cargarDatos}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Totales por método */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <div className="text-xs text-purple-600 mb-1">Yape</div>
                        <div className="font-bold text-purple-700">
                            {formatMonto(data?.totalYape || 0)}
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-xs text-green-600 mb-1">Plin</div>
                        <div className="font-bold text-green-700">
                            {formatMonto(data?.totalPlin || 0)}
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <div className="text-xs text-blue-600 mb-1">Transfer.</div>
                        <div className="font-bold text-blue-700">
                            {formatMonto(data?.totalTransferencia || 0)}
                        </div>
                    </div>
                </div>

                {/* Total general */}
                <div className="p-3 bg-muted rounded-lg flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Total Digitales</span>
                    </div>
                    <span className="text-xl font-bold">{formatMonto(total)}</span>
                </div>

                {/* Lista de pagos */}
                {!data?.pagos.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay pagos digitales hoy</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {data.pagos.map((pago) => (
                            <div
                                key={pago.id}
                                className="p-2 border rounded-lg flex items-center gap-3"
                            >
                                <Badge className={cn('text-xs', getMetodoColor(pago.metodo))}>
                                    {pago.metodo.toUpperCase()}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium">{pago.codigoCredito}</div>
                                    {pago.referencia && (
                                        <div className="text-xs text-muted-foreground truncate">
                                            Ref: {pago.referencia}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{formatMonto(pago.monto)}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {pago.hora}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Verifica estos montos con tu app Yape/Plin
                </p>
            </CardContent>
        </Card>
    )
}
