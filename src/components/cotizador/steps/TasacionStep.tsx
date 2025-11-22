'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

    const [previews, setPreviews] = useState<string[]>([])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const nuevasFotos = Array.from(files).slice(0, 10 - previews.length)
        const nuevasUrls = nuevasFotos.map(file => URL.createObjectURL(file))

        setPreviews(prev => [...prev, ...nuevasUrls])
        // TODO: Subir a Supabase Storage y guardar URLs reales
    }

    const handleRemoveFoto = (index: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const interesesMensual = (montoPrestamo * tasaInteres) / 100

    return (
        <div className="space-y-4 max-w-full">
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
                        <div className="space-y-2">
                            <Label className="text-sm">Categoría *</Label>
                            <Select
                                value={detallesGarantia.categoria}
                                onValueChange={(v) => setDetallesGarantia({ categoria: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione categoría" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {CATEGORIAS.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Estado *</Label>
                            <Select
                                value={detallesGarantia.estado_bien}
                                onValueChange={(v) => setDetallesGarantia({ estado_bien: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione estado" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {ESTADOS.map(est => (
                                        <SelectItem key={est.value} value={est.value}>
                                            {est.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Marca, Modelo, Serie */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Input
                                value={detallesGarantia.marca}
                                onChange={(e) => setDetallesGarantia({ marca: e.target.value })}
                                placeholder="Ej: Samsung"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Modelo</Label>
                            <Input
                                value={detallesGarantia.modelo}
                                onChange={(e) => setDetallesGarantia({ modelo: e.target.value })}
                                placeholder="Ej: Galaxy S24"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Serie/IMEI</Label>
                            <Input
                                value={detallesGarantia.serie}
                                onChange={(e) => setDetallesGarantia({ serie: e.target.value })}
                                placeholder="Número de serie"
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                        <Label className="text-sm">Descripción Adicional</Label>
                        <Textarea
                            value={detallesGarantia.descripcion}
                            onChange={(e) => setDetallesGarantia({ descripcion: e.target.value })}
                            placeholder="Detalles adicionales del bien, accesorios incluidos, etc."
                            rows={2}
                            className="text-sm"
                        />
                    </div>

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
                                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50 transition">
                                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="text-xs text-slate-500">Subir</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileSelect}
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
                    <div className="space-y-2">
                        <Label>Valor de Mercado (Referencia)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-600 font-medium">S/</span>
                            <Input
                                type="number"
                                step="0.01"
                                className="pl-10 text-lg font-semibold"
                                value={detallesGarantia.valorMercado || ''}
                                onChange={(e) => setDetallesGarantia({ valorMercado: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Monto a Prestar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>Monto a Prestar</Label>
                            <span className="text-2xl font-bold text-emerald-600">
                                S/ {montoPrestamo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <Slider
                            value={[montoPrestamo]}
                            onValueChange={([value]) => setMontoPrestamo(value)}
                            min={100}
                            max={detallesGarantia.valorMercado || 10000}
                            step={50}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>S/ 100</span>
                            <span>S/ {(detallesGarantia.valorMercado || 10000).toLocaleString('es-PE')}</span>
                        </div>
                    </div>

                    {/* Tasa de Interés */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label>Tasa de Interés Mensual (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                className="text-lg font-semibold"
                                value={tasaInteres}
                                onChange={(e) => setTasaInteres(parseFloat(e.target.value) || 20)}
                            />
                        </div>

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
        </div>
    )
}
