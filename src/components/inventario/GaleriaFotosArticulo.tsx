'use client'

import { useEffect, useState } from 'react'
import {
    Image,
    Plus,
    Trash2,
    Star,
    Upload,
    X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
    obtenerFotosArticulo,
    agregarFotoArticulo,
    eliminarFotoArticulo,
    type FotoGarantia
} from '@/lib/actions/garantias-mejoradas-actions'
import { cn } from '@/lib/utils'

interface GaleriaFotosArticuloProps {
    articuloId: string
    editable?: boolean
}

/**
 * Galería de Fotos del Artículo
 */
export function GaleriaFotosArticulo({
    articuloId,
    editable = false
}: GaleriaFotosArticuloProps) {
    const [fotos, setFotos] = useState<FotoGarantia[]>([])
    const [loading, setLoading] = useState(true)
    const [fotoSeleccionada, setFotoSeleccionada] = useState<FotoGarantia | null>(null)
    const [subiendo, setSubiendo] = useState(false)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await obtenerFotosArticulo(articuloId)
                setFotos(data)
                // Seleccionar principal por defecto
                const principal = data.find(f => f.esPrincipal)
                if (principal) setFotoSeleccionada(principal)
                else if (data.length > 0) setFotoSeleccionada(data[0])
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [articuloId])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Por ahora, crear URL temporal (en producción iría a Supabase Storage)
        // Esta es una demo que guarda como base64 en metadata
        setSubiendo(true)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64 = reader.result as string
                const result = await agregarFotoArticulo(articuloId, base64, file.name)
                if (result.success) {
                    toast.success('Foto agregada')
                    // Recargar fotos
                    const data = await obtenerFotosArticulo(articuloId)
                    setFotos(data)
                } else {
                    toast.error('Error', { description: result.error })
                }
                setSubiendo(false)
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error subiendo foto')
            setSubiendo(false)
        }
    }

    const handleEliminar = async (fotoId: string) => {
        try {
            const result = await eliminarFotoArticulo(articuloId, fotoId)
            if (result.success) {
                toast.success('Foto eliminada')
                const data = await obtenerFotosArticulo(articuloId)
                setFotos(data)
                if (fotoSeleccionada?.id === fotoId) {
                    setFotoSeleccionada(data[0] || null)
                }
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error eliminando foto')
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full rounded-lg" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Image className="h-5 w-5" />
                    Galería de Fotos
                    {fotos.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                            ({fotos.length})
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Foto principal */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {fotoSeleccionada ? (
                        <img
                            src={fotoSeleccionada.url}
                            alt={fotoSeleccionada.descripcion || 'Foto del artículo'}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Image className="h-12 w-12 mb-2 opacity-50" />
                            <p>Sin fotos</p>
                        </div>
                    )}

                    {/* Badge principal */}
                    {fotoSeleccionada?.esPrincipal && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Star className="h-3 w-3" fill="white" />
                            Principal
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {fotos.map((foto) => (
                            <button
                                key={foto.id}
                                onClick={() => setFotoSeleccionada(foto)}
                                className={cn(
                                    'relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden',
                                    fotoSeleccionada?.id === foto.id
                                        ? 'border-primary'
                                        : 'border-transparent hover:border-muted-foreground/30'
                                )}
                            >
                                <img
                                    src={foto.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                {foto.esPrincipal && (
                                    <Star className="absolute top-0.5 left-0.5 h-3 w-3 text-yellow-500" fill="currentColor" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Controles de edición */}
                {editable && (
                    <div className="flex gap-2">
                        <label className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={subiendo}
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={subiendo}
                                asChild
                            >
                                <span>
                                    {subiendo ? (
                                        <Upload className="h-4 w-4 mr-2 animate-pulse" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Agregar Foto
                                </span>
                            </Button>
                        </label>

                        {fotoSeleccionada && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEliminar(fotoSeleccionada.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * Modal de foto ampliada
 */
export function FotoAmpliadaModal({
    foto,
    onClose
}: {
    foto: FotoGarantia
    onClose: () => void
}) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh]">
                <img
                    src={foto.url}
                    alt={foto.descripcion || 'Foto'}
                    className="max-w-full max-h-[90vh] object-contain"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
