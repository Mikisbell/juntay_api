'use client'

import { FormularioPago } from '@/components/pagos/FormularioPago'
import { useQuery } from '@tanstack/react-query'
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { CardSkeleton } from '@/components/ui/skeletons'
import { StatusAlert } from '@/components/layout/StatusAlert'
import { STATUS_MESSAGES } from '@/lib/constants/messages'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, CreditCard } from 'lucide-react'

export default function PagosPage() {
    const { data: estadoCaja, isLoading, error } = useQuery({
        queryKey: ['caja-estado'],
        queryFn: () => obtenerEstadoCaja(),
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
                    <p className="text-muted-foreground">Registre cobros y administre transacciones financieras.</p>
                </div>
                <CardSkeleton />
            </div>
        )
    }

    if (error || !estadoCaja) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
                    <p className="text-muted-foreground">Registre cobros y administre transacciones financieras.</p>
                </div>
                <StatusAlert
                    variant="error"
                    title={STATUS_MESSAGES.cajaCerrada.title}
                    description={STATUS_MESSAGES.cajaCerrada.description}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
                <p className="text-muted-foreground">Registre cobros y administre transacciones financieras.</p>
            </div>

            <Tabs defaultValue="registrar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="registrar">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Registrar Pago
                    </TabsTrigger>
                    <TabsTrigger value="historial">
                        <History className="mr-2 h-4 w-4" />
                        Historial Reciente
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="registrar" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nueva Transacción</CardTitle>
                            <CardDescription>
                                Ingrese los detalles del pago o desempeño.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormularioPago cajaId={estadoCaja.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="historial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Pagos</CardTitle>
                            <CardDescription>
                                Últimos movimientos registrados en esta caja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                Historial de pagos próximamente...
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
