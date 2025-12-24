'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Building2, Smartphone, Banknote } from 'lucide-react'
import { DatosDeposito, MedioPago } from '@/hooks/useInversionistaForm'

// ============================================================================
// CONSTANTS
// ============================================================================

const BANCOS_PERU = [
    'BCP', 'BBVA', 'Interbank', 'Scotiabank', 'BanBif',
    'Banco de la Nación', 'Caja Huancayo', 'Caja Arequipa', 'Otro'
]

interface CuentaDisponible {
    id: string
    nombre: string
    tipo: string
}

// ============================================================================
// PROPS
// ============================================================================

interface StepDepositoProps {
    data: DatosDeposito
    onChange: (data: DatosDeposito) => void
    cuentasDisponibles?: CuentaDisponible[]
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepDeposito({ data, onChange, cuentasDisponibles = [] }: StepDepositoProps) {
    const mediosPago: { value: MedioPago; label: string; icon: React.ReactNode }[] = [
        { value: 'EFECTIVO', label: 'Efectivo', icon: <Banknote className="w-5 h-5" /> },
        { value: 'TRANSFERENCIA', label: 'Transferencia', icon: <Building2 className="w-5 h-5" /> },
        { value: 'YAPE_PLIN', label: 'Yape/Plin', icon: <Smartphone className="w-5 h-5" /> }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold">¿Cómo depositó?</h3>
                <p className="text-sm text-muted-foreground">Datos del depósito y cuenta para pagos</p>
            </div>

            {/* Fecha Depósito */}
            <div className="space-y-2">
                <Label>Fecha del depósito</Label>
                <Input
                    type="date"
                    value={data.fechaDeposito}
                    onChange={(e) => onChange({ ...data, fechaDeposito: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                />
            </div>

            {/* Medio de Pago */}
            <div className="space-y-2">
                <Label>¿Cómo depositó el dinero?</Label>
                <div className="grid grid-cols-3 gap-3">
                    {mediosPago.map(medio => (
                        <button
                            key={medio.value}
                            type="button"
                            onClick={() => onChange({ ...data, medioPago: medio.value })}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${data.medioPago === medio.value
                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            {medio.icon}
                            <span className="text-xs font-medium">{medio.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Si es Transferencia */}
            {data.medioPago === 'TRANSFERENCIA' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                    <div className="text-sm font-medium text-blue-800">Datos de la transferencia</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-sm">Banco origen</Label>
                            <Select
                                value={data.bancoOrigen}
                                onValueChange={(v) => onChange({ ...data, bancoOrigen: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BANCOS_PERU.map(banco => (
                                        <SelectItem key={banco} value={banco}>{banco}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">N° Operación</Label>
                            <Input
                                placeholder="12345678"
                                value={data.numeroOperacion}
                                onChange={(e) => onChange({ ...data, numeroOperacion: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Si es Yape/Plin */}
            {data.medioPago === 'YAPE_PLIN' && (
                <div className="space-y-2">
                    <Label>Número de referencia</Label>
                    <Input
                        placeholder="Código de operación"
                        value={data.numeroOperacion}
                        onChange={(e) => onChange({ ...data, numeroOperacion: e.target.value })}
                    />
                </div>
            )}

            {/* Cuenta Destino empresa */}
            <div className="space-y-2">
                <Label>¿Dónde se depositó?</Label>
                <Select
                    value={data.cuentaDestinoId}
                    onValueChange={(v) => onChange({ ...data, cuentaDestinoId: v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta destino" />
                    </SelectTrigger>
                    <SelectContent>
                        {cuentasDisponibles.map(cuenta => (
                            <SelectItem key={cuenta.id} value={cuenta.id}>
                                {cuenta.nombre} ({cuenta.tipo})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Separador */}
            <div className="border-t pt-4">
                <div className="text-sm font-medium mb-3">Cuenta del inversionista para pagos</div>
            </div>

            {/* ¿Tiene cuenta bancaria? */}
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="tieneCuenta"
                        checked={data.tieneCuentaBancaria}
                        onCheckedChange={(checked) => onChange({ ...data, tieneCuentaBancaria: !!checked })}
                    />
                    <label htmlFor="tieneCuenta" className="text-sm cursor-pointer">
                        El inversionista tiene cuenta bancaria para recibir pagos
                    </label>
                </div>
            </div>

            {/* Datos bancarios del inversionista */}
            {data.tieneCuentaBancaria && (
                <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <div className="space-y-2">
                        <Label>Banco</Label>
                        <Select
                            value={data.banco}
                            onValueChange={(v) => onChange({ ...data, banco: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar banco" />
                            </SelectTrigger>
                            <SelectContent>
                                {BANCOS_PERU.map(banco => (
                                    <SelectItem key={banco} value={banco}>{banco}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>N° Cuenta</Label>
                            <Input
                                placeholder="123-456-789"
                                value={data.numeroCuenta}
                                onChange={(e) => onChange({ ...data, numeroCuenta: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CCI (20 dígitos)</Label>
                            <Input
                                placeholder="00212345678901234567"
                                value={data.cci}
                                onChange={(e) => onChange({ ...data, cci: e.target.value.replace(/\D/g, '').slice(0, 20) })}
                                maxLength={20}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Registrar ingreso */}
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="registrarIngreso"
                    checked={data.registrarIngreso}
                    onCheckedChange={(checked) => onChange({ ...data, registrarIngreso: !!checked })}
                />
                <label htmlFor="registrarIngreso" className="text-sm cursor-pointer">
                    Registrar automáticamente el ingreso de caja
                </label>
            </div>
        </div>
    )
}
