'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TrendingUp, Users, Info, DollarSign } from 'lucide-react'
import { DatosTerminos, TipoRelacion, ModalidadPago } from '@/hooks/useInversionistaForm'
import { TipoInteres } from '@/lib/utils/rendimientos-inversionista'

// ============================================================================
// PROPS
// ============================================================================

interface StepTerminosProps {
    data: DatosTerminos
    onChange: (data: DatosTerminos) => void
    calculo: {
        interesSimple: number
        interesCompuesto: number
        interesAplicado: number
        totalDevolver: number
        fechaVencimiento: string
        diferencia: number
    } | null
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepTerminos({ data, onChange, calculo }: StepTerminosProps) {
    const formatCurrency = (value: number) =>
        `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">¿Cómo participa?</h3>
                <p className="text-sm text-muted-foreground">Define los términos de la inversión</p>
            </div>

            {/* Tipo Selector */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onChange({ ...data, tipoRelacion: 'SOCIO' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${data.tipoRelacion === 'SOCIO'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <Users className={`w-6 h-6 mb-2 ${data.tipoRelacion === 'SOCIO' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="font-semibold">Socio</div>
                    <div className="text-xs text-muted-foreground">Gana % de utilidades</div>
                </button>
                <button
                    type="button"
                    onClick={() => onChange({ ...data, tipoRelacion: 'PRESTAMISTA' })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${data.tipoRelacion === 'PRESTAMISTA'
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <TrendingUp className={`w-6 h-6 mb-2 ${data.tipoRelacion === 'PRESTAMISTA' ? 'text-violet-600' : 'text-gray-400'}`} />
                    <div className="font-semibold">Prestamista</div>
                    <div className="text-xs text-muted-foreground">Gana interés fijo</div>
                </button>
            </div>

            {/* Monto */}
            <div className="space-y-2">
                <Label>
                    {data.tipoRelacion === 'SOCIO' ? '¿Cuánto capital aporta?' : '¿Cuánto dinero nos presta?'}
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                    <Input
                        type="number"
                        placeholder="10000"
                        value={data.monto || ''}
                        onChange={(e) => onChange({ ...data, monto: parseFloat(e.target.value) || 0 })}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* SOCIO specific fields */}
            {data.tipoRelacion === 'SOCIO' && (
                <>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-2">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <strong>Importante:</strong> Un socio no gana interés fijo.
                                Gana un porcentaje de las utilidades del negocio cada mes.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>¿Qué porcentaje de participación representa?</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="10"
                                value={data.porcentaje || ''}
                                onChange={(e) => onChange({ ...data, porcentaje: parseFloat(e.target.value) || 0 })}
                                className="pr-10"
                                max={100}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>¿Cada cuánto recibe dividendos?</Label>
                        <Select
                            value={data.frecuenciaDividendos}
                            onValueChange={(v) => onChange({ ...data, frecuenciaDividendos: v as 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL' })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MENSUAL">Mensual</SelectItem>
                                <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                                <SelectItem value="ANUAL">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {/* PRESTAMISTA specific fields */}
            {data.tipoRelacion === 'PRESTAMISTA' && (
                <>
                    {/* Tasa */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Tasa de interés</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="10"
                                    value={data.tasaInteres || ''}
                                    onChange={(e) => onChange({ ...data, tasaInteres: parseFloat(e.target.value) || 0 })}
                                    className="pr-10"
                                />
                                <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de tasa</Label>
                            <Select
                                value={data.tipoTasa}
                                onValueChange={(v) => onChange({ ...data, tipoTasa: v as 'ANUAL' | 'MENSUAL' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANUAL">Anual</SelectItem>
                                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Plazo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Plazo</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="12"
                                    value={data.plazoMeses || ''}
                                    onChange={(e) => onChange({ ...data, plazoMeses: parseInt(e.target.value) || 0 })}
                                    className="w-20"
                                />
                                <span className="text-muted-foreground">meses</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Día de pago</Label>
                            <Select
                                value={data.diaPago.toString()}
                                onValueChange={(v) => onChange({ ...data, diaPago: parseInt(v) })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 5, 10, 15, 20, 25, 28].map(dia => (
                                        <SelectItem key={dia} value={dia.toString()}>
                                            Día {dia}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tipo de Interés */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            Tipo de interés
                            <Badge variant="outline" className="text-xs font-normal">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Nuevo
                            </Badge>
                        </Label>
                        <RadioGroup
                            value={data.tipoInteres}
                            onValueChange={(v) => onChange({ ...data, tipoInteres: v as TipoInteres })}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${data.tipoInteres === 'SIMPLE' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'
                                }`}>
                                <RadioGroupItem value="SIMPLE" id="simple" />
                                <label htmlFor="simple" className="cursor-pointer">
                                    <div className="font-medium text-sm">Simple</div>
                                    <div className="text-xs text-muted-foreground">Básico</div>
                                </label>
                            </div>
                            <div className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${data.tipoInteres === 'COMPUESTO' ? 'border-emerald-400 bg-emerald-50' : 'hover:bg-gray-50'
                                }`}>
                                <RadioGroupItem value="COMPUESTO" id="compuesto" />
                                <label htmlFor="compuesto" className="cursor-pointer flex-1">
                                    <div className="font-medium text-sm flex items-center gap-1">
                                        Compuesto
                                        <Badge className="bg-emerald-500 text-[10px]">Recomendado</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Estándar bancario</div>
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Modalidad Pago */}
                    <div className="space-y-2">
                        <Label>¿Cómo pagamos los intereses?</Label>
                        <RadioGroup
                            value={data.modalidadPago}
                            onValueChange={(v) => onChange({ ...data, modalidadPago: v as ModalidadPago })}
                        >
                            <div className={`flex items-center space-x-2 p-3 rounded border ${data.modalidadPago === 'BULLET' ? 'border-violet-400 bg-violet-50' : 'hover:bg-gray-50'}`}>
                                <RadioGroupItem value="BULLET" id="bullet" />
                                <label htmlFor="bullet" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-sm">Todo al vencimiento</div>
                                    <div className="text-xs text-muted-foreground">Capital + intereses al final</div>
                                </label>
                            </div>
                            <div className={`flex items-center space-x-2 p-3 rounded border ${data.modalidadPago === 'INTERES_MENSUAL' ? 'border-violet-400 bg-violet-50' : 'hover:bg-gray-50'}`}>
                                <RadioGroupItem value="INTERES_MENSUAL" id="mensual" />
                                <label htmlFor="mensual" className="flex-1 cursor-pointer">
                                    <div className="font-medium text-sm">Intereses periódicos</div>
                                    <div className="text-xs text-muted-foreground">Intereses cada periodo, capital al final</div>
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Preview */}
                    {calculo && (
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg border border-violet-200">
                            <div className="text-sm font-medium text-violet-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Vista Previa del Rendimiento
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className={`p-2 rounded ${data.tipoInteres === 'SIMPLE' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-white/50'}`}>
                                    <div className="text-xs text-muted-foreground">Interés Simple</div>
                                    <div className="font-semibold">{formatCurrency(calculo.interesSimple)}</div>
                                </div>
                                <div className={`p-2 rounded ${data.tipoInteres === 'COMPUESTO' ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'bg-white/50'}`}>
                                    <div className="text-xs text-muted-foreground">Interés Compuesto</div>
                                    <div className="font-semibold text-emerald-700">{formatCurrency(calculo.interesCompuesto)}</div>
                                </div>
                            </div>

                            {calculo.diferencia > 0 && data.tipoInteres === 'SIMPLE' && (
                                <div className="p-2 bg-amber-100 rounded text-xs text-amber-800 mb-3">
                                    💡 Con compuesto ganaría <strong>{formatCurrency(calculo.diferencia)}</strong> más
                                </div>
                            )}

                            <div className="pt-3 border-t border-violet-200 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Total a devolver:</span>
                                    <span className="font-bold text-lg">{formatCurrency(calculo.totalDevolver)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Vencimiento: {calculo.fechaVencimiento}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
