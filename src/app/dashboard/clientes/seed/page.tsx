'use client'

import { seedClientes } from '@/lib/actions/seed-actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SeedPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const handleSeed = async () => {
        if (!confirm("⚠️ ADVERTENCIA: Esta acción BORRARÁ TODOS los datos existentes y generará 500 nuevos clientes. ¿Estás seguro?")) return;

        setLoading(true)
        try {
            const res = await seedClientes(500)
            setResult(res.message)
        } catch (error) {
            setResult("Error al generar datos: " + error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Generador de Data de Prueba Realista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>¡Zona de Peligro!</AlertTitle>
                        <AlertDescription>
                            Al ejecutar este proceso, <b>se eliminarán permanentemente</b> todos los clientes, créditos, contratos y garantías actuales.
                        </AlertDescription>
                    </Alert>

                    <div className="text-sm text-muted-foreground text-center">
                        <p>Se generarán <b>500 clientes</b> con perfiles variados:</p>
                        <ul className="list-disc list-inside mt-2 text-left bg-slate-50 dark:bg-slate-800 p-2 rounded border">
                            <li>Historiales crediticios diversos</li>
                            <li>Préstamos vigentes, vencidos y en mora</li>
                            <li>Garantías de joyas, vehículos y electrodomésticos</li>
                            <li>Fechas de pago realistas</li>
                        </ul>
                    </div>

                    {result ? (
                        <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2 border border-green-200">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">{result}</span>
                        </div>
                    ) : (
                        <Button
                            onClick={handleSeed}
                            disabled={loading}
                            className="w-full h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Generando 500 Clientes...
                                </>
                            ) : (
                                "⚠️ BORRAR TODO Y GENERAR"
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
