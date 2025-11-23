'use client'

import { AperturaCaja } from '@/components/caja/AperturaCaja'
import { CierreCaja } from '@/components/caja/CierreCaja'
import { useQuery } from '@tanstack/react-query'
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { CardSkeleton } from '@/components/ui/skeletons'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

export default function CajaPage() {
    const { data: estadoCaja, isLoading } = useQuery({
        queryKey: ['caja-estado'],
        queryFn: () => obtenerEstadoCaja(),
        staleTime: 1 * 60 * 1000,
        refetchInterval: 2 * 60 * 1000,
        refetchOnWindowFocus: true,
    })

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Caja Operativa</h2>
                    <p className="text-muted-foreground">Gestione la apertura y cierre de su turno.</p>
                </div>
                <CardSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Caja Operativa</h2>
                <p className="text-muted-foreground">Gestione la apertura y cierre de su turno.</p>
            </div>

            {estadoCaja ? (
                <div className="space-y-6">
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <AlertTitle className="text-emerald-800 font-semibold">Caja Abierta</AlertTitle>
                        <AlertDescription className="text-emerald-700">
                            Turno iniciado el {new Date(estadoCaja.fechaApertura).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' })}.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Resumen del Turno</CardTitle>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    Activo
                                </Badge>
                            </div>
                            <CardDescription>
                                Información en tiempo real de su caja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                                <div className="p-2 bg-background rounded-full border">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tiempo transcurrido</p>
                                    <p className="text-lg font-bold">Calculando...</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium mb-4">Acciones Disponibles</h4>
                                <CierreCaja />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-amber-800 font-semibold">Caja Cerrada</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            Debe realizar la apertura de caja para comenzar a operar.
                        </AlertDescription>
                    </Alert>

                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle>Apertura de Caja</CardTitle>
                            <CardDescription>
                                Ingrese el monto inicial para comenzar su turno.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AperturaCaja />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
