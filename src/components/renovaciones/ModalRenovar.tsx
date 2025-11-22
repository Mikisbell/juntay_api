'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { renovarContrato } from '@/lib/actions/renovaciones-actions'
import { ContratoParaPago } from '@/lib/actions/pagos-actions'
import { Calendar, RefreshCw } from 'lucide-react'

const opcionesPlazo = [
    { dias: 7, label: '7 días' },
    { dias: 15, label: '15 días' },
    { dias: 30, label: '30 días' },
    { dias: 60, label: '60 días' },
]

export function ModalRenovar({
    contrato,
    cajaId,
    onSuccess
}: {
    contrato: ContratoParaPago
    cajaId: string
    onSuccess: () => void
}) {
    const [diasSeleccionados, setDiasSeleccionados] = useState(30)
    const [loading, setLoading] = useState(false)

    const handleRenovar = async () => {
        if (!confirm(`¿Renovar por ${diasSeleccionados} días pagando S/ ${contrato.interes_acumulado.toFixed(2)}?`)) {
            return
        }

        setLoading(true)
        try {
            const result = await renovarContrato({
                creditoId: contrato.id,
                diasExtra: diasSeleccionados,
                cajaOperativaId: cajaId
            })

            if (result.success) {
                alert(`¡Contrato renovado hasta ${result.nuevaFecha}!`)
                onSuccess()
            } else {
                alert(result.error || 'Error al renovar')
            }
        } catch (error) {
            console.error(error)
            alert('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    const calcularNuevaFecha = () => {
        const fecha = new Date(contrato.fecha_vencimiento)
        fecha.setDate(fecha.getDate() + diasSeleccionados)
        return fecha.toLocaleDateString('es-PE')
    }

    return (
        <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Renovación de Contrato
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                {/* Información del Contrato */}
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <Label className="text-slate-500">Contrato</Label>
                            <p className="font-bold">{contrato.codigo}</p>
                        </div>
                        <div>
                            <Label className="text-slate-500">Vence</Label>
                            <p className="font-bold">{new Date(contrato.fecha_vencimiento).toLocaleDateString('es-PE')}</p>
                        </div>
                        <div>
                            <Label className="text-slate-500">Interés Acumulado</Label>
                            <p className="font-bold text-blue-600">S/ {contrato.interes_acumulado.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Selección de Plazo */}
                <div>
                    <Label>Seleccione el Plazo de Extensión</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        {opcionesPlazo.map((opcion) => (
                            <Button
                                key={opcion.dias}
                                variant={diasSeleccionados === opcion.dias ? 'default' : 'outline'}
                                onClick={() => setDiasSeleccionados(opcion.dias)}
                                className="h-16 flex flex-col"
                            >
                                <span className="text-lg font-bold">{opcion.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Nueva Fecha */}
                <div className="flex items-center gap-2 justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                        <Label className="text-green-700 text-xs">Nueva Fecha de Vencimiento</Label>
                        <p className="font-bold text-green-800 text-lg">{calcularNuevaFecha()}</p>
                    </div>
                </div>

                {/* Botón de Confirmación */}
                <Button
                    onClick={handleRenovar}
                    disabled={loading}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? 'Procesando...' : `Renovar por S/ ${contrato.interes_acumulado.toFixed(2)}`}
                </Button>
            </CardContent>
        </Card>
    )
}
