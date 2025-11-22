"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Lock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { cerrarCajaAction } from "@/lib/actions/caja-actions"

const DENOMINACIONES = [
    { valor: 200, label: "S/ 200" },
    { valor: 100, label: "S/ 100" },
    { valor: 50, label: "S/ 50" },
    { valor: 20, label: "S/ 20" },
    { valor: 10, label: "S/ 10" },
    { valor: 5, label: "S/ 5" },
    { valor: 2, label: "S/ 2" },
    { valor: 1, label: "S/ 1" },
    { valor: 0.5, label: "S/ 0.50" },
    { valor: 0.2, label: "S/ 0.20" },
    { valor: 0.1, label: "S/ 0.10" },
]

export function CierreCajaForm() {
    const [conteo, setConteo] = useState<Record<number, number>>({})
    const [observaciones, setObservaciones] = useState("")
    const [resultado, setResultado] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Calcular total en tiempo real
    const totalFisico = DENOMINACIONES.reduce((acc, d) => {
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
        // PANTALLA DE RESULTADO (El momento de la verdad)
        const esPerfecto = Math.abs(resultado.diferencia) < 0.01

        return (
            <Card className="max-w-md mx-auto mt-8 text-center border-t-4 border-t-blue-600 shadow-xl">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center bg-slate-100">
                        {esPerfecto ? (
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        ) : (
                            <XCircle className="h-10 w-10 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">Caja Cerrada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-right text-slate-500">Tú contaste:</div>
                        <div className="text-left font-bold font-mono">S/ {resultado.saldo_fisico.toFixed(2)}</div>

                        <div className="text-right text-slate-500">Sistema esperaba:</div>
                        <div className="text-left font-bold font-mono">S/ {resultado.saldo_sistema.toFixed(2)}</div>
                    </div>

                    <Alert variant={esPerfecto ? "default" : "destructive"} className={esPerfecto ? "bg-emerald-50 border-emerald-200" : ""}>
                        <AlertTitle className="font-bold">
                            {esPerfecto ? "✅ CUADRE PERFECTO" : resultado.diferencia > 0 ? "📈 SOBRANTE" : "📉 FALTANTE"}
                        </AlertTitle>
                        <AlertDescription className="text-lg font-mono font-bold mt-1">
                            {esPerfecto ? "S/ 0.00" : `S/ ${Math.abs(resultado.diferencia).toFixed(2)}`}
                        </AlertDescription>
                    </Alert>

                    <div className="text-xs text-slate-500">
                        Fecha de cierre: {new Date(resultado.fecha_cierre).toLocaleString('es-PE')}
                    </div>

                    <Button className="w-full" variant="outline" onClick={() => window.location.href = '/dashboard'}>
                        Volver al Panel
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // PANTALLA DE CONTEO (Cierre Ciego)
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Lock className="h-6 w-6 text-slate-500" />
                Cierre de Caja (Arqueo)
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* COLUMNA 1: CALCULADORA DE EFECTIVO */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Arqueo de Efectivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {DENOMINACIONES.map((d) => (
                                    <TableRow key={d.valor} className="hover:bg-transparent">
                                        <TableCell className="font-medium py-1">{d.label}</TableCell>
                                        <TableCell className="py-1">
                                            <Input
                                                type="number"
                                                className="h-8 w-24 text-right"
                                                placeholder="0"
                                                min="0"
                                                onChange={(e) => handleCantidadChange(d.valor, e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right text-slate-500 font-mono py-1">
                                            S/ {((conteo[d.valor] || 0) * d.valor).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex justify-between items-center p-4 bg-slate-100 rounded-lg">
                            <span className="font-bold text-slate-700">TOTAL FÍSICO:</span>
                            <span className="text-2xl font-bold text-slate-900 font-mono">
                                S/ {totalFisico.toFixed(2)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* COLUMNA 2: CONFIRMACIÓN */}
                <div className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 font-bold">Modo Cierre Ciego</AlertTitle>
                        <AlertDescription className="text-blue-700 text-xs mt-1">
                            Por seguridad, el sistema no mostrará el saldo esperado hasta que confirmes el monto físico contado.
                            <br /><br />
                            Asegúrate de contar dos veces antes de cerrar.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Observaciones (Opcional)</Label>
                                <Input
                                    placeholder="Ej: Billete roto, cambio de sencillo..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg"
                                disabled={totalFisico === 0 || loading}
                                onClick={handleCerrar}
                            >
                                {loading ? "Cerrando..." : `Confirmar Cierre (S/ ${totalFisico.toFixed(2)})`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
