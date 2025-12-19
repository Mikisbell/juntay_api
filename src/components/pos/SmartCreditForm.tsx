"use client"
// BUILD_VERSION: 2024-12-12T03:55:00Z - Force cache invalidation

import { useState, useEffect } from "react"
import { RegistroClienteCompleto } from "@/components/business/RegistroClienteCompleto"
import { QRPhotoBridge } from "@/components/pos/QRPhotoBridge"
// import { PrintSuccessModal } from "@/components/pos/PrintSuccessModal" // Replaced by View
import { TransactionSuccessView } from "@/components/pos/TransactionSuccessView"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Camera, CheckCircle2, AlertTriangle, CalendarIcon, ShieldAlert, X, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { useQuery } from '@tanstack/react-query'
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { v4 as uuidv4 } from 'uuid'
import { crearCreditoExpress } from '@/lib/actions/creditos-actions'
import { useRxDB, useCrearCreditoLocal } from '@/lib/rxdb/hooks'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Search } from 'lucide-react'

import {
    getCategoriasOrdenadas,
    getSubcategoriasOrdenadas,
    calcularValorMercado
} from '@/lib/constants/categorias-bienes'

import {
    getMarcasPorSubcategoria,
    getPrecioFactorMarca
} from '@/lib/constants/marcas-por-subcategoria'

import { getLTVConfig, FACTOR_POR_ESTADO } from '@/lib/config/ltv-config'
import { ComboboxBienes } from '@/components/ui/combobox-bienes'
import { ItemCatalogo, getCategoriaDelSistema } from '@/lib/constants/catalogo-bienes'

interface SmartCreditFormProps {
    initialCliente?: {
        id: string
        nombre: string
    }
}

interface SelectOption {
    value: string
    label: string
}

interface MarcaOption extends SelectOption {
    precioFactor: number
}

interface ClienteRegistrado {
    id: string
    nombre_completo?: string
    nombres: string
}

const ESTADOS_BIEN = [
    { value: 'NUEVO', label: 'Nuevo (Sellado)', factor: 1.0 },
    { value: 'EXCELENTE', label: 'Excelente', factor: 0.9 },
    { value: 'BUENO', label: 'Bueno', factor: 0.8 },
    { value: 'REGULAR', label: 'Regular', factor: 0.6 },
    { value: 'MALO', label: 'Malo', factor: 0.4 }
]

const STORAGE_KEY = "smart_pos_backup_v1"

export function SmartCreditForm({ initialCliente }: SmartCreditFormProps) {
    // 1. Estado de Caja
    const { data: caja, isLoading: isLoadingCaja } = useQuery({
        queryKey: ['caja', 'estado'],
        queryFn: () => obtenerEstadoCaja(),
        staleTime: 0
    })

    const cajaAbierta = caja?.estado === 'abierta'

    // RxDB para operación offline-first
    const { isOnline, isReady: rxdbReady } = useRxDB()
    const { crearCredito: crearCreditoRxDB } = useCrearCreditoLocal()

    // Estado para evitar hydration mismatch
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // 2. Estado del Formulario
    const [step, setStep] = useState<'CLIENTE' | 'PRENDA' | 'RESUMEN'>(initialCliente ? 'PRENDA' : 'CLIENTE')
    // El ID de sesión debe ser persistente, si no hay backup, crea nuevo.
    const [sessionId, setSessionId] = useState<string>("")
    const [clienteId, setClienteId] = useState<string | null>(initialCliente?.id || null)
    const [clienteNombre, setClienteNombre] = useState<string>(initialCliente?.nombre || "")

    // 3. Estado Avanzado de Prenda
    const [categoria, setCategoria] = useState("")
    const [categoriaOtro, setCategoriaOtro] = useState("") // Texto libre si elige "otro"
    const [subcategoria, setSubcategoria] = useState("")
    const [subcategoriaOtro, setSubcategoriaOtro] = useState("") // Texto libre si categoría es "otro"
    const [marca, setMarca] = useState("")
    const [marcaOtro, setMarcaOtro] = useState("") // Texto libre si elige "otra"
    const [modelo, setModelo] = useState("")
    const [serie, setSerie] = useState("")
    const [estadoBien, setEstadoBien] = useState("BUENO")
    const [descripcion, setDescripcion] = useState("")

    // Búsqueda rápida de artículo
    const [articuloRapido, setArticuloRapido] = useState<string>("")
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<ItemCatalogo | null>(null)

    // Selectores dinámicos
    const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<SelectOption[]>([])
    const [marcasDisponibles, setMarcasDisponibles] = useState<MarcaOption[]>([])

    // 4. Estado Financiero
    const [valorMercado, setValorMercado] = useState<number>(0)
    const [montoPrestamo, setMontoPrestamo] = useState<number>(0)
    const [tasaInteres, setTasaInteres] = useState<number>(20) // Tasa mensual configurable
    const [fechaInicio, setFechaInicio] = useState<Date>(new Date()) // Fecha inicio configurable
    const [observaciones, setObservaciones] = useState("")
    const [fotos, setFotos] = useState<string[]>([])

    // 5. Detalles IA (Flexible Valuation)
    const [aiDefectos, setAiDefectos] = useState<string[]>([])
    const [aiAccesorios, setAiAccesorios] = useState<string[]>([])
    const [newDefecto, setNewDefecto] = useState("")
    const [newAccesorio, setNewAccesorio] = useState("")

    // Estado para modal de confirmación irreversible
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmChecked, setConfirmChecked] = useState(false)

    // const [restored, setRestored] = useState(false) // Unused

    const { id: initId, nombre: initNombre } = initialCliente || {}

    // === PERSISTENCIA: Cargar al Iniciar ===
    useEffect(() => {
        const backup = localStorage.getItem(STORAGE_KEY)
        if (backup) {
            try {
                const data = JSON.parse(backup)
                // Restaurar sesión ID
                setSessionId(data.sessionId || uuidv4())

                // Si no se pasó cliente inicial, intentar restaurar
                if (!initId) {
                    if (data.clienteId) {
                        setClienteId(data.clienteId)
                        setClienteNombre(data.clienteNombre)
                        setStep(data.step || 'PRENDA')
                    }
                }

                // Restaurar campos de prenda
                if (data.categoria) {
                    setCategoria(data.categoria)
                    if (data.categoriaOtro) setCategoriaOtro(data.categoriaOtro)
                    setSubcategoria(data.subcategoria)
                    if (data.subcategoriaOtro) setSubcategoriaOtro(data.subcategoriaOtro)
                    setMarca(data.marca)
                    if (data.marcaOtro) setMarcaOtro(data.marcaOtro)
                    setModelo(data.modelo)
                    setSerie(data.serie)
                    setEstadoBien(data.estadoBien)
                    setDescripcion(data.descripcion)
                    setMontoPrestamo(data.montoPrestamo)
                    setObservaciones(data.observaciones)
                    setFotos(data.fotos || [])
                    toast.info("Formulario restaurado", { description: "Se recuperaron tus datos previos." })
                }
            } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
                console.error("Error restaurando backup")
                setSessionId(uuidv4())
            }
        } else {
            setSessionId(uuidv4())
        }
    }, [initId, initNombre])

    // === PERSISTENCIA: Guardar al Cambiar ===
    useEffect(() => {
        if (!sessionId) return // Esperar a inicialización

        const stateToSave = {
            sessionId,
            step,
            clienteId,
            clienteNombre,
            categoria,
            categoriaOtro,
            subcategoria,
            subcategoriaOtro,
            marca,
            marcaOtro,
            modelo,
            serie,
            estadoBien,
            descripcion,
            montoPrestamo,
            observaciones,
            fotos
        }

        // Debounce simple o guardar directo (localStorage es sincrono y rápido para poca data)
        const timeout = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
        }, 500)

        return () => clearTimeout(timeout)

    }, [
        sessionId, step, clienteId, clienteNombre, categoria, categoriaOtro,
        subcategoria, subcategoriaOtro, marca, marcaOtro, modelo, serie,
        estadoBien, descripcion, montoPrestamo, observaciones, fotos
    ])

    const clearPersistence = () => {
        localStorage.removeItem(STORAGE_KEY)
        // Reset manual de estados si es necesario, pero usualmente recargamos pág o reseteamos estados
    }

    // EFECTO: Actualizar subcategorías
    useEffect(() => {
        if (categoria) {
            setSubcategoriasDisponibles(getSubcategoriasOrdenadas(categoria))
            // Solo resetear hijo si cambiamos padre manualmente (no al restaurar si coinciden)
            // Para simplificar, asumimos reactividad limpia.
            // Al restaurar, primero se setea categoria, corre este efecto, y luego subcategoria se mantiene? 
            // NO, este efecto correrá y limpiará subcategoria si no tenemos cuidado.
            // FIX: Verificar si la subactual es válida para la nueva cat? 
            // O mejor: Dejar que el usuario rehaga si cambia categoria activamente.
            // Pero al restaurar carga todo de golpe.
            // React batching debería manejarlo, pero agregamos chequeo
        } else {
            setSubcategoriasDisponibles([])
        }
    }, [categoria])

    // EFECTO: Actualizar marcas
    useEffect(() => {
        if (subcategoria) {
            setMarcasDisponibles(getMarcasPorSubcategoria(subcategoria).map(m => ({ ...m, precioFactor: m.precioFactor ?? 1.0 })))
        } else {
            setMarcasDisponibles([])
        }
    }, [subcategoria])

    // EFECTO: Valorización Inteligente
    useEffect(() => {
        if (categoria && subcategoria) {
            const precioFactor = marca ? getPrecioFactorMarca(subcategoria, marca) : 1.0

            const valorCalculado = calcularValorMercado({
                categoria,
                subcategoria,
                marca,
                estado: estadoBien,
                precioFactorMarca: precioFactor
            })

            setValorMercado(valorCalculado)

            // Solo sugerir préstamo si NO estamos restaurando un monto específico o si es 0
            // O si el usuario cambia parámetros críticos
            // Para evitar sobrescribir monto restaurado, chequeamos si monto es 0
            if (montoPrestamo === 0) {
                setMontoPrestamo(Math.round(valorCalculado * 0.6))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoria, subcategoria, marca, estadoBien]) // montoPrestamo intentional omission


    // Handlers
    const handleClienteRegistrado = (cliente: ClienteRegistrado) => {
        setClienteId(cliente.id)
        setClienteNombre(cliente.nombre_completo || cliente.nombres)
        setStep('PRENDA')
        toast.success("Cliente vinculado correctamente")
    }

    const handleProcesar = async () => {
        if (!clienteId) return toast.error("Falta registrar cliente")

        // Validación de categoría
        if (!categoria) return toast.error("Selecciona una categoría")
        if (categoria === 'otro' && categoriaOtro.length < 3) {
            return toast.error("Especifica la categoría (mínimo 3 caracteres)")
        }

        // Validación de subcategoría
        if (categoria === 'otro') {
            if (subcategoriaOtro.length < 3) {
                return toast.error("Especifica el tipo de artículo (mínimo 3 caracteres)")
            }
        } else if (!subcategoria) {
            return toast.error("Selecciona una subcategoría")
        }

        // Validación de marca
        if (categoria === 'otro' && marcaOtro.length < 2) {
            return toast.error("Especifica la marca (mínimo 2 caracteres)")
        }
        if (marca === 'otra' && marcaOtro.length < 2) {
            return toast.error("Especifica la marca (mínimo 2 caracteres)")
        }

        if (!descripcion && !modelo) return toast.error("Agrega una descripción o modelo")

        // Si estamos offline, guardar localmente con RxDB
        if (!isOnline && rxdbReady) {
            const descripcionCompleta = buildDescripcion()

            const result = await crearCreditoRxDB({
                cliente_id: clienteId,
                monto_prestado: montoPrestamo.toFixed(2),
                saldo_pendiente: montoPrestamo.toFixed(2),
                tasa_interes: tasaInteres.toFixed(2),
                fecha_inicio: fechaInicio.toISOString(),
                fecha_vencimiento: new Date(fechaInicio.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                estado: 'aprobado',
                estado_detallado: 'vigente',
                observaciones: `${descripcionCompleta}\n\n${observaciones}`,
            })

            if (result.success) {
                toast.success('⚡ Guardado localmente', {
                    description: 'Se sincronizará cuando vuelva la conexión'
                })
                setSuccessData({
                    codigo: result.credito?.codigo_credito || 'PENDIENTE-SYNC',
                    monto: montoPrestamo,
                    clienteNombre,
                    tasaInteres,
                    fotos,
                    fechaInicio,
                    descripcion: descripcionCompleta,
                    valorTasacion: valorMercado,
                    estado: 'PENDIENTE_SYNC',
                    creditoId: result.credito?.id
                })
                clearPersistence()
            } else {
                toast.error(result.error || 'Error al guardar localmente')
            }
            return
        }

        // Helper para construir descripción
        function buildDescripcion() {
            return `
                Categoría: ${categoria.toUpperCase()}
                Subcategoría: ${subcategoria}
                Marca: ${marca || 'No especificada'}
                Modelo: ${modelo || 'No especificado'}
                Serie: ${serie || 'S/N'}
                Estado: ${estadoBien}
                --
                ${descripcion}
            `.trim().replace(/^\s+/gm, '')
        }

        // Validaciones de monto
        if (montoPrestamo < 10) return toast.error("El monto mínimo es S/10")
        if (montoPrestamo > 50000) return toast.error("El monto máximo es S/50,000. Contacte a gerencia.")
        // Aviso si excede tasación (no bloquea)
        if (montoPrestamo > valorMercado) {
            if (!confirm(`⚠️ El préstamo (S/${montoPrestamo}) excede el valor tasado (S/${valorMercado}).\n\n¿Desea continuar bajo su criterio profesional?`)) {
                return
            }
            toast.warning(`Préstamo aprobado por encima de tasación: S/${montoPrestamo} > S/${valorMercado}`)
        }
        if (tasaInteres < 1 || tasaInteres > 50) return toast.error("La tasa debe estar entre 1% y 50%")

        if (fotos.length === 0) {
            if (!confirm("⚠️ No has subido fotos de evidencia. ¿Continuar sin fotos?")) return
        }

        // Construir descripción rica
        const descripcionCompleta = buildDescripcion()

        toast.promise(
            crearCreditoExpress({
                clienteId,
                descripcion: descripcionCompleta,
                montoPrestamo,
                valorTasacion: valorMercado,
                tasaInteres,
                fotos,
                fechaInicio: fechaInicio.toISOString(),
                observaciones
            }),
            {
                loading: cajaAbierta ? "Desembolsando efectivo..." : "Guardando solicitud...",
                success: (data) => {
                    setSuccessData({ ...data, tasaInteres, fotos, fechaInicio })
                    clearPersistence()
                    return data.mensaje || (cajaAbierta ? "¡Efectivo Desembolsado!" : "Guardado (Requiere Caja)")
                },
                error: (err) => `Error: ${err.message}`
            }
        )
    }

    // Modal Handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [successData, setSuccessData] = useState<Record<string, any> | null>(null)
    const handleReset = () => {
        clearPersistence() // LIMPIAR STORAGE AL RESETEAR
        window.location.reload()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Banner de modo offline */}
            {!isOnline && (
                <div className="lg:col-span-12">
                    <Alert className="bg-amber-50 border-amber-200">
                        <WifiOff className="w-4 h-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                <strong>Modo sin conexión:</strong> Los créditos se guardarán localmente y se sincronizarán cuando vuelva la conexión.
                            </span>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* VISTA DE ÉXITO (Reemplaza al formulario) */}
            {successData ? (
                <div className="lg:col-span-12">
                    <TransactionSuccessView
                        data={successData}
                        onReset={handleReset}
                    />
                </div>
            ) : (
                <>
                    {/* Columna Izquierda: Formulario Principal */}
                    <div className="lg:col-span-8 space-y-4 lg:space-y-6">

                        {/* Paso 1: Cliente */}
                        <Card className={`transition-all duration-300 ${step !== 'CLIENTE' ? 'opacity-50 hover:opacity-100' : 'ring-2 ring-blue-500'}`}>
                            <CardHeader className="pb-3 cursor-pointer" onClick={() => setStep('CLIENTE')}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                        Datos del Cliente
                                    </CardTitle>
                                    {clienteId && (
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {clienteNombre}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setClienteId(null)
                                                    setClienteNombre("")
                                                    setStep('CLIENTE')
                                                }}
                                                title="Cambiar cliente"
                                            >
                                                <span className="text-xs">✕</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            {step === 'CLIENTE' && (
                                <CardContent>
                                    <RegistroClienteCompleto
                                        embedded={true}
                                        onClienteRegistrado={handleClienteRegistrado}
                                        disablePersistence={true}
                                    />
                                </CardContent>
                            )}
                        </Card>

                        {/* Paso 2: Tasación Avanzada */}
                        <Card className={`transition-all duration-300 ${!clienteId ? 'opacity-40 pointer-events-none' : ''} ${step === 'PRENDA' ? 'ring-2 ring-amber-500' : ''}`}>
                            <CardHeader className="pb-3 cursor-pointer" onClick={() => clienteId && setStep('PRENDA')}>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                    Tasación y Prenda
                                </CardTitle>
                                <p className="text-sm text-slate-500 ml-10">
                                    Complete los detalles del artículo para una valoración automática
                                </p>
                            </CardHeader>

                            {(step === 'PRENDA' || step === 'RESUMEN') && (
                                <CardContent className="space-y-6">

                                    {/* Búsqueda Rápida de Artículo (Fuzzy Search) */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Search className="h-4 w-4" />
                                            Búsqueda Rápida de Artículo
                                        </Label>
                                        <ComboboxBienes
                                            value={articuloRapido}
                                            onSelect={(item) => {
                                                if (item) {
                                                    setArticuloSeleccionado(item)
                                                    setArticuloRapido(item.nombre)
                                                    // Auto-llenar campos
                                                    setDescripcion(item.nombre)
                                                    // Auto-llenar categoría del sistema
                                                    const catSistema = getCategoriaDelSistema(item.categoria)
                                                    setCategoria(catSistema)

                                                    // Auto-llenar subcategoría si existe en el mapeo
                                                    if (item.subcategoriaSistema) {
                                                        // Forzar actualización inmediata de opciones para evitar que el Select limpie el valor
                                                        setSubcategoriasDisponibles(getSubcategoriasOrdenadas(catSistema))
                                                        setSubcategoria(item.subcategoriaSistema)
                                                    } else {
                                                        setSubcategoria('')
                                                    }

                                                    // Limpiar campos "otro" ya que venimos del catálogo
                                                    setCategoriaOtro('')
                                                    setSubcategoriaOtro('')
                                                    setMarcaOtro('')
                                                } else {
                                                    setArticuloSeleccionado(null)
                                                    setArticuloRapido('')
                                                }
                                            }}
                                            onCustomValue={(val) => {
                                                setArticuloRapido(val)
                                                setDescripcion(val)
                                                // Para valores personalizados, usar categoría "otro"
                                                setCategoria('otro')
                                                setCategoriaOtro(val)
                                            }}
                                            placeholder="Escribe para buscar: celular, laptop, anillo..."
                                        />
                                        {articuloSeleccionado && (
                                            <p className="text-xs text-emerald-600">
                                                ✓ {articuloSeleccionado.nombre} → Categoría: {getCategoriaDelSistema(articuloSeleccionado.categoria)}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400">
                                            Escribe al menos 2 caracteres para buscar en +120 artículos catalogados
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-muted-foreground">
                                                O selección manual
                                            </span>
                                        </div>
                                    </div>

                                    {/* Selector de Categorías - GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Categoría</Label>
                                            <div className="flex gap-2">
                                                <Select value={categoria} onValueChange={(v) => {
                                                    setCategoria(v)
                                                    if (v !== 'otro') setCategoriaOtro('')
                                                }}>
                                                    <SelectTrigger className="h-12 bg-slate-50 flex-1">
                                                        <SelectValue placeholder="Seleccione categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getCategoriasOrdenadas().map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value}>
                                                                <span className="flex items-center gap-2">
                                                                    <span>{cat.icon}</span>
                                                                    <span>{cat.label}</span>
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="otro">
                                                            <span className="flex items-center gap-2">
                                                                <span>➕</span>
                                                                <span>Otro bien...</span>
                                                            </span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {categoria === 'otro' && (
                                                    <Input
                                                        value={categoriaOtro}
                                                        onChange={(e) => setCategoriaOtro(e.target.value)}
                                                        placeholder="Especifique..."
                                                        className="h-12 flex-1"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Subcategoría</Label>
                                            {categoria === 'otro' ? (
                                                <Input
                                                    value={subcategoriaOtro}
                                                    onChange={(e) => setSubcategoriaOtro(e.target.value)}
                                                    placeholder="Tipo de artículo..."
                                                    className="h-12 bg-slate-50"
                                                />
                                            ) : (
                                                <Select
                                                    value={subcategoria}
                                                    onValueChange={setSubcategoria}
                                                    disabled={!categoria}
                                                >
                                                    <SelectTrigger className="h-12 bg-slate-50">
                                                        <SelectValue placeholder={!categoria ? "Primero elija categoría" : "Seleccione subcategoría"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subcategoriasDisponibles.map(sub => (
                                                            <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detalles de Marca y Estado */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Marca</Label>
                                            {categoria === 'otro' ? (
                                                <Input
                                                    value={marcaOtro}
                                                    onChange={(e) => setMarcaOtro(e.target.value)}
                                                    placeholder="Marca del artículo..."
                                                />
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={marca}
                                                        onValueChange={(v) => {
                                                            setMarca(v)
                                                            if (v !== 'otra') setMarcaOtro('')
                                                        }}
                                                        disabled={!subcategoriasDisponibles.length}
                                                    >
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Marca" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {marcasDisponibles.map(m => (
                                                                <SelectItem key={m.value} value={m.value}>
                                                                    {m.label} {m.precioFactor > 1 && '⭐'}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="otra">Otra / Genérica</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {marca === 'otra' && (
                                                        <Input
                                                            value={marcaOtro}
                                                            onChange={(e) => setMarcaOtro(e.target.value)}
                                                            placeholder="Especifique..."
                                                            className="flex-1"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Input
                                                placeholder="Ej: S24 Ultra"
                                                value={modelo}
                                                onChange={e => setModelo(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Serie / IMEI</Label>
                                            <Input
                                                placeholder="Opcional"
                                                value={serie}
                                                onChange={e => setSerie(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Estado del Bien con Visual Selectors */}
                                    <div className="space-y-2">
                                        <Label>Estado Físico</Label>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {ESTADOS_BIEN.map((est) => (
                                                <button
                                                    key={est.value}
                                                    type="button"
                                                    onClick={() => setEstadoBien(est.value)}
                                                    className={`
                                                px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap
                                                ${estadoBien === est.value
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                                            `}
                                                >
                                                    {est.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 6. Detalles de Tasación (IA + Manual) */}
                                    <div className="space-y-3 bg-slate-50/50 p-3 rounded-lg border border-dashed border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles de Tasación</Label>
                                            {/* Badge count si hay algo */}
                                            {(aiDefectos.length + aiAccesorios.length) > 0 && (
                                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4">
                                                    {aiDefectos.length + aiAccesorios.length} detectados
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Defectos (Impacto Negativo) */}
                                            <div className="space-y-2">
                                                <Label className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Defectos / Daños
                                                </Label>
                                                <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-white rounded border border-red-100">
                                                    {aiDefectos.map((def, i) => (
                                                        <Badge key={i} variant="outline" className="text-red-600 border-red-200 bg-red-50 pr-1 gap-1">
                                                            {def}
                                                            <button onClick={() => setAiDefectos(prev => prev.filter((_, idx) => idx !== i))} className="hover:bg-red-200 rounded-full p-0.5">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    <div className="flex items-center gap-1 input-wrapper">
                                                        <Plus className="w-3 h-3 text-slate-400" />
                                                        <input
                                                            className="text-xs bg-transparent border-none focus:outline-none w-24 placeholder:text-slate-300"
                                                            placeholder="Agregar..."
                                                            value={newDefecto}
                                                            onChange={e => setNewDefecto(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && newDefecto.trim()) {
                                                                    e.preventDefault()
                                                                    setAiDefectos(prev => [...prev, newDefecto.trim()])
                                                                    setNewDefecto('')
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accesorios (Impacto Positivo) */}
                                            <div className="space-y-2">
                                                <Label className="text-xs text-blue-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Accesorios / Extras
                                                </Label>
                                                <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-white rounded border border-blue-100">
                                                    {aiAccesorios.map((acc, i) => (
                                                        <Badge key={i} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 pr-1 gap-1">
                                                            {acc}
                                                            <button onClick={() => setAiAccesorios(prev => prev.filter((_, idx) => idx !== i))} className="hover:bg-blue-200 rounded-full p-0.5">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    <div className="flex items-center gap-1 input-wrapper">
                                                        <Plus className="w-3 h-3 text-slate-400" />
                                                        <input
                                                            className="text-xs bg-transparent border-none focus:outline-none w-24 placeholder:text-slate-300"
                                                            placeholder="Agregar..."
                                                            value={newAccesorio}
                                                            onChange={e => setNewAccesorio(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && newAccesorio.trim()) {
                                                                    e.preventDefault()
                                                                    setAiAccesorios(prev => [...prev, newAccesorio.trim()])
                                                                    setNewAccesorio('')
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción Adicional */}
                                    <div className="space-y-2">
                                        <Label>Descripción y Observaciones</Label>
                                        <Textarea
                                            placeholder="Detalles adicionales, accesorios incluidos, observaciones del tasador..."
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                            className="resize-none h-20"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Simulador de Préstamo */}
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <Label className="text-base">Monto del Préstamo</Label>
                                                <p className="text-xs text-slate-500">
                                                    Valor Mercado Sugerido: <span className="font-semibold text-emerald-600">S/ {valorMercado}</span>
                                                </p>
                                            </div>
                                            {/* Input manual del monto */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-blue-700">S/</span>
                                                <Input
                                                    type="number"
                                                    value={montoPrestamo}
                                                    onChange={(e) => setMontoPrestamo(parseFloat(e.target.value) || 0)}
                                                    className="w-28 text-2xl font-bold text-center text-blue-700 border-blue-200 bg-white"
                                                    min={0}
                                                    step={10}
                                                />
                                            </div>
                                        </div>

                                        {/* Slider visual */}
                                        <Slider
                                            value={[montoPrestamo]}
                                            max={valorMercado * 1.5 || 5000} // Permitir sobretasa manual
                                            step={10}
                                            onValueChange={(vals) => setMontoPrestamo(vals[0])}
                                            className="py-4"
                                        />

                                        {/* Botones de preajuste rápido */}
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="text-xs text-slate-500 self-center">Rápido:</span>
                                            {[100, 200, 300, 500, 1000, 2000].map((monto) => (
                                                <Button
                                                    key={monto}
                                                    type="button"
                                                    variant={montoPrestamo === monto ? "default" : "outline"}
                                                    size="sm"
                                                    className={`text-xs ${montoPrestamo === monto ? 'bg-blue-600' : ''}`}
                                                    onClick={() => setMontoPrestamo(monto)}
                                                >
                                                    S/{monto}
                                                </Button>
                                            ))}
                                        </div>

                                        {/* Selector de Tasa de Interés */}
                                        <div className="space-y-2">
                                            <Label className="text-sm">Tasa de Interés Mensual</Label>
                                            <div className="flex gap-2 items-center">
                                                {[15, 18, 20, 25].map((tasa) => (
                                                    <Button
                                                        key={tasa}
                                                        type="button"
                                                        variant={tasaInteres === tasa ? "default" : "outline"}
                                                        size="sm"
                                                        className={tasaInteres === tasa ? "bg-blue-600" : ""}
                                                        onClick={() => setTasaInteres(tasa)}
                                                    >
                                                        {tasa}%
                                                    </Button>
                                                ))}
                                                {/* Input libre para porcentaje personalizado */}
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Input
                                                        type="number"
                                                        value={tasaInteres}
                                                        onChange={(e) => setTasaInteres(parseFloat(e.target.value) || 0)}
                                                        className="w-16 text-center font-bold"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                    />
                                                    <span className="font-bold">%</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400">Cliente puntual: 15-18% | Normal: 20% | Nuevo/Riesgo: 25% | O escribe otro valor</p>
                                        </div>

                                        {/* Selector de Fecha de Inicio */}
                                        <div className="space-y-2">
                                            <Label className="text-sm flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-blue-600" />
                                                Fecha de Inicio del Crédito
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                                                        <span className="font-semibold text-blue-800">
                                                            {format(fechaInicio, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                                                        </span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={fechaInicio}
                                                        onSelect={(date) => date && setFechaInicio(date)}
                                                        disabled={(date) => date > new Date() || date < subDays(new Date(), 5)}
                                                        initialFocus
                                                        locale={es}
                                                        className="rounded-md border"
                                                    />
                                                    <div className="p-2 border-t bg-slate-50 text-center">
                                                        <p className="text-xs text-slate-500">
                                                            📅 Solo puedes seleccionar hasta 5 días atrás
                                                        </p>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <p className="text-[10px] text-slate-400">Por defecto es hoy. Cambia solo si el préstamo es de días anteriores.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-[10px] text-slate-400 uppercase">Interés (30 días)</p>
                                                <p className="font-semibold text-slate-700">S/ {(montoPrestamo * tasaInteres / 100).toFixed(2)}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded border">
                                                <p className="text-[10px] text-slate-400 uppercase">Total a Pagar</p>
                                                <p className="font-semibold text-emerald-600">S/ {(montoPrestamo * (1 + tasaInteres / 100)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Bridge */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Camera className="w-4 h-4" />
                                            Evidencia Fotográfica (Móvil)
                                        </Label>
                                        {/* Pasamos el sessionId PERSISTIDO */}
                                        {sessionId && (
                                            <QRPhotoBridge
                                                sessionId={sessionId}
                                                onPhotosUploaded={setFotos}
                                                onAnalysisComplete={(analysis) => {
                                                    if (analysis) {
                                                        // Auto-rellenar campos básicos
                                                        if (analysis.categoria) setCategoria(analysis.categoria)
                                                        if (analysis.marca) setMarca(analysis.marca)
                                                        if (analysis.modelo) setModelo(analysis.modelo)
                                                        if (analysis.estadoVisual) setEstadoBien(analysis.estadoVisual)
                                                        if (analysis.subcategoria) setSubcategoria(analysis.subcategoria)

                                                        // Auto-rellenar Detalles Flexibles (Acumulativo)
                                                        if (analysis.detalles?.defectos) {
                                                            setAiDefectos(prev => Array.from(new Set([...prev, ...(analysis.detalles?.defectos || [])])))
                                                        }
                                                        if (analysis.detalles?.accesorios) {
                                                            setAiAccesorios(prev => Array.from(new Set([...prev, ...(analysis.detalles?.accesorios || [])])))
                                                        }

                                                        // Construir descripción narrativa
                                                        if (analysis.observaciones?.length) {
                                                            setDescripcion(prev =>
                                                                prev ? `${prev} | IA: ${analysis.observaciones?.join(', ')}`
                                                                    : `IA: ${analysis.observaciones?.join(', ')}`
                                                            )
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Columna Derecha: Resumen y Acción */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="lg:sticky lg:top-20 border-2 border-slate-200 shadow-xl">
                            <CardHeader className="bg-slate-50 border-b py-3 lg:py-4">
                                <CardTitle className="text-base lg:text-lg">Resumen Operación</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 lg:pt-6 space-y-4 lg:space-y-6">

                                {/* Totales */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Cliente:</span>
                                        <span className="font-medium truncate max-w-[150px]">{clienteNombre || '--'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Artículo:</span>
                                        <span className="font-medium truncate max-w-[150px]">{subcategoria || '--'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Fotos:</span>
                                        <span className="font-medium">{fotos.length} adjuntas</span>
                                    </div>

                                    {/* Desglose LTV (Transparencia de cálculo) */}
                                    {valorMercado > 0 && (() => {
                                        const ltvConfig = getLTVConfig(categoria || 'default')
                                        const factorEstado = FACTOR_POR_ESTADO[estadoBien] || 0.9
                                        const ltvAjustado = Math.round(ltvConfig.sugerido * factorEstado)
                                        const montoSugerido = Math.round(valorMercado * (ltvAjustado / 100))

                                        return (
                                            <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs border border-slate-200">
                                                <p className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Desglose del Cálculo</p>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Valor Mercado Base:</span>
                                                    <span className="font-mono">S/ {valorMercado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">LTV Categoría ({categoria || '-'}):</span>
                                                    <span className="font-mono">{ltvConfig.sugerido}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Factor Estado ({estadoBien}):</span>
                                                    <span className="font-mono">× {Math.round(factorEstado * 100)}%</span>
                                                </div>
                                                <div className="flex justify-between text-emerald-600 pt-1 border-t border-dashed font-medium">
                                                    <span>LTV Ajustado ({ltvAjustado}%):</span>
                                                    <span className="font-mono">S/ {montoSugerido.toLocaleString('es-PE')}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    Rango permitido: {ltvConfig.minimo}% - {ltvConfig.maximo}%
                                                </div>
                                                {montoPrestamo > valorMercado && (
                                                    <div className="flex items-center gap-1 text-amber-600 pt-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>Préstamo excede tasación</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })()}

                                    <div className="flex justify-between items-end pt-3 border-t mt-2">
                                        <span className="font-bold text-slate-800 text-sm">A Desembolsar:</span>
                                        <span className="text-2xl lg:text-3xl font-bold text-emerald-600">
                                            S/ {montoPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón Acción - Abre modal de confirmación */}
                                <Button
                                    className="w-full h-12 lg:h-14 text-base lg:text-lg shadow-md transition-all bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02]"
                                    disabled={!clienteId || montoPrestamo <= 0}
                                    onClick={() => {
                                        // Validaciones previas
                                        if (!clienteId) return toast.error("Falta registrar cliente")
                                        if (!categoria || !subcategoria) return toast.error("Completa la categoría de la prenda")
                                        if (!descripcion && !modelo) return toast.error("Agrega una descripción o modelo")
                                        if (montoPrestamo < 10) return toast.error("El monto mínimo es S/10")
                                        if (montoPrestamo > 50000) return toast.error("El monto máximo es S/50,000")
                                        if (tasaInteres < 1 || tasaInteres > 50) return toast.error("La tasa debe estar entre 1% y 50%")
                                        // Abrir modal de confirmación
                                        setConfirmChecked(false)
                                        setShowConfirmModal(true)
                                    }}
                                >
                                    <span className="flex flex-col items-center leading-tight">
                                        <span className="font-bold flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 lg:w-5 lg:h-5" /> PROCESAR EMPEÑO
                                        </span>
                                        <span className="text-[9px] lg:text-[10px] opacity-90 font-normal">
                                            Crear contrato + Imprimir documentos
                                        </span>
                                    </span>
                                </Button>

                                {/* Modal de Confirmación Irreversible */}
                                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2 text-amber-700">
                                                <ShieldAlert className="w-5 h-5" />
                                                Confirmar Operación
                                            </DialogTitle>
                                            <DialogDescription className="text-slate-600">
                                                Esta operación <strong>no puede revertirse</strong>. Verifica los datos antes de continuar.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-3 py-4">
                                            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm border">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Cliente:</span>
                                                    <span className="font-medium">{clienteNombre}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Artículo:</span>
                                                    <span className="font-medium">{marca ? `${marca} ${modelo || ''}`.trim() : subcategoria}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Valor Tasación:</span>
                                                    <span className="font-mono">S/ {valorMercado.toLocaleString('es-PE')}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between text-base font-bold">
                                                    <span>A Desembolsar:</span>
                                                    <span className="text-emerald-600">S/ {montoPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Tasa/mes:</span>
                                                    <span>{tasaInteres}%</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                <Checkbox
                                                    id="confirm-irreversible"
                                                    checked={confirmChecked}
                                                    onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                                                />
                                                <label htmlFor="confirm-irreversible" className="text-sm text-amber-800 cursor-pointer leading-tight">
                                                    Confirmo que los datos son correctos y el cliente ha firmado el contrato físico.
                                                </label>
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2">
                                            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                                                Cancelar
                                            </Button>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                disabled={!confirmChecked}
                                                onClick={() => {
                                                    setShowConfirmModal(false)
                                                    handleProcesar()
                                                }}
                                            >
                                                Confirmar y Desembolsar
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Advertencia de caja cerrada - solo se muestra en cliente */}
                                {isMounted && !isLoadingCaja && !cajaAbierta && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg animate-in fade-in duration-300">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>
                                            La caja está cerrada. El crédito se guardará como <strong>aprobado</strong> pero el dinero no saldrá hasta que abras caja.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de cancelar y limpiar todo?')) {
                                            handleReset()
                                            toast.info("Operación cancelada")
                                        }
                                    }}
                                >
                                    Cancelar Operación
                                </Button>

                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
