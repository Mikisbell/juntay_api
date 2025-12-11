'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buscarContratoPorCodigo, registrarPago, ContratoParaPago } from '@/lib/actions/pagos-actions'
import { Search, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
// import { ModalRenovar } from '@/components/renovaciones/ModalRenovar' // Commented out - component removed

export function FormularioPago({ cajaId }: { cajaId: string }) {
    const [codigo, setCodigo] = useState('')
    const [contrato, setContrato] = useState<ContratoParaPago | null>(null)
    const [loading, setLoading] = useState(false)
    const [tipoPago, setTipoPago] = useState<'interes' | 'desempeno'>('interes')
    const [procesando, setProcesando] = useState(false)
    const [mostrarRenovacion, setMostrarRenovacion] = useState(false)

    const handleBuscar = async () => {
        if (!codigo) return

        setLoading(true)
        try {
            const result = await buscarContratoPorCodigo(codigo)
            if (result) {
                setContrato(result)
            } else {
                alert('Contrato no encontrado o ya está cancelado')
            }
        } catch (error) {
            console.error(error)
            alert('Error al buscar contrato')
        } finally {
            setLoading(false)
        }
    }

    const handlePagar = async () => {
        if (!contrato) return

        const monto = tipoPago === 'desempeno'
            ? contrato.saldo_pendiente + contrato.interes_acumulado + contrato.mora_pendiente
            : contrato.interes_acumulado + contrato.mora_pendiente

        if (!confirm(`¿Confirmar pago de S/ ${monto.toFixed(2)}?`)) return

        setProcesando(true)
        try {
            const result = await registrarPago({
                creditoId: contrato.id,
                tipoPago,
                montoPagado: monto,
                cajaOperativaId: cajaId
            })

            if (result.success) {
                alert('¡Pago registrado exitosamente!')
                setContrato(null)
                setCodigo('')
            } else {
                alert(result.error || 'Error al procesar pago')
            }
        } catch (error) {
            console.error(error)
            alert('Error inesperado')
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Buscador */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Buscar Contrato
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="codigo">Código de Contrato</Label>
                            <Input
                                id="codigo"
                                placeholder="CON-2024-001"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                            />
                        </div>
                        <Button onClick={handleBuscar} disabled={loading || !codigo} className="self-end">
                            {loading ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Detalles del Contrato */}
            {contrato && (
                <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50">
                        <CardTitle className="flex items-center justify-between">
                            <span>Contrato: {contrato.codigo}</span>
                            <Badge variant={contrato.dias_mora > 0 ? 'destructive' : 'default'}>
                                {contrato.dias_mora > 0 ? `${contrato.dias_mora} días de mora` : 'VIGENTE'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {/* Cliente */}
                        <div>
                            <Label className="text-slate-500">Cliente</Label>
                            <p className="font-semibold">{contrato.cliente.nombre}</p>
                            <p className="text-sm text-slate-500">{contrato.cliente.documento}</p>
                        </div>

                        <Separator />

                        {/* Financiero */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-500">Monto Prestado</Label>
                                <p className="text-lg font-bold">S/ {contrato.monto_prestado.toFixed(2)}</p>
                            </div>
                            <div>
                                <Label className="text-slate-500">Saldo Pendiente</Label>
                                <p className="text-lg font-bold text-rose-600">S/ {contrato.saldo_pendiente.toFixed(2)}</p>
                            </div>
                            <div>
                                <Label className="text-slate-500">Interés Acumulado</Label>
                                <p className="text-lg font-bold">S/ {contrato.interes_acumulado.toFixed(2)}</p>
                            </div>
                            {contrato.mora_pendiente > 0 && (
                                <div>
                                    <Label className="text-slate-500">Mora Pendiente</Label>
                                    <p className="text-lg font-bold text-amber-600">S/ {contrato.mora_pendiente.toFixed(2)}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Opciones de Pago */}
                        <div className="space-y-3">
                            <Label>Tipo de Pago</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant={tipoPago === 'interes' ? 'default' : 'outline'}
                                    onClick={() => setTipoPago('interes')}
                                    className="h-20 flex flex-col items-center justify-center"
                                >
                                    <DollarSign className="h-6 w-6 mb-1" />
                                    <span className="font-bold">Pago de Interés</span>
                                    <span className="text-xs">S/ {(contrato.interes_acumulado + contrato.mora_pendiente).toFixed(2)}</span>
                                </Button>
                                <Button
                                    variant={tipoPago === 'desempeno' ? 'default' : 'outline'}
                                    onClick={() => setTipoPago('desempeno')}
                                    className="h-20 flex flex-col items-center justify-center"
                                >
                                    <CheckCircle className="h-6 w-6 mb-1" />
                                    <span className="font-bold">Desempeño Total</span>
                                    <span className="text-xs">S/ {(contrato.saldo_pendiente + contrato.interes_acumulado + contrato.mora_pendiente).toFixed(2)}</span>
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={() => setMostrarRenovacion(!mostrarRenovacion)}
                                variant="outline"
                                className="w-full mb-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {mostrarRenovacion ? 'Ocultar Renovación' : 'Renovar Contrato'}
                            </Button>

                            {!mostrarRenovacion && (
                                <Button
                                    onClick={handlePagar}
                                    disabled={procesando}
                                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                                >
                                    {procesando ? 'Procesando...' : `Registrar Pago`}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Renovación */}
            {/* Temporarily disabled - ModalRenovar component removed
            {contrato && mostrarRenovacion && (
                <ModalRenovar
                    contrato={contrato}
                    cajaId={cajaId}
                    onSuccess={() => {
                        setContrato(null)
                        setCodigo('')
                        setMostrarRenovacion(false)
                    }}
                />
            )}
            */}
        </div>
    )
}
