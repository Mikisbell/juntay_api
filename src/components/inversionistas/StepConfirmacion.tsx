'use client'

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, FileText, Calendar, DollarSign, User, TrendingUp } from 'lucide-react'
import { InversionistaFormData, CalculoRendimiento } from '@/hooks/useInversionistaForm'

// ============================================================================
// PROPS
// ============================================================================

interface StepConfirmacionProps {
    data: InversionistaFormData
    calculo: CalculoRendimiento | null
    notas: string
    onNotasChange: (notas: string) => void
    generarCronograma: boolean
    onGenerarCronogramaChange: (value: boolean) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepConfirmacion({
    data,
    calculo,
    notas,
    onNotasChange,
    generarCronograma,
    onGenerarCronogramaChange
}: StepConfirmacionProps) {
    const formatCurrency = (value: number) =>
        `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    const getMedioPagoLabel = () => {
        switch (data.deposito.medioPago) {
            case 'EFECTIVO': return '💵 Efectivo'
            case 'TRANSFERENCIA': return `🏦 Transferencia ${data.deposito.bancoOrigen}`
            case 'YAPE_PLIN': return '📱 Yape/Plin'
            default: return 'No especificado'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">Confirmar Registro</h3>
                <p className="text-sm text-muted-foreground">Revisa los datos antes de confirmar</p>
            </div>

            {/* Resumen Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border p-4 space-y-4">
                {/* Inversionista */}
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Inversionista</div>
                        <div className="font-medium">
                            {data.identificacion.persona?.nombres} {data.identificacion.persona?.apellidos}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            DNI: {data.identificacion.persona?.dni} • Tel: {data.identificacion.telefono}
                        </div>
                    </div>
                    <Badge className={data.terminos.tipoRelacion === 'SOCIO' ? 'bg-blue-500' : 'bg-violet-500'}>
                        {data.terminos.tipoRelacion}
                    </Badge>
                </div>

                <div className="border-t pt-3" />

                {/* Términos */}
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Capital Invertido</div>
                        <div className="font-bold text-xl">{formatCurrency(data.terminos.monto)}</div>

                        {data.terminos.tipoRelacion === 'PRESTAMISTA' && (
                            <div className="text-sm text-muted-foreground mt-1">
                                {data.terminos.tasaInteres}% {data.terminos.tipoTasa.toLowerCase()} •
                                {data.terminos.plazoMeses} meses •
                                Interés {data.terminos.tipoInteres.toLowerCase()}
                            </div>
                        )}

                        {data.terminos.tipoRelacion === 'SOCIO' && (
                            <div className="text-sm text-muted-foreground mt-1">
                                {data.terminos.porcentaje}% participación •
                                Dividendos {data.terminos.frecuenciaDividendos.toLowerCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rendimiento (solo PRESTAMISTA) */}
                {data.terminos.tipoRelacion === 'PRESTAMISTA' && calculo && (
                    <>
                        <div className="border-t pt-3" />
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-4 h-4 text-violet-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground">Rendimiento</div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Interés a pagar</div>
                                        <div className="font-semibold text-violet-600">
                                            {formatCurrency(calculo.interesAplicado)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total a devolver</div>
                                        <div className="font-bold text-lg">
                                            {formatCurrency(calculo.totalDevolver)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="border-t pt-3" />

                {/* Depósito */}
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Depósito</div>
                        <div className="font-medium">{getMedioPagoLabel()}</div>
                        <div className="text-sm text-muted-foreground">
                            Fecha: {new Date(data.deposito.fechaDeposito).toLocaleDateString('es-PE')}
                            {data.deposito.numeroOperacion && ` • Ref: ${data.deposito.numeroOperacion}`}
                        </div>
                    </div>
                </div>

                {/* Cuenta para pagos */}
                {data.deposito.tieneCuentaBancaria && (
                    <>
                        <div className="border-t pt-3" />
                        <div className="text-sm">
                            <span className="text-muted-foreground">Cuenta para pagos: </span>
                            <span className="font-medium">{data.deposito.banco} - {data.deposito.numeroCuenta}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Generar Cronograma */}
            {data.terminos.tipoRelacion === 'PRESTAMISTA' && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Checkbox
                        id="cronograma"
                        checked={generarCronograma}
                        onCheckedChange={(checked) => onGenerarCronogramaChange(!!checked)}
                    />
                    <label htmlFor="cronograma" className="text-sm cursor-pointer flex-1">
                        <div className="font-medium text-blue-800">Generar cronograma de pagos automático</div>
                        <div className="text-xs text-blue-600">
                            Se crearán las cuotas programadas según la modalidad
                        </div>
                    </label>
                    <FileText className="w-5 h-5 text-blue-400" />
                </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
                <Label>Notas adicionales (opcional)</Label>
                <Textarea
                    placeholder="Ej: Amigo del dueño, referido por..."
                    value={notas}
                    onChange={(e) => onNotasChange(e.target.value)}
                    rows={2}
                />
            </div>

            {/* Confirmación final */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <div className="text-sm text-emerald-700">
                    ✓ Al confirmar, se registrará el inversionista y el movimiento de caja
                </div>
            </div>
        </div>
    )
}
