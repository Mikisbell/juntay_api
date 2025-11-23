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

const CATEGORIAS = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'celular', label: 'Celular/Smartphone' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'tv', label: 'Televisor' },
    { value: 'consola', label: 'Consola de Videojuegos' },
    { value: 'audio', label: 'Equipo de Audio' },
    { value: 'electrodomestico', label: 'Electrodoméstico' },
    { value: 'herramienta', label: 'Herramienta Eléctrica' },
    { value: 'joya_oro', label: 'Joya de Oro' },
    { value: 'otro', label: 'Otro' }
]

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
        setTasaInteres
    } = useCotizador()

    const form = useForm<TasacionFormData>({
        resolver: zodResolver(tasacionSchema),
        defaultValues: {
            categoria: detallesGarantia.categoria,
            marca: detallesGarantia.marca,
            modelo: detallesGarantia.modelo,
            serie: detallesGarantia.serie,
            estado_bien: detallesGarantia.estado_bien as any,
            descripcion: detallesGarantia.descripcion,
            valorMercado: detallesGarantia.valorMercado,
            montoPrestamo: montoPrestamo,
            tasaInteres: tasaInteres,
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
        if (watchedTasaInteres !== undefined) setTasaInteres(watchedTasaInteres)
    }, [watchedTasaInteres, setTasaInteres])

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

    const interesesMensual = (montoPrestamo * tasaInteres) / 100


    return (
        <Form {...form}>
            <form className="space-y-4 max-w-full">
                {/* Detalles del Bien */}
                <Card className="border-t-4 border-t-blue-600 shadow-md">
                    <CardHeader className="bg-slate-50 py-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Camera className="h-4 w-4 text-blue-600" />
                            Detalles del Bien
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {/* Categoría y Estado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <FormField
                                control={form.control}
                                name="categoria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                {CATEGORIAS.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
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
                                name="estado_bien"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                {ESTADOS.map(est => (
                                                    <SelectItem key={est.value} value={est.value}>
                                                        {est.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Marca, Modelo, Serie */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <FormField
                                control={form.control}
                                name="marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Samsung" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Galaxy S24" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="serie"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serie/IMEI</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Número de serie" className="font-mono text-sm" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Descripción */}
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción Adicional</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalles adicionales del bien, accesorios incluidos, etc."
                                            rows={2}
                                            className="text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Galería de Fotos */}
                        <div className="space-y-1">
                            <Label className="text-sm">Fotos del Bien (Máximo 10)</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {previews.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group">
                                        <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveFoto(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {previews.length < 10 && (
                                    <label htmlFor="dropzone-file" className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 mb-3 text-slate-400 animate-spin" />
                                                    <p className="mb-2 text-sm text-slate-500">
                                                        <span className="font-semibold">Subiendo fotos...</span>
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 mb-3 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-500">
                                                        <span className="font-semibold">Click para subir fotos</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500">PNG, JPG (MAX. 10 fotos)</p>
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
                            <p className="text-xs text-slate-500">
                                {previews.length}/10 fotos • Formatos: JPG, PNG • Máx 5MB por foto
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Valorización y Condiciones */}
                <Card className="border-t-4 border-t-emerald-600 shadow-md">
                    <CardHeader className="bg-slate-50 py-3">
                        <CardTitle className="text-base">Valorización y Condiciones del Préstamo</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {/* Valor de Mercado */}
                        <FormField
                            control={form.control}
                            name="valorMercado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor de Mercado (Referencia)</FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-slate-600 font-medium">S/</span>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-10 text-lg font-semibold"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto a Prestar */}
                        <FormField
                            control={form.control}
                            name="montoPrestamo"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Monto a Prestar</FormLabel>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            S/ {field.value?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <FormControl>
                                        <Slider
                                            value={[field.value]}
                                            onValueChange={([value]) => field.onChange(value)}
                                            min={100}
                                            max={watchedValorMercado || 10000}
                                            step={50}
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>S/ 100</span>
                                        <span>S/ {(watchedValorMercado || 10000).toLocaleString('es-PE')}</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tasa de Interés */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField
                                control={form.control}
                                name="tasaInteres"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tasa de Interés Mensual (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                className="text-lg font-semibold"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <Label className="text-slate-600">Interés Mensual</Label>
                                <div className="h-10 rounded-md border bg-slate-50 px-3 flex items-center">
                                    <span className="text-lg font-semibold text-amber-600">
                                        S/ {interesesMensual.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Resumen */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                                <div>
                                    <p className="text-xs text-blue-700 mb-1">Monto Préstamo</p>
                                    <p className="text-lg font-bold text-blue-900">S/ {montoPrestamo.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 mb-1">Interés Mensual</p>
                                    <p className="text-lg font-bold text-amber-600">{tasaInteres}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 mb-1">Total a Pagar (1 mes)</p>
                                    <p className="text-lg font-bold text-blue-900">
                                        S/ {(montoPrestamo + interesesMensual).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    )
}
