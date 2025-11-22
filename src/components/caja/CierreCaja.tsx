'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { LockKeyhole, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CierreCaja() {
    const router = useRouter()

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md border-t-4 border-t-rose-500">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-rose-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <LockKeyhole className="w-8 h-8 text-rose-500" />
                    </div>
                    <CardTitle className="text-2xl text-rose-700">Cierre de Caja</CardTitle>
                    <CardDescription className="text-slate-600 mt-2">
                        Sistema de cierre ciego con arqueo de efectivo
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <p className="font-medium mb-2">📋 Proceso de Cierre:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Cuenta billetes y monedas por denominación</li>
                            <li>El sistema calculará el total automáticamente</li>
                            <li>Se comparará con el saldo teórico del sistema</li>
                            <li>Se mostrará si hay diferencias (sobrante/faltante)</li>
                        </ol>
                    </div>

                    <Button
                        className="w-full h-12 text-lg bg-rose-600 hover:bg-rose-700"
                        onClick={() => router.push('/dashboard/caja/cierre')}
                    >
                        <Calculator className="mr-2 h-5 w-5" />
                        Iniciar Cierre Ciego
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
