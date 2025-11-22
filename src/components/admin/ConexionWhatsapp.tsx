'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react'

export function ConexionWhatsapp() {
    const [status, setStatus] = useState<{ connected: boolean, status?: string, error?: string } | null>(null)
    const [loading, setLoading] = useState(true)

    const checkStatus = async () => {
        try {
            // Importamos dinámicamente la server action
            const { checkRenderStatus } = await import('@/lib/actions/render-status')
            const res = await checkRenderStatus()
            setStatus(res)
        } catch (err) {
            setStatus({ connected: false, error: 'Error verificando estado' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 10000) // Poll every 10s (Render es remoto, no saturemos)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto border-slate-200 shadow-sm">
                <CardContent className="flex flex-col items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                    <p className="text-slate-500">Verificando conexión con Render...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    Estado de WhatsApp (Render)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 space-y-4">
                {status?.connected ? (
                    <div className="text-center space-y-2 animate-in fade-in zoom-in duration-500">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="font-bold text-green-700 text-lg">¡Conectado a Render!</h3>
                        <p className="text-sm text-slate-500">Tu servidor en la nube está activo y listo.</p>
                        <div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 mt-2">
                            Estado: {status.status}
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-red-700">Desconectado o Sin Sesión</h3>
                            <p className="text-sm text-slate-600">
                                El servidor Render no detecta una sesión activa de WhatsApp.
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-left text-sm text-blue-800 space-y-2">
                            <p className="font-semibold">Cómo conectar:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Ve a tu <a href="https://whatsapp-juntay.onrender.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-bold">Dashboard de Render</a>.</li>
                                <li>Loguéate con <code>admin</code> / <code>mikis123</code>.</li>
                                <li>Busca la sesión <code>default</code>.</li>
                                <li>Escanea el QR <strong>allí</strong>.</li>
                            </ol>
                        </div>

                        {status?.error && (
                            <p className="text-xs text-red-500 font-mono mt-2">Error: {status.error}</p>
                        )}

                        <button
                            onClick={() => { setLoading(true); checkStatus(); }}
                            className="text-xs text-blue-600 hover:underline mt-2"
                        >
                            Reintentar verificación
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
