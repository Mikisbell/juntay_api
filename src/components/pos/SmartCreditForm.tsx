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
import { DollarSign, Package, Camera, CheckCircle2, AlertTriangle, RefreshCw, CalendarIcon } from "lucide-react"
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
import { Wifi, WifiOff } from 'lucide-react'

// Imports para lógica de categorías
import {
    CATEGORIAS_BIENES,
    getCategoriasOrdenadas,
    getSubcategoriasOrdenadas,
    calcularValorMercado
} from '@/lib/constants/categorias-bienes'

import {
    getMarcasPorSubcategoria,
    getPrecioFactorMarca
} from '@/lib/constants/marcas-por-subcategoria'

interface SmartCreditFormProps {
    initialCliente?: {
        id: string
        nombre: string
    }
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
    const { crearCredito: crearCreditoRxDB, isCreating: isCreatingLocal } = useCrearCreditoLocal()

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
    const [subcategoria, setSubcategoria] = useState("")
    const [marca, setMarca] = useState("")
    const [modelo, setModelo] = useState("")
    const [serie, setSerie] = useState("")
    const [estadoBien, setEstadoBien] = useState("BUENO")
    const [descripcion, setDescripcion] = useState("")

    // Selectores dinámicos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [marcasDisponibles, setMarcasDisponibles] = useState<any[]>([])

    // 4. Estado Financiero
    const [valorMercado, setValorMercado] = useState<number>(0)
    const [montoPrestamo, setMontoPrestamo] = useState<number>(0)
    const [tasaInteres, setTasaInteres] = useState<number>(20) // Tasa mensual configurable
    const [fechaInicio, setFechaInicio] = useState<Date>(new Date()) // Fecha inicio configurable
    const [observaciones, setObservaciones] = useState("")
    const [fotos, setFotos] = useState<string[]>([])
    const [restored, setRestored] = useState(false)

    // === PERSISTENCIA: Cargar al Iniciar ===
    useEffect(() => {
        const backup = localStorage.getItem(STORAGE_KEY)
        if (backup) {
            try {
                const data = JSON.parse(backup)
                // Restaurar sesión ID
                setSessionId(data.sessionId || uuidv4())

                // Si no se pasó cliente inicial, intentar restaurar
                if (!initialCliente) {
                    if (data.clienteId) {
                        setClienteId(data.clienteId)
                        setClienteNombre(data.clienteNombre)
                        setStep(data.step || 'PRENDA')
                    }
                }

                // Restaurar campos de prenda
                if (data.categoria) {
                    setCategoria(data.categoria)
                    setSubcategoria(data.subcategoria)
                    setMarca(data.marca)
                    setModelo(data.modelo)
                    setSerie(data.serie)
                    setEstadoBien(data.estadoBien)
                    setDescripcion(data.descripcion)
                    setMontoPrestamo(data.montoPrestamo)
                    setObservaciones(data.observaciones)
                    setFotos(data.fotos || [])
                    setRestored(true)
                    toast.info("Formulario restaurado", { description: "Se recuperaron tus datos previos." })
                }
            } catch (e) {
                console.error("Error restaurando backup", e)
                setSessionId(uuidv4())
            }
        } else {
            setSessionId(uuidv4())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // === PERSISTENCIA: Guardar al Cambiar ===
    useEffect(() => {
        if (!sessionId) return // Esperar a inicialización

        const stateToSave = {
            sessionId,
            step,
            clienteId,
            clienteNombre,
            categoria,
            subcategoria,
            marca,
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
        sessionId, step, clienteId, clienteNombre, categoria, subcategoria,
        marca, modelo, serie, estadoBien, descripcion, montoPrestamo, observaciones, fotos
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
            setMarcasDisponibles(getMarcasPorSubcategoria(subcategoria))
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
    }, [categoria, subcategoria, marca, estadoBien]) // montoPrestamo fuera de deps


    // Handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClienteRegistrado = (cliente: any) => {
        setClienteId(cliente.id)
        setClienteNombre(cliente.nombre_completo || cliente.nombres)
        setStep('PRENDA')
        toast.success("Cliente vinculado correctamente")
    }

    const handleProcesar = async () => {
        if (!clienteId) return toast.error("Falta registrar cliente")
        if (!categoria || !subcategoria) return toast.error("Completa la categoría de la prenda")
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
                valorTasacion: valorMercado, // Valor real del bien
                tasaInteres,                  // Tasa configurable del frontend
                fotos,
                fechaInicio: fechaInicio.toISOString(),
                observaciones
            }),
            {
                loading: cajaAbierta ? "Desembolsando efectivo..." : "Guardando solicitud...",
                success: (data) => {
                    setSuccessData({ ...data, tasaInteres, fotos, fechaInicio }) // Incluir tasa, fotos y fecha para impresión
                    clearPersistence() // LIMPIAR STORAGE AL COMPLETAR
                    return data.mensaje || (cajaAbierta ? "¡Efectivo Desembolsado!" : "Guardado (Requiere Caja)")
                },
                error: (err) => `Error: ${err.message}`
            }
        )
    }

    // Modal Handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [successData, setSuccessData] = useState<any>(null)
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

                                    {/* Selector de Categorías - GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Categoría</Label>
                                            <Select value={categoria} onValueChange={setCategoria}>
                                                <SelectTrigger className="h-12 bg-slate-50">
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
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Subcategoría</Label>
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
                                        </div>
                                    </div>

                                    {/* Detalles de Marca y Estado */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Marca</Label>
                                            <Select
                                                value={marca}
                                                onValueChange={setMarca}
                                                disabled={!subcategoriasDisponibles.length}
                                            >
                                                <SelectTrigger>
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
                                    <div className="flex justify-between items-end pt-3 border-t mt-2">
                                        <span className="font-bold text-slate-800 text-sm">A Desembolsar:</span>
                                        <span className="text-2xl lg:text-3xl font-bold text-emerald-600">
                                            S/ {montoPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón Acción - Siempre igual para evitar hydration mismatch */}
                                <Button
                                    className="w-full h-12 lg:h-14 text-base lg:text-lg shadow-md transition-all bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02]"
                                    disabled={!clienteId || montoPrestamo <= 0}
                                    onClick={handleProcesar}
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
