'use client'

import { AperturaCaja } from '@/components/caja/AperturaCaja'
import { CajeroTerminal } from '@/components/caja/CajeroTerminal'
import { useQuery } from '@tanstack/react-query'
import { obtenerCajaCompleta, obtenerRolUsuario } from '@/lib/actions/caja-actions'
import { CardSkeleton } from '@/components/ui/skeletons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Monitor } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CajaPage() {
    const { data: caja, isLoading: loadingCaja } = useQuery({
        queryKey: ['caja', 'completa'],
        queryFn: () => obtenerCajaCompleta(),
        staleTime: 0, // Siempre fresco
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
    })

    const { data: rol, isLoading: loadingRol } = useQuery({
        queryKey: ['usuario-rol'],
        queryFn: () => obtenerRolUsuario(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    })

    const isLoading = loadingCaja || loadingRol
    const isAdmin = rol === 'admin' || rol === 'gerente'

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Terminal de Caja</h2>
                    <p className="text-muted-foreground">Gestione su turno operativo.</p>
                </div>
                <CardSkeleton />
            </div>
        )
    }

    // Si tiene caja abierta, mostrar terminal
    if (caja) {
        return (
            <div className="max-w-7xl mx-auto">
                {isAdmin ? (
                    <Tabs defaultValue="terminal" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Terminal de Caja</h2>
                                <p className="text-muted-foreground">Gestione su turno operativo.</p>
                            </div>
                            <TabsList>
                                <TabsTrigger value="terminal" className="gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Mi Terminal
                                </TabsTrigger>
                                <TabsTrigger value="monitor" className="gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Monitor
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="terminal" className="space-y-6">
                            <CajeroTerminal caja={caja} />
                        </TabsContent>

                        <TabsContent value="monitor" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monitor de Cajas</CardTitle>
                                    <CardDescription>
                                        Supervise todas las cajas activas en tiempo real.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/dashboard/admin/monitor-cajas">
                                            Ir al Monitor Completo
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Terminal de Caja</h2>
                            <p className="text-muted-foreground">Gestione su turno operativo.</p>
                        </div>
                        <CajeroTerminal caja={caja} />
                    </div>
                )}
            </div>
        )
    }

    // Si no tiene caja abierta, mostrar formulario de apertura
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-sm space-y-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Terminal de Caja</h2>
                    <p className="text-sm text-muted-foreground">Inicia tu turno operativo</p>
                </div>

                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <AperturaCaja />
                </div>

                {isAdmin && (
                    <div className="text-center pt-4">
                        <Link href="/dashboard/admin/monitor-cajas" className="text-sm text-slate-500 hover:text-primary flex items-center justify-center gap-1 transition-colors">
                            <Monitor className="h-3 w-3" />
                            <span>Supervisar cajas activas</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
