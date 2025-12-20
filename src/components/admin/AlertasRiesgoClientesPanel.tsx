'use client'

import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    RefreshCw,
    Phone,
    ChevronRight,
    Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    obtenerClientesRiesgosos,
    type AlertaRiesgo
} from '@/lib/actions/scoring-cliente-actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * Panel de Alertas de Clientes Riesgosos
 */
export function AlertasRiesgoClientesPanel() {
    const [alertas, setAlertas] = useState<AlertaRiesgo[]>([])
    const [loading, setLoading] = useState(true)

    const cargarAlertas = async () => {
        setLoading(true)
        try {
            const data = await obtenerClientesRiesgosos()
            setAlertas(data)
        } catch (err) {
            console.error('Error cargando alertas:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarAlertas()
    }, [])

    const getUrgenciaConfig = (urgencia: 'alta' | 'media' | 'baja') => {
        switch (urgencia) {
            case 'alta':
                return {
                    color: 'bg-red-100 text-red-700 border-red-300',
                    badge: 'destructive'
                }
            case 'media':
                return {
                    color: 'bg-orange-100 text-orange-700 border-orange-300',
                    badge: 'secondary'
                }
            case 'baja':
                return {
                    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                    badge: 'outline'
                }
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Clientes Riesgosos
                        {alertas.length > 0 && (
                            <Badge variant="destructive">{alertas.length}</Badge>
                        )}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={cargarAlertas}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {alertas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay clientes riesgosos activos</p>
                        <p className="text-sm">¡Buen estado de cartera!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alertas.map((alerta) => {
                            const config = getUrgenciaConfig(alerta.urgencia)
                            return (
                                <div
                                    key={alerta.clienteId}
                                    className={cn(
                                        'p-3 border rounded-lg transition-colors',
                                        config.color
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">
                                                    {alerta.clienteNombre}
                                                </span>
                                                <Badge
                                                    variant={config.badge as 'destructive' | 'secondary' | 'outline'}
                                                    className="text-xs"
                                                >
                                                    {alerta.puntaje} pts
                                                </Badge>
                                            </div>
                                            <div className="text-sm opacity-80">
                                                {alerta.razon}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/dashboard/clientes/${alerta.clienteId}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Clientes con puntaje menor a 50 puntos
                </p>
            </CardContent>
        </Card>
    )
}
