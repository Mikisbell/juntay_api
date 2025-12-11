"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import { cerrarCajaAction } from "@/lib/actions/caja-actions"
import { useRouter } from "next/navigation"

const BILLETES = [
    { valor: 200, label: "S/ 200" },
    { valor: 100, label: "S/ 100" },
    { valor: 50, label: "S/ 50" },
    { valor: 20, label: "S/ 20" },
    { valor: 10, label: "S/ 10" },
]

const MONEDAS = [
    { valor: 5, label: "S/ 5.00" },
    { valor: 2, label: "S/ 2.00" },
    { valor: 1, label: "S/ 1.00" },
    { valor: 0.5, label: "S/ 0.50" },
    { valor: 0.2, label: "S/ 0.20" },
    { valor: 0.1, label: "S/ 0.10" },
]

import { useQueryClient } from "@tanstack/react-query"

export function CierreCajaForm() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [conteo, setConteo] = useState<Record<number, number>>({})
    const [observaciones, setObservaciones] = useState("")
    const [resultado, setResultado] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Calcular total en tiempo real
    const totalFisico = [...BILLETES, ...MONEDAS].reduce((acc, d) => {
        return acc + (conteo[d.valor] || 0) * d.valor
    }, 0)

    const handleCantidadChange = (valor: number, cantidad: string) => {
        setConteo(prev => ({
            ...prev,
            [valor]: parseInt(cantidad) || 0
        }))
    }

    const handleCerrar = async () => {
        if (!confirm(`¿Confirmar cierre con S/ ${totalFisico.toFixed(2)}?\n\nEsta acción no se puede deshacer.`)) {
            return
        }

        setLoading(true)
        try {
            const resp = await cerrarCajaAction(totalFisico, observaciones)
            if (resp.success) {
                setResultado(resp.data)
                // FORCE REFRESH: Invalidate query to update the main layout immediately
                await queryClient.invalidateQueries({ queryKey: ['caja'] })
            } else {
                alert("Error: " + resp.error)
            }
        } catch (e) {
            console.error(e)
            alert("Error inesperado al cerrar caja")
        } finally {
            setLoading(false)
        }
    }

    if (resultado) {
        const esPerfecto = Math.abs(resultado.diferencia) < 0.01

        return (
            <div className="max-w-md mx-auto pt-8">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardContent className="pt-6 text-center space-y-6">
                        <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${esPerfecto ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {esPerfecto ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Caja Cerrada</h2>
                            <p className="text-sm text-slate-500">{new Date(resultado.fecha_cierre).toLocaleString('es-PE')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                            <div className="text-right text-slate-500">Contaste:</div>
                            <div className="text-left font-bold font-mono">S/ {resultado.saldo_fisico.toFixed(2)}</div>
                            <div className="text-right text-slate-500">Sistema:</div>
                            <div className="text-left font-bold font-mono">S/ {resultado.saldo_sistema.toFixed(2)}</div>
                        </div>

                        <Alert variant={esPerfecto ? "default" : "destructive"} className={esPerfecto ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}>
                            <AlertTitle className="font-bold text-center">
                                {esPerfecto ? "CUADRE PERFECTO" : resultado.diferencia > 0 ? "SOBRANTE" : "FALTANTE"}
                            </AlertTitle>
                            <AlertDescription className="text-xl font-mono font-bold text-center mt-1">
                                {esPerfecto ? "S/ 0.00" : `S/ ${Math.abs(resultado.diferencia).toFixed(2)}`}
                            </AlertDescription>
                        </Alert>

                        <Button className="w-full" onClick={async () => {
                            // 1. Invalidate cache FIRST
                            await queryClient.invalidateQueries({ queryKey: ['caja'] })
                            // 2. Refresh server components
                            router.refresh()
                            // 3. Navigate
                            router.push('/dashboard/caja')
                        }}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Caja
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    Arqueo de Efectivo
                </h1>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {/* COLUMNA 1: BILLETES */}
                <Card className="border-0 shadow-sm md:col-span-2">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {/* Billetes */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billetes</p>
                                {BILLETES.map((d) => (
                                    <div key={d.valor} className="flex items-center gap-2">
                                        <div className="w-12 text-sm font-medium text-slate-600">{d.label}</div>
                                        <Input
                                            type="number"
                                            className="h-7 w-20 text-right text-sm"
                                            placeholder="0"
                                            min="0"
                                            onChange={(e) => handleCantidadChange(d.valor, e.target.value)}
                                        />
                                        <div className="flex-1 text-right text-sm font-mono text-slate-400">
                                            {((conteo[d.valor] || 0) * d.valor).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Monedas */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monedas</p>
                                {MONEDAS.map((d) => (
                                    <div key={d.valor} className="flex items-center gap-2">
                                        <div className="w-12 text-sm font-medium text-slate-600">{d.label}</div>
                                        <Input
                                            type="number"
                                            className="h-7 w-20 text-right text-sm"
                                            placeholder="0"
                                            min="0"
                                            onChange={(e) => handleCantidadChange(d.valor, e.target.value)}
                                        />
                                        <div className="flex-1 text-right text-sm font-mono text-slate-400">
                                            {((conteo[d.valor] || 0) * d.valor).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* COLUMNA 2: TOTAL Y ACCIÓN */}
                <div className="space-y-4">
                    <Card className="bg-slate-900 text-white border-0">
                        <CardContent className="p-5 text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Físico</p>
                            <p className="text-3xl font-bold font-mono tracking-tight">
                                S/ {totalFisico.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                        <p className="font-semibold mb-1">🔒 Modo Cierre Ciego</p>
                        No verás el saldo esperado hasta confirmar. Cuenta dos veces.
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Observaciones</Label>
                        <Input
                            className="h-8 text-sm bg-white"
                            placeholder="Ej: Billete roto..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full bg-rose-600 hover:bg-rose-700 h-10"
                        disabled={totalFisico === 0 || loading}
                        onClick={handleCerrar}
                        title={totalFisico === 0 ? "Ingresa el conteo de billetes/monedas primero" : loading ? "Procesando..." : "Confirmar cierre de caja"}
                    >
                        {loading ? "Cerrando..." : totalFisico === 0 ? "Ingresa el conteo" : "Confirmar Cierre"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
