'use client'

import { useState, useRef } from 'react'
import {
    Camera,
    X,
    Check,
    RefreshCw,
    ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CapturaFotoGarantiaProps {
    onFotoCapturada: (fotoBase64: string) => void
    onCancel?: () => void
}

/**
 * Componente para capturar fotos de garantías en campo
 * Optimizado para móvil con cámara nativa
 */
export function CapturaFotoGarantia({
    onFotoCapturada,
    onCancel
}: CapturaFotoGarantiaProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [capturando, setCapturando] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleCapture = () => {
        inputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setCapturando(true)
        try {
            // Comprimir imagen para móvil
            const compressedBase64 = await compressImage(file, 800, 0.7)
            setPreview(compressedBase64)
        } catch (err) {
            console.error('Error procesando imagen:', err)
            toast.error('Error procesando imagen')
        } finally {
            setCapturando(false)
        }
    }

    const handleConfirm = () => {
        if (preview) {
            onFotoCapturada(preview)
            setPreview(null)
        }
    }

    const handleRetry = () => {
        setPreview(null)
        inputRef.current?.click()
    }

    // Si hay preview, mostrar para confirmar
    if (preview) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                {/* Imagen */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>

                {/* Controles */}
                <div className="p-4 bg-black/80 flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleRetry}
                        className="bg-transparent border-white text-white"
                    >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Repetir
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleConfirm}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Check className="h-5 w-5 mr-2" />
                        Usar Foto
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Input oculto para cámara */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Botón de captura */}
            <Button
                variant="outline"
                size="lg"
                onClick={handleCapture}
                disabled={capturando}
                className="w-full"
            >
                {capturando ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                    <Camera className="h-5 w-5 mr-2" />
                )}
                Tomar Foto de Garantía
            </Button>

            {onCancel && (
                <Button variant="ghost" onClick={onCancel} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            )}
        </div>
    )
}

/**
 * Galería de fotos capturadas
 */
export function GaleriaFotosCapturadas({
    fotos,
    onEliminar
}: {
    fotos: string[]
    onEliminar?: (index: number) => void
}) {
    if (fotos.length === 0) {
        return (
            <div className="p-4 border rounded-lg text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin fotos capturadas</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {fotos.map((foto, index) => (
                <div key={index} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                    />
                    {onEliminar && (
                        <button
                            onClick={() => onEliminar(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

// ============ HELPERS ============

/**
 * Comprime una imagen para reducir tamaño (ideal para móvil)
 */
async function compressImage(
    file: File,
    maxWidth: number = 800,
    quality: number = 0.7
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Redimensionar si es mayor al máximo
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('No canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convertir a base64 con compresión
                const base64 = canvas.toDataURL('image/jpeg', quality)
                resolve(base64)
            }
            img.onerror = reject
            img.src = e.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
