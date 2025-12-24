'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toast } from "sonner"
import { crearInversionista, obtenerDetalleCuentas, type CuentaFinancieraDetalle } from "@/lib/actions/tesoreria-actions"

import { useInversionistaForm } from '@/hooks/useInversionistaForm'
import { StepIdentificacion } from './StepIdentificacion'
import { StepTerminos } from './StepTerminos'
import { StepDeposito } from './StepDeposito'
import { StepConfirmacion } from './StepConfirmacion'

// ============================================================================
// PROPS
// ============================================================================

interface InversionistaModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InversionistaModal({ open, onOpenChange }: InversionistaModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cuentasDisponibles, setCuentasDisponibles] = useState<CuentaFinancieraDetalle[]>([])
    const [generarCronograma, setGenerarCronograma] = useState(true)

    const form = useInversionistaForm()
    const calculo = form.calcularRendimiento()

    // Cargar cuentas al abrir
    useEffect(() => {
        if (open) {
            obtenerDetalleCuentas().then(data => {
                const activas = data.filter(c => c.activo)
                setCuentasDisponibles(activas)
                if (activas.length > 0) {
                    const efectivo = activas.find(c => c.tipo === 'EFECTIVO')
                    if (efectivo) {
                        form.setDeposito({ ...form.deposito, cuentaDestinoId: efectivo.id })
                    }
                }
            })
        }
    }, [open])

    // Reset al cerrar
    const handleClose = () => {
        form.reset()
        setGenerarCronograma(true)
        onOpenChange(false)
    }

    // Submit
    const handleSubmit = async () => {
        if (!form.identificacion.persona) return

        setLoading(true)

        try {
            const data = form.getFormData()

            // Build metadata
            const metadata: Record<string, unknown> = {
                monto: data.terminos.monto,
                telefono: data.identificacion.telefono,
                email: data.identificacion.email,
                origen_fondos: data.identificacion.origenFondos,
                ocupacion: data.identificacion.ocupacion,
                tiene_cuenta_bancaria: data.deposito.tieneCuentaBancaria,
                fecha_deposito: data.deposito.fechaDeposito,
                medio_pago: data.deposito.medioPago,
                banco_origen: data.deposito.bancoOrigen,
                numero_operacion: data.deposito.numeroOperacion,
            }

            if (data.deposito.tieneCuentaBancaria) {
                metadata.banco = data.deposito.banco
                metadata.numero_cuenta = data.deposito.numeroCuenta
                metadata.cci = data.deposito.cci
            }

            if (data.terminos.tipoRelacion === 'PRESTAMISTA') {
                metadata.tasa_interes = data.terminos.tasaInteres
                metadata.tipo_tasa = data.terminos.tipoTasa
                metadata.tipo_interes = data.terminos.tipoInteres
                metadata.frecuencia_capitalizacion = data.terminos.frecuenciaCapitalizacion
                metadata.plazo_meses = data.terminos.plazoMeses
                metadata.modalidad_pago = data.terminos.modalidadPago
                metadata.dia_pago = data.terminos.diaPago
                metadata.frecuencia_pago = data.terminos.frecuenciaPago
                metadata.generar_cronograma = generarCronograma

                if (calculo) {
                    metadata.interes_calculado = calculo.interesAplicado
                    metadata.total_a_devolver = calculo.totalDevolver
                    metadata.fecha_vencimiento = calculo.fechaVencimiento
                }
            }

            if (data.terminos.tipoRelacion === 'SOCIO') {
                metadata.frecuencia_dividendos = data.terminos.frecuenciaDividendos
            }

            if (data.notas) {
                metadata.notas = data.notas
            }

            const formData = new FormData()
            formData.set('persona_id', data.identificacion.persona.id)
            formData.set('tipo', data.terminos.tipoRelacion)
            formData.set('porcentaje', data.terminos.tipoRelacion === 'SOCIO' ? data.terminos.porcentaje.toString() : '0')
            formData.set('fecha', data.deposito.fechaDeposito)
            formData.set('metadata', JSON.stringify(metadata))

            // Handle RENIEC new person
            if (data.identificacion.persona.esNueva) {
                formData.set('reniec_nombre', `${data.identificacion.persona.nombres} ${data.identificacion.persona.apellidos}`)
                formData.set('reniec_dni', data.identificacion.persona.dni)
            }

            // Cash entry
            if (data.deposito.registrarIngreso && data.deposito.cuentaDestinoId) {
                formData.append('registrar_ingreso', 'true')
                formData.append('cuenta_destino_id', data.deposito.cuentaDestinoId)
                formData.append('monto_ingreso', data.terminos.monto.toString())
                formData.append('referencia_ingreso', data.deposito.numeroOperacion || data.deposito.medioPago)
            }

            const res = await crearInversionista(formData)

            if (res.success) {
                toast.success('Inversionista registrado correctamente')
                handleClose()
                router.refresh()
            } else {
                toast.error(res.error || 'Error al registrar')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al procesar')
        } finally {
            setLoading(false)
        }
    }

    // Step indicators
    const steps = [
        { num: 1, label: 'Identificación' },
        { num: 2, label: 'Términos' },
        { num: 3, label: 'Depósito' },
        { num: 4, label: 'Confirmar' }
    ]

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nuevo Inversionista</DialogTitle>
                </DialogHeader>

                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-4">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <button
                                onClick={() => form.irAStep(s.num)}
                                disabled={s.num > form.step && !form.puedeAvanzar(form.step)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${form.step === s.num
                                        ? 'bg-violet-600 text-white'
                                        : form.step > s.num
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {form.step > s.num ? <Check className="w-4 h-4" /> : s.num}
                            </button>
                            {i < steps.length - 1 && (
                                <div className={`w-full h-1 mx-2 rounded ${form.step > s.num ? 'bg-emerald-500' : 'bg-gray-200'
                                    }`} style={{ width: '40px' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {form.step === 1 && (
                        <StepIdentificacion
                            data={form.identificacion}
                            onChange={form.setIdentificacion}
                        />
                    )}
                    {form.step === 2 && (
                        <StepTerminos
                            data={form.terminos}
                            onChange={form.setTerminos}
                            calculo={calculo}
                        />
                    )}
                    {form.step === 3 && (
                        <StepDeposito
                            data={form.deposito}
                            onChange={form.setDeposito}
                            cuentasDisponibles={cuentasDisponibles.map(c => ({
                                id: c.id,
                                nombre: c.nombre,
                                tipo: c.tipo
                            }))}
                        />
                    )}
                    {form.step === 4 && (
                        <StepConfirmacion
                            data={form.getFormData()}
                            calculo={calculo}
                            notas={form.notas}
                            onNotasChange={form.setNotas}
                            generarCronograma={generarCronograma}
                            onGenerarCronogramaChange={setGenerarCronograma}
                        />
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="gap-2">
                    {form.step > 1 && (
                        <Button variant="outline" onClick={form.anterior} disabled={loading}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Atrás
                        </Button>
                    )}

                    {form.step < 4 ? (
                        <Button
                            onClick={form.siguiente}
                            disabled={!form.puedeAvanzar(form.step)}
                        >
                            Siguiente
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Confirmar Registro
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
