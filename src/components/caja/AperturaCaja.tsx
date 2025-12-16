'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { abrirCajaAction } from '@/lib/actions/caja-actions'
import { Loader2, Lock, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function AperturaCaja() {
    const [monto, setMonto] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const queryClient = useQueryClient()

    const handleAbrir = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const valor = parseFloat(monto) || 0
            const res = await abrirCajaAction(valor)

            if (res.error) {
                setError(res.error)
                setLoading(false)
            } else {
                await queryClient.invalidateQueries({ queryKey: ['caja'] })
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
            setLoading(false)
        }
    }

    const handleRetry = () => {
        setError(null)
    }

    return (
        <div className="max-w-sm mx-auto pt-4 space-y-4">
            {/* ALERTA DE ERROR */}
            {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No se pudo abrir la caja</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>{error}</p>
                        <div className="text-xs opacity-75 mt-2">
                            <p><strong>Posibles causas:</strong></p>
                            <ul className="list-disc list-inside">
                                <li>Ya tienes una caja abierta</li>
                                <li>No hay bóveda configurada</li>
                                <li>Tu usuario no tiene permisos</li>
                            </ul>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="mt-2"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" /> Intentar de nuevo
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="text-center pb-2 pt-0">
                    <div className="mx-auto bg-amber-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-lg">Apertura de Caja</CardTitle>
                </CardHeader>
                <form onSubmit={handleAbrir}>
                    <CardContent className="space-y-4 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="monto" className="sr-only">Saldo Inicial</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                                <Input
                                    id="monto"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    className="text-xl text-center font-bold h-10 pl-8"
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                Saldo inicial físico (puede ser 0)
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button
                            type="submit"
                            className="w-full h-9"
                            disabled={loading}
                            title={loading ? "Procesando..." : "Abrir caja con el saldo ingresado"}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            {loading ? 'Abriendo...' : 'Iniciar Turno'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
