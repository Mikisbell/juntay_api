'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { abrirCajaAction } from '@/lib/actions/caja-actions'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AperturaCaja() {
    const [monto, setMonto] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAbrir = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const valor = parseFloat(monto) || 0
            const res = await abrirCajaAction(valor)

            if (res.error) {
                alert(res.error)
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert('Error al abrir caja')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-slate-500" />
                    </div>
                    <CardTitle className="text-2xl">Apertura de Caja</CardTitle>
                    <p className="text-slate-500">Inicia tu turno operativo</p>
                </CardHeader>
                <form onSubmit={handleAbrir}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="monto">Saldo Inicial (S/)</Label>
                            <Input
                                id="monto"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="text-2xl text-center font-bold h-14"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 text-center">
                                Ingresa el dinero físico que recibes al iniciar
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Abrir Caja'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
