'use client'

import { useEffect, useState } from 'react'
import {
    DollarSign,
    Calculator,
    TrendingUp,
    History,
    RefreshCw,
    Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    obtenerPreValoracion,
    registrarTasacion,
    obtenerHistorialTasaciones,
    type EstadoArticulo,
    type Tasacion
} from '@/lib/actions/garantias-mejoradas-actions'
import { EstadoArticuloSelector } from './EstadoArticuloBadge'
import { cn } from '@/lib/utils'

interface TasacionPanelProps {
    articuloId: string
    categoria: string
    estadoActual: EstadoArticulo
    usuarioId: string
    usuarioNombre: string
    onTasacionRegistrada?: (tasacion: Tasacion) => void
}

/**
 * Panel de Tasación con Pre-valoración
 */
export function TasacionPanel({
    articuloId,
    categoria,
    estadoActual,
    usuarioId,
    usuarioNombre,
    onTasacionRegistrada
}: TasacionPanelProps) {
    const [estado, setEstado] = useState<EstadoArticulo>(estadoActual)
    const [preValoracion, setPreValoracion] = useState<{
        valorSugerido: number
        rangoMin: number
        rangoMax: number
        factorEstado: number
    } | null>(null)
    const [historial, setHistorial] = useState<Tasacion[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [valorEstimado, setValorEstimado] = useState('')
    const [valorOtorgado, setValorOtorgado] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const [pre, hist] = await Promise.all([
                    obtenerPreValoracion(categoria, estado),
                    obtenerHistorialTasaciones(articuloId)
                ])
                setPreValoracion(pre)
                setHistorial(hist)
                setValorEstimado(pre.valorSugerido.toString())
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [articuloId, categoria, estado])

    const handleGuardar = async () => {
        if (!valorEstimado || !valorOtorgado) {
            toast.error('Ingresa los valores')
            return
        }

        setGuardando(true)
        try {
            const result = await registrarTasacion({
                articuloId,
                valorEstimado: parseFloat(valorEstimado),
                valorOtorgado: parseFloat(valorOtorgado),
                tasadorId: usuarioId,
                tasadorNombre: usuarioNombre,
                observaciones: observaciones || undefined
            })

            if (result.success) {
                toast.success('Tasación registrada')
                setMostrarFormulario(false)
                setObservaciones('')
                // Recargar historial
                const hist = await obtenerHistorialTasaciones(articuloId)
                setHistorial(hist)
                onTasacionRegistrada?.(hist[hist.length - 1])
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error guardando tasación')
        } finally {
            setGuardando(false)
        }
    }

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-5 w-5" />
                    Tasación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selector de estado */}
                <EstadoArticuloSelector value={estado} onChange={setEstado} />

                {/* Pre-valoración */}
                {preValoracion && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Pre-valoración Sugerida
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                            {formatMonto(preValoracion.valorSugerido)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                            Rango: {formatMonto(preValoracion.rangoMin)} - {formatMonto(preValoracion.rangoMax)}
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                            Factor estado: {(preValoracion.factorEstado * 100).toFixed(0)}%
                        </Badge>
                    </div>
                )}

                {/* Formulario de tasación */}
                {mostrarFormulario ? (
                    <div className="space-y-3 p-3 border rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="valorEstimado">Valor Estimado</Label>
                                <Input
                                    id="valorEstimado"
                                    type="number"
                                    value={valorEstimado}
                                    onChange={(e) => setValorEstimado(e.target.value)}
                                    placeholder="S/"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="valorOtorgado">Valor a Otorgar</Label>
                                <Input
                                    id="valorOtorgado"
                                    type="number"
                                    value={valorOtorgado}
                                    onChange={(e) => setValorOtorgado(e.target.value)}
                                    placeholder="S/"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="obs">Observaciones</Label>
                            <Input
                                id="obs"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Opcional"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleGuardar} disabled={guardando}>
                                {guardando ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <DollarSign className="h-4 w-4 mr-2" />
                                )}
                                Registrar
                            </Button>
                            <Button variant="ghost" onClick={() => setMostrarFormulario(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => setMostrarFormulario(true)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Tasación
                    </Button>
                )}

                {/* Historial */}
                {historial.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historial ({historial.length})
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {historial.slice().reverse().map((t) => (
                                <div key={t.id} className="p-2 border rounded text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {new Date(t.fecha).toLocaleDateString('es-PE')}
                                        </span>
                                        <span className="font-bold">{formatMonto(t.valorOtorgado)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        por {t.tasadorNombre}
                                    </div>
                                    {t.observaciones && (
                                        <div className={cn('text-xs mt-1')}>
                                            {t.observaciones}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
