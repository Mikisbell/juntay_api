"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Camera, Smartphone, Trash2, CheckCircle, UploadCloud, Settings, Monitor, Wifi, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { analizarImagenBien, AnalisisImagenResult } from "@/lib/actions/vision-actions"

interface Props {
    sessionId: string
    onPhotosUploaded: (urls: string[]) => void
    onAnalysisComplete?: (analysis: AnalisisImagenResult['sugerencias']) => void
    maxPhotos?: number
}

export function QRPhotoBridge({ sessionId, onPhotosUploaded, onAnalysisComplete, maxPhotos = 10 }: Props) {
    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
    const [listening, setListening] = useState(false)
    const [_status, setStatus] = useState<'idle' | 'connected' | 'uploading'>('idle')
    const [isUploadingManual, setIsUploadingManual] = useState(false)

    // Estado de análisis IA
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<AnalisisImagenResult['sugerencias'] | null>(null)
    const [hasAnalyzed, setHasAnalyzed] = useState(false)

    // Configuración de URL base para QR (para LAN)
    const [baseUrl, setBaseUrl] = useState("")
    const [showConfig, setShowConfig] = useState(false)

    // Inicializar URL base
    useEffect(() => {
        const savedUrl = localStorage.getItem("smart_pos_qr_base_url")
        if (savedUrl) {
            setBaseUrl(savedUrl)
        } else if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin)
        }
    }, [])

    const handleSaveBaseUrl = () => {
        if (!baseUrl.startsWith("http")) {
            toast.error("La URL debe empezar con http:// o https://")
            return
        }
        localStorage.setItem("smart_pos_qr_base_url", baseUrl)
        setShowConfig(false)
        toast.success("URL del QR actualizada")
    }

    const qrUrl = `${baseUrl}/mobile-upload/${sessionId}`

    const supabase = createClient()

    // 1. REALTIME LISTENER
    useEffect(() => {
        const channel = supabase
            .channel(`upload-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'storage',
                    table: 'objects',
                    filter: `bucket_id=eq.evidencias`
                },
                (payload) => {
                    const path = payload.new.name
                    if (path && path.startsWith(sessionId)) {
                        const { data } = supabase.storage
                            .from('evidencias')
                            .getPublicUrl(path)

                        setUploadedPhotos(prev => [...prev, data.publicUrl])
                        toast.success("Foto recibida desde el móvil")
                        setStatus('connected')
                    }
                }
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .subscribe((payload: any) => {
                if (payload === 'SUBSCRIBED') {
                    setListening(true)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sessionId])

    // Sincronizar con padre
    useEffect(() => {
        onPhotosUploaded(uploadedPhotos)
    }, [uploadedPhotos, onPhotosUploaded])

    // 2. MANUAL UPLOAD HANDLER
    const handleManualFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return

        setIsUploadingManual(true)
        const files = Array.from(e.target.files)
        let successCount = 0

        for (const file of files) {
            if (uploadedPhotos.length + successCount >= maxPhotos) {
                toast.warning(`Límite de ${maxPhotos} fotos alcanzado`)
                break
            }

            try {
                const uniquePath = `${sessionId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`

                const { error: uploadError } = await supabase.storage
                    .from('evidencias')
                    .upload(uniquePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                const { data: urlData } = supabase.storage
                    .from('evidencias')
                    .getPublicUrl(uniquePath)

                setUploadedPhotos(prev => [...prev, urlData.publicUrl])
                successCount++
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Error subiendo archivo:", err)
                toast.error(`Error subiendo ${file.name}`)
            }
        }

        if (successCount > 0) {
            toast.success(`${successCount} fotos subidas desde PC`)

            // Analizar primera foto con IA si aún no se ha analizado
            if (!hasAnalyzed && uploadedPhotos.length === 0 && files.length > 0) {
                analyzeFirstPhoto(files[0])
            }
        }
        setIsUploadingManual(false)
        // Limpiar input
        e.target.value = ''
    }

    // Análisis de imagen con IA
    const analyzeFirstPhoto = async (file: File) => {
        setIsAnalyzing(true)
        try {
            // Convertir a base64
            const buffer = await file.arrayBuffer()
            const bytes = new Uint8Array(buffer)
            let binary = ''
            bytes.forEach(b => binary += String.fromCharCode(b))
            const base64 = btoa(binary)

            const result = await analizarImagenBien(base64, file.type)

            if (result.success && result.sugerencias) {
                setAnalysisResult(result.sugerencias)
                setHasAnalyzed(true)

                // Notificar al padre
                if (onAnalysisComplete) {
                    onAnalysisComplete(result.sugerencias)
                }

                toast.success(
                    `🧠 IA detectó: ${result.sugerencias.marca || 'Artículo'} - ${result.sugerencias.categoria}`,
                    { description: `Confianza: ${result.sugerencias.categoriaConfianza}%` }
                )
            } else if (result.apiUsada === 'mock') {
                toast.info('IA no configurada. Configura GOOGLE_GEMINI_API_KEY para análisis automático.')
            }
        } catch (error) {
            console.error('Error analizando imagen:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const removePhoto = (indexToRemove: number) => {
        setUploadedPhotos(prev => prev.filter((_, i) => i !== indexToRemove))
    }

    return (
        <Card className="border-dashed border-2 bg-slate-50">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Columna Izquierda: QR & Config */}
                    <div className="flex flex-col items-center gap-4 min-w-[200px]">
                        <div className="relative group">
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <QRCodeSVG
                                    value={qrUrl}
                                    size={160}
                                    level="L"
                                    includeMargin
                                />
                            </div>

                            {/* Botón Configuración QR */}
                            <Dialog open={showConfig} onOpenChange={setShowConfig}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                                        title="Configurar URL (WiFi Local)"
                                    >
                                        <Settings className="h-4 w-4 text-slate-600" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Wifi className="w-5 h-5 text-blue-600" />
                                            Configurar Red Local
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <Label>URL Base para el Móvil</Label>
                                            <Input
                                                value={baseUrl}
                                                onChange={(e) => setBaseUrl(e.target.value)}
                                                placeholder="Ej: http://192.168.1.50:3000"
                                            />
                                            <p className="text-[11px] text-slate-500">
                                                Si usas localhost, tu celular NO podrá conectarse.
                                                Usa la IP de tu PC (ej: <code>ipconfig</code> o <code>ifconfig</code>).
                                            </p>
                                        </div>
                                        <Button onClick={handleSaveBaseUrl} className="w-full">
                                            Guardar y Generar QR
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-medium text-slate-800 flex items-center justify-center gap-2 text-sm">
                                <Smartphone className="w-4 h-4" />
                                Escanear con Móvil
                            </p>

                            {listening ? (
                                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 animate-pulse text-[10px]">
                                    ● Esperando escaneo...
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-[10px]">Iniciando...</Badge>
                            )}

                            <div className="relative pt-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-50 px-2 text-slate-500">O subir desde PC</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full text-xs h-9 bg-white border-slate-300 hover:bg-slate-100"
                                disabled={isUploadingManual || uploadedPhotos.length >= maxPhotos}
                                onClick={() => document.getElementById('manual-upload')?.click()}
                            >
                                {isUploadingManual ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Monitor className="w-3 h-3 mr-2" />}
                                Seleccionar Archivos
                            </Button>
                            <input
                                id="manual-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleManualFiles}
                            />
                        </div>
                    </div>

                    {/* Columna Derecha: Galería */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-blue-500" />
                                Evidencias ({uploadedPhotos.length}/{maxPhotos})
                            </h3>
                            <div className="flex items-center gap-2">
                                {isAnalyzing && (
                                    <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200 animate-pulse text-[10px]">
                                        <Brain className="w-3 h-3 mr-1" />
                                        Analizando...
                                    </Badge>
                                )}
                                {analysisResult && !isAnalyzing && (
                                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 text-[10px]">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {analysisResult.marca || analysisResult.categoria}
                                    </Badge>
                                )}
                                {uploadedPhotos.length > 0 && !isAnalyzing && (
                                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Listo
                                    </span>
                                )}
                            </div>
                        </div>

                        {uploadedPhotos.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed rounded-lg bg-white/50">
                                <UploadCloud className="w-10 h-10 opacity-20" />
                                <p className="text-sm text-center px-4">
                                    Las fotos del celular o PC aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {uploadedPhotos.map((url, i) => (
                                    <div key={i} className="group relative aspect-video bg-white rounded-lg border overflow-hidden shadow-sm">
                                        <img
                                            src={url}
                                            alt={`Evidencia ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white backdrop-blur-sm">
                                            #{i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
