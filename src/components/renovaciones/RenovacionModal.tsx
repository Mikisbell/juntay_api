'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calculator, AlertTriangle } from 'lucide-react'
import { ContratoRenovable, renovarContrato } from '@/lib/actions/renovaciones-actions'
import { useRouter } from 'next/navigation'
import { SelectorModalidadInteres } from '@/components/pagos/SelectorModalidadInteres'
import { ModalidadInteres, ResultadoInteres, calcularInteresFlexible, calcularDiasTranscurridos } from '@/lib/utils/interes-flexible'

type Props = {
    contrato: ContratoRenovable | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RenovacionModal({ contrato, open, onOpenChange }: Props) {
    const router = useRouter()
    const [opcion, setOpcion] = useState<'total' | 'intereses'>('intereses')
    const [loading, setLoading] = useState(false)
    const [modalidadInteres, setModalidadInteres] = useState<ModalidadInteres>('semanas')
    const [interesCalculado, setInteresCalculado] = useState<ResultadoInteres | null>(null)

    // Calcular días transcurridos (mover antes del early return)
    const diasTranscurridos = contrato?.dias_transcurridos ||
        (contrato?.fecha_creacion ? calcularDiasTranscurridos(contrato.fecha_creacion) : 30)

    // Usar tasa del contrato o default de 20%
    const tasaInteres = contrato?.tasa_interes || 20

    // Calcular interés según modalidad (hook debe ser llamado siempre)
    const interesFlexible = useMemo(() => {
        if (!contrato) return { interes: 0, porcentajeAplicado: 0, diasCobrados: 0, descripcion: '', formula: '' }
        return calcularInteresFlexible(contrato.monto_prestado, tasaInteres, diasTranscurridos, modalidadInteres)
    }, [contrato, tasaInteres, diasTranscurridos, modalidadInteres])

    // Early return DESPUÉS de los hooks
    if (!contrato) return null

    // Usar interés flexible si está disponible, sino el acumulado legacy
    const montoIntereses = interesCalculado?.interes ?? interesFlexible.interes
    const montoTotal = contrato.saldo_pendiente + montoIntereses
    const montoPagar = opcion === 'total' ? montoTotal : montoIntereses

    const handleRenovar = async () => {
        setLoading(true)
        try {
            const result = await renovarContrato(contrato.id, opcion, montoPagar, undefined, modalidadInteres)
            if (result.success) {
                alert(result.mensaje)
                onOpenChange(false)
                router.refresh() // Recargar datos
            } else {
                alert(result.mensaje)
            }
        } catch (error) {
            alert('Error al renovar contrato')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Renovar Contrato
                    </DialogTitle>
                    <DialogDescription>
                        {contrato.codigo} - {contrato.cliente_nombre}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alerta de Urgencia */}
                    {contrato.urgencia === 'alta' && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <span>Este contrato vence en {contrato.dias_restantes} días. Requiere acción inmediata.</span>
                        </div>
                    )}

                    {/* Información del Contrato */}
                    <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Garantía:</span>
                            <span className="font-medium text-sm">{contrato.garantia_descripcion}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Monto Prestado:</span>
                            <span className="font-semibold">S/. {contrato.monto_prestado.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Saldo Pendiente:</span>
                            <span className="font-semibold">S/. {contrato.saldo_pendiente.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Interés Flexible:</span>
                            <span className="font-semibold text-amber-600">+ S/. {montoIntereses.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Adeudado:</span>
                                <span className="font-bold text-lg">S/. {montoTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* NUEVO: Selector de Modalidad de Interés */}
                    <SelectorModalidadInteres
                        montoPrestado={contrato.monto_prestado}
                        saldoPendiente={contrato.saldo_pendiente}
                        tasaMensual={tasaInteres}
                        diasTranscurridos={diasTranscurridos}
                        onModalidadChange={setModalidadInteres}
                        onInteresCalculado={setInteresCalculado}
                        modalidadSeleccionada={modalidadInteres}
                    />

                    {/* Opciones de Renovación */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Tipo de Operación:</Label>
                        <RadioGroup value={opcion} onValueChange={(v) => setOpcion(v as 'total' | 'intereses')}>
                            <div
                                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${opcion === 'intereses'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                                onClick={() => setOpcion('intereses')}
                            >
                                <RadioGroupItem value="intereses" id="intereses" className="mt-1" />
                                <div className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Label htmlFor="intereses" className="font-semibold cursor-pointer">
                                            Pagar Solo Intereses
                                        </Label>
                                        <Badge variant="secondary" className="text-xs">Más Común</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Paga S/. {montoIntereses.toFixed(2)} y extiende el plazo del préstamo
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        ✓ El capital queda intacto<br />
                                        ✓ Se renueva automáticamente por 30 días
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${opcion === 'total'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                                onClick={() => setOpcion('total')}
                            >
                                <RadioGroupItem value="total" id="total" className="mt-1" />
                                <div className="flex-1 cursor-pointer">
                                    <Label htmlFor="total" className="font-semibold cursor-pointer">
                                        Cancelación Total
                                    </Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Paga S/. {montoTotal.toFixed(2)} y finaliza el contrato
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                        ✓ Recupera tu garantía inmediatamente<br />
                                        ✓ Contrato cerrado sin deuda pendiente
                                    </div>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Resumen de Pago */}
                    <div className="rounded-lg bg-primary/10 border-2 border-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-primary">Monto a Pagar Hoy</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-primary">S/. {montoPagar.toFixed(2)}</span>
                            {opcion === 'intereses' && (
                                <span className="text-sm text-muted-foreground">
                                    (solo intereses)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleRenovar}
                        disabled={loading}
                        className="gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Procesando...' : 'Confirmar Renovación'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
