'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sleep } from '@/lib/utils/performance'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tasacionSchema, TasacionFormData } from '@/lib/validators/empeno-schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { addDays, addMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'

// Importar sistema de categorías jerárquico inteligente
import {
    CATEGORIAS_BIENES,
    getCategoriaConfig,
    getSubcategoriaConfig,
    getCategoriasOrdenadas,
    getSubcategoriasOrdenadas,
    calcularValorMercado,
    FACTORES_ESTADO
} from '@/lib/constants/categorias-bienes'

import {
    getMarcasPorSubcategoria,
    getPrecioFactorMarca
} from '@/lib/constants/marcas-por-subcategoria'

const ESTADOS = [
    { value: 'NUEVO', label: 'Nuevo (Sellado/Sin usar)' },
    { value: 'EXCELENTE', label: 'Excelente (Como nuevo)' },
    { value: 'BUENO', label: 'Bueno (Mínimo desgaste)' },
    { value: 'REGULAR', label: 'Regular (Uso visible)' },
    { value: 'MALO', label: 'Malo (Detalles/Fallas)' }
]

export default function TasacionStep() {
    const {
        detallesGarantia,
        setDetallesGarantia,
        montoPrestamo,
        setMontoPrestamo,
        tasaInteres,
        setTasaInteres,
        setNumeroCuotas,
        frecuenciaPago,
        setFrecuenciaPago,
        plazo
    } = useCotizador()

    const form = useForm<TasacionFormData>({
        resolver: zodResolver(tasacionSchema),
        defaultValues: {
            categoria: detallesGarantia.categoria,
            subcategoria: '', // Inicializar vacío, se llenará dinámicamente
            marcaBien: '', // Marca del bien (Apple, Samsung, etc.)
            marca: detallesGarantia.marca,
            modelo: detallesGarantia.modelo,
            serie: detallesGarantia.serie,
            estado_bien: (detallesGarantia.estado_bien || 'BUENO') as 'NUEVO' | 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO',
            descripcion: detallesGarantia.descripcion,
            valorMercado: detallesGarantia.valorMercado,
            montoPrestamo: Math.max(montoPrestamo || 0, 100), // Asegurar que el slider empiece en un valor válido (min: 100)
            tasaInteres: tasaInteres || 20, // Default 20%
            fotos: detallesGarantia.fotos || []
        },
        mode: 'onChange'
    })

    // Watch specific fields for sync (optimized)
    const watchedCategoria = useWatch({ control: form.control, name: 'categoria' })
    const watchedMarca = useWatch({ control: form.control, name: 'marca' })
    const watchedModelo = useWatch({ control: form.control, name: 'modelo' })
    const watchedSerie = useWatch({ control: form.control, name: 'serie' })
    const watchedEstado = useWatch({ control: form.control, name: 'estado_bien' })
    const watchedDescripcion = useWatch({ control: form.control, name: 'descripcion' })
    const watchedValorMercado = useWatch({ control: form.control, name: 'valorMercado' })
    const watchedFotos = useWatch({ control: form.control, name: 'fotos' })
    const watchedMontoPrestamo = useWatch({ control: form.control, name: 'montoPrestamo' })
    const watchedTasaInteres = useWatch({ control: form.control, name: 'tasaInteres' })

    // Sync to context only when values actually change
    useEffect(() => {
        if (watchedCategoria !== undefined) {
            setDetallesGarantia({
                categoria: watchedCategoria,
                marca: watchedMarca || '',
                modelo: watchedModelo || '',
                serie: watchedSerie || '',
                estado_bien: watchedEstado || 'BUENO',
                descripcion: watchedDescripcion || '',
                valorMercado: watchedValorMercado || 0,
                fotos: watchedFotos || []
            })
        }
    }, [watchedCategoria, watchedMarca, watchedModelo, watchedSerie, watchedEstado, watchedDescripcion, watchedValorMercado, watchedFotos, setDetallesGarantia])

    useEffect(() => {
        if (watchedMontoPrestamo) setMontoPrestamo(watchedMontoPrestamo)
    }, [watchedMontoPrestamo, setMontoPrestamo])

    useEffect(() => {
        if (watchedTasaInteres) setTasaInteres(watchedTasaInteres)
    }, [watchedTasaInteres, setTasaInteres])

    // Estados adicionales para sistema jerárquico
    const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<{ value: string; label: string }[]>([])
    const [marcasDisponibles, setMarcasDisponibles] = useState<{ value: string; label: string; precioFactor?: number }[]>([])

    // Watch para subcategoría y marca
    const watchedSubcategoria = useWatch({ control: form.control, name: 'subcategoria' })
    const watchedMarcaBien = useWatch({ control: form.control, name: 'marcaBien' })

    // Actualizar subcategorías cuando cambia la categoría
    useEffect(() => {
        if (watchedCategoria) {
            const subcats = getSubcategoriasOrdenadas(watchedCategoria)
            setSubcategoriasDisponibles(subcats)
            // Resetear subcategoría y marca cuando cambia la categoría
            form.setValue('subcategoria', '')
            form.setValue('marcaBien', '')
        } else {
            setSubcategoriasDisponibles([])
        }
    }, [watchedCategoria, form])

    // Actualizar marcas cuando cambia la subcategoría
    useEffect(() => {
        if (watchedSubcategoria) {
            const marcas = getMarcasPorSubcategoria(watchedSubcategoria)
            setMarcasDisponibles(marcas)
            // Resetear marca cuando cambia la subcategoría
            form.setValue('marcaBien', '')
        } else {
            setMarcasDisponibles([])
        }
    }, [watchedSubcategoria, form])

    // 🏦 VALORIZACIÓN INTELIGENTE AUTOMÁTICA
    // Considera: Categoría → Subcategoría → Marca → Estado
    // Factores especiales: Año (vehículos), Área (inmuebles), Peso/Quilates (joyas)
    useEffect(() => {
        if (watchedCategoria && watchedSubcategoria && watchedEstado) {
            // Obtener factor de precio de la marca (si está seleccionada)
            const precioFactorMarca = watchedMarcaBien ?
                getPrecioFactorMarca(watchedSubcategoria, watchedMarcaBien) :
                1.0

            // Calcular valor de mercado usando función inteligente
            const valorCalculado = calcularValorMercado({
                categoria: watchedCategoria,
                subcategoria: watchedSubcategoria,
                marca: watchedMarcaBien,
                estado: watchedEstado,
                precioFactorMarca: precioFactorMarca
                // TODO: Agregar año, área, peso, quilates cuando implementemos campos específicos
            })

            form.setValue('valorMercado', valorCalculado)

            // Toast informativo
            const categoriaConfig = getCategoriaConfig(watchedCategoria)
            const subcatConfig = getSubcategoriaConfig(watchedCategoria, watchedSubcategoria)

            toast.info(`💰 Valor de mercado: S/ ${valorCalculado.toLocaleString()}`, {
                description: `${categoriaConfig?.icon} ${subcatConfig?.label} en estado ${watchedEstado}`
            })
        }
    }, [watchedCategoria, watchedSubcategoria, watchedMarcaBien, watchedEstado, form])

    const [previews, setPreviews] = useState<string[]>(detallesGarantia.fotos || [])
    const [uploading, setUploading] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const supabase = createClient()
        const newUrls: string[] = []

        try {
            for (const file of Array.from(files)) {
                // Validar tamaño (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`El archivo ${file.name} excede 5MB`)
                    continue
                }

                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `garantias/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('garantias')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error('Error uploading:', uploadError)
                    toast.error(`Error al subir ${file.name}`)
                    continue
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('garantias')
                    .getPublicUrl(filePath)

                newUrls.push(publicUrl)
            }

            if (newUrls.length > 0) {
                const updatedPhotos = [...previews, ...newUrls].slice(0, 10)
                setPreviews(updatedPhotos)
                form.setValue('fotos', updatedPhotos, { shouldValidate: true })
                toast.success(`${newUrls.length} foto(s) subida(s) correctamente`)
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Error inesperado al subir fotos')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleRemoveFoto = (index: number) => {
        const updatedPhotos = previews.filter((_, i) => i !== index)
        setPreviews(updatedPhotos)
        form.setValue('fotos', updatedPhotos, { shouldValidate: true })
    }

    // 🔥 SOLUCIÓN: Usar useWatch para leer valores del formulario en tiempo real (SIN defaultValue para que lea el valor real)
    const watchedMonto = useWatch({ control: form.control, name: 'montoPrestamo' })
    const watchedTasa = useWatch({ control: form.control, name: 'tasaInteres' })

    // Días por frecuencia de pago
    const diasPorFrecuencia = {
        'DIARIO': 1,
        'SEMANAL': 7,
        'QUINCENAL': 14,
        'TRES_SEMANAS': 21,
        'MENSUAL': 30
    }

    // 💰 CÁLCULOS FINANCIEROS CORRECTOS (Interés proporcional al período)
    // La tasa ingresada es MENSUAL (30 días base)
    // Fórmula: Interés = Monto × (Tasa% / 100) × (Días de frecuencia / 30)

    const monto = watchedMonto || 0
    const tasaMensual = watchedTasa || 0
    const diasFrecuencia = diasPorFrecuencia[frecuenciaPago]

    // Interés proporcional al período seleccionado
    const interesesPorPeriodo = monto * (tasaMensual / 100) * (diasFrecuencia / 30)

    // Total a pagar por período
    const totalPagarPorPeriodo = monto + interesesPorPeriodo

    // Interés mensual completo (para mostrar en resumen)
    const interesesMensual = monto * (tasaMensual / 100)
    const totalPagarMensual = monto + interesesMensual

    // Cuota por periodo (asumiendo pago único al final del periodo seleccionado)
    const cuotaPorPeriodo = totalPagarPorPeriodo

    return (
        <Form {...form}>
            <form className="space-y-4 max-w-full">
                {/* Detalles del Bien - DISEÑO PREMIUM */}
                <Card className="border-0 shadow-lg overflow-hidden mb-8">
                    <div className="bg-slate-900 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Camera className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Detalles del Bien</h3>
                                <p className="text-slate-400 text-xs">Características y estado del artículo</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                            {/* COLUMNA IZQUIERDA: CARACTERÍSTICAS PRINCIPALES */}
                            <div className="lg:col-span-7 p-6 space-y-6">

                                {/* NIVEL 1 & 2: CATEGORÍA Y SUBCATEGORÍA */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="categoria"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Categoría</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                                            <SelectValue placeholder="Seleccione categoría" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white">
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subcategoria"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Subcategoría</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                    disabled={!watchedCategoria || subcategoriasDisponibles.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                                            <SelectValue placeholder={
                                                                !watchedCategoria ? "Primero seleccione categoría" :
                                                                    subcategoriasDisponibles.length === 0 ? "No hay subcategorías" :
                                                                        "Seleccione subcategoría"
                                                            } />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white max-h-[300px]">
                                                        {subcategoriasDisponibles.map(subcat => (
                                                            <SelectItem key={subcat.value} value={subcat.value}>
                                                                {subcat.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* INPUT MANUAL SUBCATEGORÍA */}
                                    {watchedSubcategoria && watchedSubcategoria.startsWith('otro_') && (
                                        <FormField
                                            control={form.control}
                                            name="subcategoria_manual"
                                            render={({ field }) => (
                                                <FormItem className="mt-2 animate-in fade-in slide-in-from-top-2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Especifique la subcategoría..."
                                                            className="bg-blue-50/50 border-blue-200 focus:border-blue-500"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* NIVEL 3: MARCA Y MODELO */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="marcaBien"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-semibold">Marca</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value || ""}
                                                        disabled={!watchedSubcategoria || marcasDisponibles.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                                                <SelectValue placeholder="Seleccione marca" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white max-h-[300px]">
                                                            {marcasDisponibles.map(marca => (
                                                                <SelectItem key={marca.value} value={marca.value}>
                                                                    <div className="flex justify-between w-full items-center gap-2">
                                                                        <span>{marca.label}</span>
                                                                        {marca.precioFactor && marca.precioFactor !== 1.0 && (
                                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${marca.precioFactor > 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                                }`}>
                                                                                {marca.precioFactor > 1 ? 'Premium' : 'Económica'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* INPUT MANUAL MARCA */}
                                        {watchedMarcaBien && watchedMarcaBien.startsWith('otra_') && (
                                            <FormField
                                                control={form.control}
                                                name="marca_manual"
                                                render={({ field }) => (
                                                    <FormItem className="mt-2 animate-in fade-in slide-in-from-top-2">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Especifique la marca..."
                                                                className="bg-blue-50/50 border-blue-200 focus:border-blue-500"
                                                                {...field}
                                                                value={field.value || ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="modelo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Modelo</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Ej: Galaxy S24" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* CAMPOS ESPECÍFICOS POR CATEGORÍA */}
                                {watchedCategoria === 'vehiculos' && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            Datos del Vehículo
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="anio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Año</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Ej: 2022"
                                                                className="bg-white"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="placa"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Placa</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ej: ABC-123" className="bg-white uppercase" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="kilometraje"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Kilometraje</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Ej: 45000"
                                                                className="bg-white"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {watchedCategoria === 'electrodomesticos' && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            Datos del Electrodoméstico
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="capacidad"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Capacidad / Tamaño</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Ej: 15kg, 500L, 55 pulgadas"
                                                                className="bg-white"
                                                                {...field}
                                                                value={field.value || ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {watchedCategoria === 'inmuebles' && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            Datos del Inmueble
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="area"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Área (m²)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="Ej: 120"
                                                                className="bg-white"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="partidaRegistral"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Partida Registral</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ej: P12345678" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="sm:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name="ubicacion"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700">Ubicación / Dirección</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Dirección exacta del inmueble" className="bg-white" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {watchedCategoria === 'joyas' && (
                                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4">
                                        <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                            Detalles de la Joya
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="peso"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Peso (gramos)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="Ej: 5.5"
                                                                className="bg-white"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="quilataje"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700">Quilataje</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="Seleccione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="10k">10k (41.7% Oro)</SelectItem>
                                                                <SelectItem value="14k">14k (58.3% Oro)</SelectItem>
                                                                <SelectItem value="18k">18k (75.0% Oro)</SelectItem>
                                                                <SelectItem value="21k">21k (87.5% Oro)</SelectItem>
                                                                <SelectItem value="24k">24k (99.9% Oro)</SelectItem>
                                                                <SelectItem value="plata_925">Plata 925</SelectItem>
                                                                <SelectItem value="plata_950">Plata 950</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="serie"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Serie / IMEI</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Ej: 123456789" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="descripcion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Descripción Adicional</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Detalles adicionales, accesorios incluidos, observaciones..."
                                                        rows={3}
                                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: ESTADO Y FOTOS */}
                            <div className="lg:col-span-5 bg-slate-50/50 p-6 flex flex-col gap-6">

                                {/* NIVEL 4: ESTADO (Visual Selector) */}
                                <FormField
                                    control={form.control}
                                    name="estado_bien"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                Estado del Bien
                                                <span className="text-xs font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                    Impacta valorización
                                                </span>
                                            </FormLabel>
                                            <div className="grid grid-cols-1 gap-2">
                                                {ESTADOS.map((est) => {
                                                    const isSelected = field.value === est.value
                                                    return (
                                                        <div
                                                            key={est.value}
                                                            onClick={() => field.onChange(est.value)}
                                                            className={`
                                                                cursor-pointer relative flex items-center p-3 rounded-xl border transition-all duration-200
                                                                ${isSelected
                                                                    ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-sm z-10'
                                                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-4 h-4 rounded-full border flex items-center justify-center mr-3
                                                                ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}
                                                            `}>
                                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                                    {est.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="border-t border-dashed border-slate-200"></div>

                                {/* GALERÍA DE FOTOS */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-slate-700 font-semibold">Evidencia Fotográfica</Label>
                                        <span className="text-xs text-slate-500">{previews.length}/10</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                                                <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFoto(index)}
                                                    className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {previews.length < 10 && (
                                            <label htmlFor="dropzone-file" className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                                <div className="flex flex-col items-center justify-center p-2 text-center">
                                                    {uploading ? (
                                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-1" />
                                                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-blue-600">Subir</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="dropzone-file"
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    disabled={uploading || previews.length >= 10}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Valorización y Préstamo - DISEÑO PREMIUM */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="bg-slate-900 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <span className="text-emerald-400 font-bold">$</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Simulador de Crédito</h3>
                                <p className="text-slate-400 text-xs">Define las condiciones del préstamo</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs">Valor de Mercado</p>
                            <p className="text-emerald-400 font-bold text-lg">S/ {watchedValorMercado?.toLocaleString()}</p>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                            {/* COLUMNA IZQUIERDA: CONFIGURACIÓN (Inputs) */}
                            <div className="lg:col-span-7 p-6 space-y-8">

                                {/* 1. Monto a Prestar */}
                                <FormField
                                    control={form.control}
                                    name="montoPrestamo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="text-base font-semibold text-slate-700">
                                                    ¿Cuánto dinero necesita?
                                                </FormLabel>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    Máx: S/ {watchedValorMercado}
                                                </span>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-light">S/</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-12 h-14 text-2xl font-bold text-slate-900 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={e => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <Slider
                                                min={100}
                                                max={watchedValorMercado || 1000}
                                                step={10}
                                                value={[field.value || 0]}
                                                onValueChange={(vals) => field.onChange(vals[0])}
                                                className="py-2"
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 2. Plazo y Tasa */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base font-semibold text-slate-700">Plazo de Pago</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Tasa Base:</span>
                                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                <span className="text-xs font-bold text-blue-700">{tasaMensual}% Mensual</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {[
                                            { value: 'DIARIO', label: '1 Día', dias: 1 },
                                            { value: 'SEMANAL', label: '1 Sem', dias: 7 },
                                            { value: 'QUINCENAL', label: '2 Sem', dias: 14 },
                                            { value: 'TRES_SEMANAS', label: '3 Sem', dias: 21 },
                                            { value: 'MENSUAL', label: '1 Mes', dias: 30 }
                                        ].map((frec) => {
                                            const isSelected = frecuenciaPago === frec.value
                                            // Calcular interés referencial para este plazo
                                            const interesRef = (tasaMensual / 30) * frec.dias

                                            return (
                                                <button
                                                    key={frec.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFrecuenciaPago(frec.value as 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'TRES_SEMANAS' | 'MENSUAL')
                                                        setNumeroCuotas(1)
                                                    }}
                                                    className={`
                                                        relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                                                        ${isSelected
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105 z-10'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                        {frec.label}
                                                    </span>
                                                    <span className={`text-[10px] mt-1 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                        {interesRef.toFixed(1)}%
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: RESUMEN (Ticket) */}
                            <div className="lg:col-span-5 bg-slate-50/50 p-6 flex flex-col justify-center">
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Resumen de Liquidación
                                        </h4>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {/* Capital */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-sm">Capital Solicitado</span>
                                            <span className="text-slate-900 font-medium">S/ {monto.toFixed(2)}</span>
                                        </div>

                                        {/* Interés */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-sm">Interés ({frecuenciaPago})</span>
                                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                                                    Tasa efectiva: {((interesesPorPeriodo / (monto || 1)) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <span className="text-emerald-600 font-medium">+ S/ {interesesPorPeriodo.toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-dashed border-slate-200 my-2"></div>

                                        {/* Total */}
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-900 font-bold text-lg">Total a Pagar</span>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-slate-900 block leading-none">
                                                    S/ {totalPagarPorPeriodo.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-slate-400 mt-1 block">
                                                    Vence: {(() => {
                                                        const hoy = new Date()
                                                        let vencimiento

                                                        if (frecuenciaPago === 'MENSUAL') {
                                                            vencimiento = addMonths(hoy, 1)
                                                        } else {
                                                            const dias = diasPorFrecuencia[frecuenciaPago]
                                                            vencimiento = addDays(hoy, dias)
                                                        }

                                                        return format(vencimiento, "d 'de' MMM", { locale: es })
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 p-3 text-center border-t border-emerald-100">
                                        <p className="text-xs text-emerald-700 font-medium">
                                            Cliente recibe S/ {monto.toFixed(2)} en efectivo
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>)
}
