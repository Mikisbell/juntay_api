'use client'

import { useEffect, useState } from 'react'
import {
    Trophy,
    RefreshCw,
    User,
    CreditCard,
    Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
    obtenerTop10Clientes,
    type TopCliente
} from '@/lib/actions/dashboard-gerencial-actions'
import { cn } from '@/lib/utils'

/**
 * Widget Top 10 Clientes
 */
export function Top10ClientesWidget() {
    const [clientes, setClientes] = useState<TopCliente[]>([])
    const [loading, setLoading] = useState(true)

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const data = await obtenerTop10Clientes()
            setClientes(data)
        } catch (err) {
            console.error('Error cargando top clientes:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    const formatFecha = (fecha: string | null) => {
        if (!fecha) return 'N/A'
        return new Date(fecha).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short'
        })
    }

    const getMedalColor = (pos: number) => {
        switch (pos) {
            case 0: return 'text-yellow-500' // Oro
            case 1: return 'text-gray-400'   // Plata
            case 2: return 'text-amber-600'  // Bronce
            default: return 'text-muted-foreground'
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top 10 Clientes
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={cargarDatos}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {clientes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay datos de clientes</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {clientes.map((cliente, idx) => (
                            <div
                                key={cliente.id}
                                className={cn(
                                    'flex items-center gap-3 p-2 rounded-lg border',
                                    idx < 3 && 'bg-muted/50'
                                )}
                            >
                                {/* Posición */}
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                                    idx < 3 ? 'bg-primary/10' : 'bg-muted'
                                )}>
                                    {idx < 3 ? (
                                        <Trophy className={cn('h-4 w-4', getMedalColor(idx))} />
                                    ) : (
                                        <span className="text-muted-foreground">{idx + 1}</span>
                                    )}
                                </div>

                                {/* Info cliente */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{cliente.nombre}</div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            {cliente.creditos_activos} activos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatFecha(cliente.ultimo_pago)}
                                        </span>
                                    </div>
                                </div>

                                {/* Monto */}
                                <Badge variant="secondary" className="font-bold">
                                    {formatMonto(cliente.total_pagado)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Por total pagado en historial
                </p>
            </CardContent>
        </Card>
    )
}
