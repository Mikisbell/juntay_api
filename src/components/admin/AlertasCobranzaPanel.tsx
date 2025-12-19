'use client'

import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    AlertCircle,
    Info,
    Bell,
    RefreshCw,
    TrendingDown,
    FileX,
    Clock,
    Percent
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    obtenerAlertasCobranza,
    type AlertasResumen,
    type AlertaCobranza,
    type AlertaSeveridad,
    type AlertaTipo
} from '@/lib/actions/alertas-cobranza-actions'
import { cn } from '@/lib/utils'

/**
 * Panel de Alertas de Cobranza - Admin
 */
export function AlertasCobranzaPanel() {
    const [data, setData] = useState<AlertasResumen | null>(null)
    const [loading, setLoading] = useState(true)

    const cargarAlertas = async () => {
        setLoading(true)
        try {
            const alertas = await obtenerAlertasCobranza()
            setData(alertas)
        } catch (err) {
            console.error('Error cargando alertas:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarAlertas()
        const interval = setInterval(cargarAlertas, 2 * 60 * 1000) // Refresh cada 2 min
        return () => clearInterval(interval)
    }, [])

    const getSeveridadColor = (severidad: AlertaSeveridad) => {
        switch (severidad) {
            case 'critica': return 'bg-red-500 text-white'
            case 'alta': return 'bg-orange-500 text-white'
            case 'media': return 'bg-yellow-500 text-black'
            case 'baja': return 'bg-blue-500 text-white'
        }
    }

    const getSeveridadIcon = (severidad: AlertaSeveridad) => {
        switch (severidad) {
            case 'critica': return <AlertTriangle className="h-4 w-4" />
            case 'alta': return <AlertCircle className="h-4 w-4" />
            case 'media': return <Info className="h-4 w-4" />
            case 'baja': return <Bell className="h-4 w-4" />
        }
    }

    const getTipoIcon = (tipo: AlertaTipo) => {
        switch (tipo) {
            case 'mora': return <Percent className="h-4 w-4" />
            case 'recibos': return <FileX className="h-4 w-4" />
            case 'recaudacion': return <TrendingDown className="h-4 w-4" />
            case 'vencimientos': return <Clock className="h-4 w-4" />
        }
    }

    if (loading && !data) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    if (!data) return null

    const totalAlertas = data.alertas.length
    const hayAlertas = totalAlertas > 0

    return (
        <Card className={cn(
            data.contadores.critica > 0 && 'border-red-300',
            data.contadores.alta > 0 && data.contadores.critica === 0 && 'border-orange-300'
        )}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className={cn(
                            'h-5 w-5',
                            data.contadores.critica > 0 ? 'text-red-500' :
                                data.contadores.alta > 0 ? 'text-orange-500' : 'text-muted-foreground'
                        )} />
                        Alertas de Cobranza
                        {hayAlertas && (
                            <Badge variant="destructive">{totalAlertas}</Badge>
                        )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={cargarAlertas} disabled={loading}>
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>
                </div>

                {/* Contadores por severidad */}
                {hayAlertas && (
                    <div className="flex gap-2 mt-2">
                        {data.contadores.critica > 0 && (
                            <Badge className="bg-red-500">{data.contadores.critica} Crítica</Badge>
                        )}
                        {data.contadores.alta > 0 && (
                            <Badge className="bg-orange-500">{data.contadores.alta} Alta</Badge>
                        )}
                        {data.contadores.media > 0 && (
                            <Badge className="bg-yellow-500 text-black">{data.contadores.media} Media</Badge>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {!hayAlertas ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium text-green-600">Sin alertas activas</p>
                        <p className="text-sm">Todos los indicadores están en rango normal</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.alertas.map((alerta: AlertaCobranza) => (
                            <div
                                key={alerta.id}
                                className={cn(
                                    'p-3 rounded-lg border flex items-start gap-3',
                                    alerta.severidad === 'critica' && 'bg-red-50 border-red-200',
                                    alerta.severidad === 'alta' && 'bg-orange-50 border-orange-200',
                                    alerta.severidad === 'media' && 'bg-yellow-50 border-yellow-200'
                                )}
                            >
                                <div className={cn(
                                    'p-2 rounded-full',
                                    getSeveridadColor(alerta.severidad)
                                )}>
                                    {getTipoIcon(alerta.tipo)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{alerta.titulo}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {getSeveridadIcon(alerta.severidad)}
                                            <span className="ml-1 capitalize">{alerta.severidad}</span>
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {alerta.descripcion}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Valor: {alerta.valor.toFixed(1)} | Umbral: {alerta.umbral}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-right mt-4">
                    Última verificación: {new Date(data.ultimaActualizacion).toLocaleString('es-PE')}
                </p>
            </CardContent>
        </Card>
    )
}
