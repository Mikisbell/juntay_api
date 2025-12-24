'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, ArrowLeft, ArrowRight, Check, TrendingUp, Info } from 'lucide-react'
import { toast } from "sonner"
import { crearInversionista, actualizarInversionista, buscarPersonas, obtenerDetalleCuentas, type InversionistaDetalle, type CuentaFinancieraDetalle } from "@/lib/actions/tesoreria-actions"
import { consultarEntidad, type DatosEntidad } from "@/lib/apis/consultasperu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    calcularInteresCompuesto,
    calcularInteresSimple,
    type TipoInteres,
    type FrecuenciaCapitalizacion
} from "@/lib/utils/rendimientos-inversionista"

// ============================================================================
// CONSTANTS
// ============================================================================

const BANCOS_PERU = [
    'BCP', 'BBVA', 'Interbank', 'Scotiabank', 'BanBif',
    'Banco de la Nación', 'Caja Huancayo', 'Caja Arequipa', 'Otro'
]

// ============================================================================
// TYPES
// ============================================================================

interface CreateInversionistaModalProps {
    inversionistaToEdit?: InversionistaDetalle | null
    onOpenChange?: (open: boolean) => void
}

interface SelectedPerson {
    id: string
    nombres: string
    dni?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateInversionistaModal({ inversionistaToEdit, onOpenChange }: CreateInversionistaModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1, 2, 3

    // ========== STEP 1: Identification ==========
    const [tipoRelacion, setTipoRelacion] = useState<'SOCIO' | 'PRESTAMISTA'>('SOCIO')
    const [searchDNI, setSearchDNI] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<SelectedPerson | null>(null)
    const [datosEntidad, setDatosEntidad] = useState<DatosEntidad | null>(null)

    // ========== STEP 2: Terms ==========
    // Common
    const [monto, setMonto] = useState('')

    // SOCIO only
    const [porcentaje, setPorcentaje] = useState('')

    // PRESTAMISTA only
    const [tasaInteres, setTasaInteres] = useState('')
    const [tipoTasa, setTipoTasa] = useState<'ANUAL' | 'MENSUAL'>('ANUAL')
    const [plazoMeses, setPlazoMeses] = useState('')
    const [modalidadPago, setModalidadPago] = useState<'BULLET' | 'INTERES_MENSUAL'>('BULLET')
    const [tipoInteres, setTipoInteres] = useState<TipoInteres>('SIMPLE')
    const [frecuenciaCapitalizacion, setFrecuenciaCapitalizacion] = useState<FrecuenciaCapitalizacion>('MENSUAL')

    // ========== STEP 3: Bank Details + Contract ==========
    const [tieneCuentaBancaria, setTieneCuentaBancaria] = useState(false)
    const [banco, setBanco] = useState('')
    const [numeroCuenta, setNumeroCuenta] = useState('')
    const [cci, setCci] = useState('')

    // Contract dates
    const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0])
    const [notas, setNotas] = useState('')

    // New: Cash Entry Logic
    const [registrarIngreso, setRegistrarIngreso] = useState(true)
    const [cuentaDestinoId, setCuentaDestinoId] = useState('')
    const [referenciaIngreso, setReferenciaIngreso] = useState('')
    const [cuentasDisponibles, setCuentasDisponibles] = useState<CuentaFinancieraDetalle[]>([])

    useEffect(() => {
        if (open) {
            obtenerDetalleCuentas().then(data => {
                setCuentasDisponibles(data.filter(c => c.activo))
                // Preselect first cash account if available
                const efectivo = data.find(c => c.tipo === 'EFECTIVO' && c.activo)
                if (efectivo) setCuentaDestinoId(efectivo.id)
            })
        }
    }, [open])

    // ========== HANDLERS ==========

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val) resetForm()
        onOpenChange?.(val)
    }

    const resetForm = () => {
        setStep(1)
        setTipoRelacion('SOCIO')
        setSearchDNI('')
        setSelectedPerson(null)
        setDatosEntidad(null)
        setMonto('')
        setPorcentaje('')
        setTasaInteres('')
        setTipoTasa('ANUAL')
        setPlazoMeses('')
        setModalidadPago('BULLET')
        setTieneCuentaBancaria(false)
        setBanco('')
        setNumeroCuenta('')
        setCci('')
        setFechaIngreso(new Date().toISOString().split('T')[0])
        setNotas('')
        setRegistrarIngreso(true)
        setRegistrarIngreso(true)
        setCuentaDestinoId('')
        setReferenciaIngreso('')
    }

    const handleSmartDNISearch = async (dni: string) => {
        if (dni.length !== 8) return

        setSearchLoading(true)
        setDatosEntidad(null)
        setSelectedPerson(null)

        try {
            // 1. Local search first
            const locales = await buscarPersonas(dni)
            const encontrado = locales.find(p => p.numero_documento === dni)

            if (encontrado) {
                toast.success('Persona encontrada en sistema', {
                    description: encontrado.nombre_completo
                })
                setSelectedPerson({
                    id: encontrado.id,
                    nombres: encontrado.nombre_completo,
                    dni: dni
                })
                return
            }

            // 2. RENIEC fallback
            const reniec = await consultarEntidad('DNI', dni)
            if (reniec) {
                setDatosEntidad(reniec)
                toast.success('Encontrado en RENIEC', {
                    description: reniec.nombre_completo
                })
            } else {
                toast.error('DNI no encontrado')
            }

        } catch (error) {
            console.error(error)
            toast.error('Error al buscar')
        } finally {
            setSearchLoading(false)
        }
    }

    // Calculate interest (simple or compound based on selection)
    const calcularInteres = (): number => {
        const capital = parseFloat(monto) || 0
        const tasa = parseFloat(tasaInteres) || 0
        const meses = parseInt(plazoMeses) || 0

        if (capital === 0 || tasa === 0 || meses === 0) return 0

        // Convert to annual if monthly
        const tasaAnual = tipoTasa === 'MENSUAL' ? tasa * 12 : tasa

        if (tipoInteres === 'COMPUESTO') {
            return calcularInteresCompuesto({
                capital,
                tasaAnual,
                meses,
                capitalizacion: frecuenciaCapitalizacion
            }).interesCompuesto
        }

        return calcularInteresSimple(capital, tasaAnual, meses)
    }

    // Calculate comparison for preview
    const calcularComparacion = () => {
        const capital = parseFloat(monto) || 0
        const tasa = parseFloat(tasaInteres) || 0
        const meses = parseInt(plazoMeses) || 0

        if (capital === 0 || tasa === 0 || meses === 0) return null

        const tasaAnual = tipoTasa === 'MENSUAL' ? tasa * 12 : tasa
        const resultado = calcularInteresCompuesto({
            capital,
            tasaAnual,
            meses,
            capitalizacion: frecuenciaCapitalizacion
        })

        return {
            simple: resultado.interesSimple,
            compuesto: resultado.interesCompuesto,
            diferencia: resultado.diferencia
        }
    }

    const calcularTotalDevolver = (): number => {
        return (parseFloat(monto) || 0) + calcularInteres()
    }

    const calcularFechaVencimiento = (): string => {
        const meses = parseInt(plazoMeses) || 0
        if (meses === 0 || !fechaIngreso) return ''
        const fecha = new Date(fechaIngreso)  // ← Usar fecha de ingreso, no hoy
        fecha.setMonth(fecha.getMonth() + meses)
        return fecha.toLocaleDateString('es-PE')
    }

    // Validate current step
    const canContinue = (): boolean => {
        if (step === 1) {
            return !!(selectedPerson || datosEntidad)
        }
        if (step === 2) {
            if (!monto || parseFloat(monto) <= 0) return false
            if (tipoRelacion === 'SOCIO' && !porcentaje) return false
            if (tipoRelacion === 'PRESTAMISTA' && (!tasaInteres || !plazoMeses)) return false
            return true
        }
        return true
    }

    const handleContinue = () => {
        // If RENIEC data exists but not selected, select it
        if (step === 1 && datosEntidad && !selectedPerson) {
            setSelectedPerson({
                id: 'temp_' + searchDNI,
                nombres: datosEntidad.nombre_completo,
                dni: searchDNI
            })
        }
        setStep(step + 1)
    }

    const handleSubmit = async () => {
        if (!selectedPerson) {
            toast.error("Debes seleccionar una persona")
            return
        }

        setLoading(true)

        try {
            const metadata: Record<string, unknown> = {
                monto: parseFloat(monto),
                tiene_cuenta_bancaria: tieneCuentaBancaria,
            }

            if (tieneCuentaBancaria) {
                metadata.banco = banco
                metadata.numero_cuenta = numeroCuenta
                metadata.cci = cci
            }

            if (tipoRelacion === 'PRESTAMISTA') {
                metadata.tasa_interes = parseFloat(tasaInteres)
                metadata.tipo_tasa = tipoTasa
                metadata.plazo_meses = parseInt(plazoMeses)
                metadata.modalidad_pago = modalidadPago
                metadata.tipo_interes = tipoInteres
                metadata.frecuencia_capitalizacion = frecuenciaCapitalizacion
                metadata.fecha_vencimiento = calcularFechaVencimiento()
                metadata.total_a_devolver = calcularTotalDevolver()

                // Add comparison for reference
                const comparacion = calcularComparacion()
                if (comparacion) {
                    metadata.interes_simple = comparacion.simple
                    metadata.interes_compuesto = comparacion.compuesto
                    metadata.diferencia_compuesto = comparacion.diferencia
                }
            }

            // Common additional fields
            if (notas) metadata.notas = notas

            const formData = new FormData()
            formData.set('persona_id', selectedPerson.id)
            formData.set('tipo', tipoRelacion)
            formData.set('porcentaje', tipoRelacion === 'SOCIO' ? porcentaje : '0')
            formData.set('fecha', fechaIngreso) // Use selected date
            formData.set('metadata', JSON.stringify(metadata))

            // If from RENIEC, include data to create persona
            if (selectedPerson.id.startsWith('temp_') && selectedPerson.dni) {
                formData.set('reniec_nombre', selectedPerson.nombres)
                formData.set('reniec_dni', selectedPerson.dni)
            }

            // Append Cash Entry Logic
            if (registrarIngreso && cuentaDestinoId && !inversionistaToEdit) {
                formData.append('registrar_ingreso', 'true')
                formData.append('cuenta_destino_id', cuentaDestinoId)
                formData.append('monto_ingreso', monto)
                formData.append('referencia_ingreso', referenciaIngreso)
            }

            const res = inversionistaToEdit
                ? await actualizarInversionista(formData)
                : await crearInversionista(formData)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Inversionista registrado correctamente', {
                    description: `${selectedPerson.nombres} - S/ ${parseFloat(monto).toLocaleString()}`
                })
                handleOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    // ========== RENDER ==========

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="h-4 w-4" />
                    Nuevo Inversionista
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Registrar {tipoRelacion === 'SOCIO' ? 'Socio' : 'Prestamista'}
                    </DialogTitle>
                    <DialogDescription>
                        Paso {step} de 3
                    </DialogDescription>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* ========== STEP 1: Identification ========== */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                ¿Qué tipo de inversión es?
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipoRelacion('SOCIO')}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${tipoRelacion === 'SOCIO'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🤝</div>
                                    <div className="font-semibold">Socio (Equity)</div>
                                    <div className="text-xs text-muted-foreground">
                                        Aporta capital a cambio de % de ganancias
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipoRelacion('PRESTAMISTA')}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${tipoRelacion === 'PRESTAMISTA'
                                        ? 'border-violet-500 bg-violet-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">💰</div>
                                    <div className="font-semibold">Prestamista (Deuda)</div>
                                    <div className="text-xs text-muted-foreground">
                                        Presta dinero con interés fijo y plazo
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* DNI Search */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                ¿Quién es el {tipoRelacion === 'SOCIO' ? 'socio' : 'prestamista'}?
                            </Label>

                            {selectedPerson ? (
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-emerald-50 border-emerald-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 p-2 rounded-full">
                                            <Check className="w-5 h-5 text-emerald-700" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900">{selectedPerson.nombres}</p>
                                            <p className="text-sm text-emerald-700">DNI: {selectedPerson.dni || searchDNI}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPerson(null)
                                            setDatosEntidad(null)
                                            setSearchDNI('')
                                        }}
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            placeholder="Ingresa DNI (8 dígitos)"
                                            value={searchDNI}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                                                setSearchDNI(val)
                                                if (val.length === 8) handleSmartDNISearch(val)
                                            }}
                                            maxLength={8}
                                            className="text-center text-lg tracking-widest font-mono"
                                            disabled={searchLoading}
                                        />
                                        {searchLoading && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* RENIEC Result Card */}
                                    {datosEntidad && (
                                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-full">
                                                    <UserPlus className="w-5 h-5 text-emerald-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-emerald-600">✓ Encontrado en RENIEC</p>
                                                    <p className="font-bold text-emerald-900">{datosEntidad.nombre_completo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== STEP 2: Terms ========== */}
                {step === 2 && (
                    <div className="space-y-5">
                        {tipoRelacion === 'SOCIO' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>¿Cuánto aporta el socio?</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                                        <Input
                                            type="number"
                                            placeholder="10000"
                                            value={monto}
                                            onChange={(e) => setMonto(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>¿Qué porcentaje de participación representa?</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="10"
                                            value={porcentaje}
                                            onChange={(e) => setPorcentaje(e.target.value)}
                                            className="pr-10"
                                            max={100}
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Este porcentaje representa su participación en las ganancias del negocio
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>¿Cuánto dinero nos presta?</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                                        <Input
                                            type="number"
                                            placeholder="10000"
                                            value={monto}
                                            onChange={(e) => setMonto(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Tasa de interés acordada</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                value={tasaInteres}
                                                onChange={(e) => setTasaInteres(e.target.value)}
                                                className="pr-10"
                                            />
                                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipo de tasa</Label>
                                        <Select value={tipoTasa} onValueChange={(v) => setTipoTasa(v as 'ANUAL' | 'MENSUAL')}>
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

                                <div className="space-y-2">
                                    <Label>¿En cuánto tiempo devolvemos el dinero?</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="number"
                                            placeholder="12"
                                            value={plazoMeses}
                                            onChange={(e) => setPlazoMeses(e.target.value)}
                                            className="w-24"
                                        />
                                        <span className="text-muted-foreground">meses</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>¿Cómo pagamos los intereses?</Label>
                                    <RadioGroup value={modalidadPago} onValueChange={(v) => setModalidadPago(v as 'BULLET' | 'INTERES_MENSUAL')}>
                                        <div className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                                            <RadioGroupItem value="BULLET" id="bullet" />
                                            <label htmlFor="bullet" className="flex-1 cursor-pointer">
                                                <div className="font-medium">Todo al vencimiento</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Capital + intereses al final del plazo
                                                </div>
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                                            <RadioGroupItem value="INTERES_MENSUAL" id="mensual" />
                                            <label htmlFor="mensual" className="flex-1 cursor-pointer">
                                                <div className="font-medium">Intereses mensuales</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Intereses cada mes, capital al final
                                                </div>
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Tipo de Interés Selector */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        ¿Qué tipo de interés aplicamos?
                                        <Badge variant="outline" className="text-xs font-normal">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Nuevo
                                        </Badge>
                                    </Label>
                                    <RadioGroup value={tipoInteres} onValueChange={(v) => setTipoInteres(v as TipoInteres)}>
                                        <div className={`flex items-center space-x-2 p-3 rounded border transition-all ${tipoInteres === 'SIMPLE' ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}>
                                            <RadioGroupItem value="SIMPLE" id="simple" />
                                            <label htmlFor="simple" className="flex-1 cursor-pointer">
                                                <div className="font-medium">Interés Simple</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Fórmula básica: Capital × Tasa × Tiempo
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`flex items-center space-x-2 p-3 rounded border transition-all ${tipoInteres === 'COMPUESTO' ? 'border-emerald-400 bg-emerald-50' : 'hover:bg-gray-50'}`}>
                                            <RadioGroupItem value="COMPUESTO" id="compuesto" />
                                            <label htmlFor="compuesto" className="flex-1 cursor-pointer">
                                                <div className="font-medium flex items-center gap-2">
                                                    Interés Compuesto
                                                    <Badge className="bg-emerald-500 text-[10px]">Recomendado</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Capitaliza mensualmente (estándar bancario IFRS 9)
                                                </div>
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Preview calculation with comparison */}
                                {monto && tasaInteres && plazoMeses && (
                                    <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg border border-violet-200">
                                        <div className="text-sm text-violet-900">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-4 h-4" />
                                                <strong>Cálculo de Rendimiento</strong>
                                            </div>

                                            {/* Comparison if simple is selected */}
                                            {(() => {
                                                const comparacion = calcularComparacion()
                                                if (!comparacion) return null

                                                return (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div className={`p-2 rounded ${tipoInteres === 'SIMPLE' ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-white/50'}`}>
                                                                <div className="text-xs text-muted-foreground">Interés Simple</div>
                                                                <div className="font-semibold text-lg">
                                                                    S/ {comparacion.simple.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                            <div className={`p-2 rounded ${tipoInteres === 'COMPUESTO' ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'bg-white/50'}`}>
                                                                <div className="text-xs text-muted-foreground">Interés Compuesto</div>
                                                                <div className="font-semibold text-lg text-emerald-700">
                                                                    S/ {comparacion.compuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {comparacion.diferencia > 0 && tipoInteres === 'SIMPLE' && (
                                                            <div className="p-2 bg-amber-100 rounded text-xs text-amber-800 flex items-center gap-2">
                                                                <Info className="w-4 h-4 flex-shrink-0" />
                                                                <span>
                                                                    Con interés <strong>compuesto</strong> el inversionista ganaría
                                                                    <strong> S/ {comparacion.diferencia.toFixed(2)}</strong> más
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="mt-3 pt-3 border-t border-violet-200">
                                                            <div className="flex justify-between">
                                                                <span>Total a devolver:</span>
                                                                <span className="font-bold text-lg">
                                                                    S/ {calcularTotalDevolver().toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Vencimiento: {calcularFechaVencimiento()}
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Banking Guardrails Alerts */}
                                {(parseFloat(monto) > 20000 && modalidadPago === 'BULLET') && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start">
                                        <div className="text-xl">⚠️</div>
                                        <div>
                                            <p className="font-semibold text-amber-800 text-sm">Alerta de Liquidez</p>
                                            <p className="text-xs text-amber-700">
                                                Estás comprometiendo <strong>S/ {calcularTotalDevolver().toLocaleString('es-PE')}</strong> para el {calcularFechaVencimiento()}.
                                                ¿Consideraste pagar <em>intereses mensuales</em> para reducir el golpe final?
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {(parseFloat(tasaInteres) > 0 && (parseFloat(tasaInteres) < 4 || parseFloat(tasaInteres) > 25)) && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 items-start">
                                        <div className="text-xl">📊</div>
                                        <div>
                                            <p className="font-semibold text-blue-800 text-sm">Validación de Tasa</p>
                                            <p className="text-xs text-blue-700">
                                                La tasa de {tasaInteres}% anual es inusual (promedio mercado: 8-15%).
                                                Verifica que sea correcta para evitar pérdidas o sobrecostos.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ========== STEP 3: Bank Details + Summary ========== */}
                {step === 3 && (
                    <div className="space-y-5">
                        {/* Bank Details Toggle */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                ¿El inversionista tiene cuenta bancaria para recibir pagos?
                            </Label>
                            <RadioGroup
                                value={tieneCuentaBancaria ? 'si' : 'no'}
                                onValueChange={(v) => setTieneCuentaBancaria(v === 'si')}
                            >
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="si" id="si" />
                                        <label htmlFor="si">Sí, tiene cuenta</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="no" />
                                        <label htmlFor="no">No, se paga en efectivo</label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Bank Details Form */}
                        {tieneCuentaBancaria && (
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-2">
                                    <Label>Banco</Label>
                                    <Select value={banco} onValueChange={setBanco}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar banco" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BANCOS_PERU.map((b) => (
                                                <SelectItem key={b} value={b}>{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Número de cuenta</Label>
                                    <Input
                                        placeholder="191-123456-0-01"
                                        value={numeroCuenta}
                                        onChange={(e) => setNumeroCuenta(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CCI (20 dígitos)</Label>
                                    <Input
                                        placeholder="00219100123456001234"
                                        value={cci}
                                        onChange={(e) => setCci(e.target.value)}
                                        maxLength={20}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Fecha de Ingreso */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                📅 Fecha de Ingreso del Capital
                            </Label>
                            <Input
                                type="date"
                                value={fechaIngreso}
                                onChange={(e) => setFechaIngreso(e.target.value)}
                            />

                            {/* Quick plazo buttons for PRESTAMISTA */}
                            {tipoRelacion === 'PRESTAMISTA' && (
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Calculadora de vencimiento rápido:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: '+1 Mes', meses: 1 },
                                            { label: '+3 Meses', meses: 3 },
                                            { label: '+6 Meses', meses: 6 },
                                            { label: '+1 Año', meses: 12 },
                                            { label: '+2 Años', meses: 24 },
                                        ].map(({ label, meses }) => (
                                            <Button
                                                key={meses}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPlazoMeses(String(meses))}
                                                className={plazoMeses === String(meses) ? 'border-emerald-500 bg-emerald-50' : ''}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                    {plazoMeses && fechaIngreso && (
                                        <p className="text-sm text-emerald-600">
                                            📆 Vencimiento: {(() => {
                                                const fecha = new Date(fechaIngreso)
                                                fecha.setMonth(fecha.getMonth() + parseInt(plazoMeses))
                                                return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                                            })()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notas / Observaciones */}
                        <div className="space-y-2">
                            <Label>📝 Observaciones / Notas (Opcional)</Label>
                            <textarea
                                placeholder="Condiciones especiales, acuerdos adicionales, referencias..."
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                className="w-full min-h-[80px] p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Deposit Destination Selector (New Feature to fix 'Hole') */}
                        <div className="pt-4 border-t border-dashed space-y-3">
                            <Label className="text-base font-semibold block text-emerald-800">
                                💰 Ingreso a Caja (Dinero Nuevo)
                            </Label>
                            <div className="grid gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={registrarIngreso}
                                        onCheckedChange={(c) => setRegistrarIngreso(!!c)}
                                        id="ingreso-check"
                                    />
                                    <Label htmlFor="ingreso-check" className="font-normal cursor-pointer">
                                        Registrar el ingreso del dinero a Caja automáticamente
                                    </Label>
                                </div>

                                {registrarIngreso && (
                                    <div className="space-y-2 pl-4 border-l-2 border-emerald-500 bg-emerald-50/50 p-3 rounded-r-lg">
                                        <Label>Cuenta de Destino (¿Dónde entra la plata?)</Label>
                                        <Select value={cuentaDestinoId} onValueChange={setCuentaDestinoId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cuenta de caja/banco..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cuentasDisponibles.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.tipo === 'EFECTIVO' ? '💵' : '🏦'} {c.nombre} (S/ {Number(c.saldo).toFixed(2)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="pt-2">
                                            <Label className="text-xs">Referencia / Nro Operación (Opcional)</Label>
                                            <Input
                                                className="bg-white h-8"
                                                placeholder="Ej: Yape 999..., OP-12345, Efectivo"
                                                value={referenciaIngreso}
                                                onChange={(e) => setReferenciaIngreso(e.target.value)}
                                            />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Se creará un movimiento de "APORTE" por <strong>S/ {Number(monto).toLocaleString('es-PE')}</strong> en esta cuenta vinculado a este inversionista.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                            <div className="font-semibold text-emerald-800 flex items-center gap-2">
                                📋 Resumen de la Inversión
                            </div>
                            <div className="text-sm text-emerald-700 space-y-1">
                                <div><strong>Inversionista:</strong> {selectedPerson?.nombres}</div>
                                <div><strong>Tipo:</strong> {tipoRelacion === 'SOCIO' ? 'Socio (Equity)' : 'Prestamista (Deuda)'}</div>
                                <div><strong>Monto:</strong> S/ {parseFloat(monto || '0').toLocaleString()}</div>

                                {tipoRelacion === 'SOCIO' && (
                                    <div><strong>Participación:</strong> {porcentaje}%</div>
                                )}

                                {tipoRelacion === 'PRESTAMISTA' && (
                                    <>
                                        <div><strong>Tasa:</strong> {tasaInteres}% {tipoTasa.toLowerCase()}</div>
                                        <div><strong>Plazo:</strong> {plazoMeses} meses</div>
                                        <div><strong>Modalidad:</strong> {modalidadPago === 'BULLET' ? 'Todo al vencimiento' : 'Intereses mensuales'}</div>
                                        <div><strong>Total a devolver:</strong> S/ {calcularTotalDevolver().toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                                        <div><strong>Vencimiento:</strong> {calcularFechaVencimiento()}</div>
                                    </>
                                )}

                                <div><strong>Fecha de ingreso:</strong> {new Date(fechaIngreso).toLocaleDateString('es-PE')}</div>
                                <div><strong>Forma de pago:</strong> {tieneCuentaBancaria ? `${banco} - ${numeroCuenta}` : 'Efectivo'}</div>
                                {notas && <div><strong>Notas:</strong> {notas}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <DialogFooter className="flex justify-between sm:justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button
                            onClick={handleContinue}
                            disabled={!canContinue()}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Continuar
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Check className="w-4 h-4 mr-2" />
                            Registrar Inversión
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
