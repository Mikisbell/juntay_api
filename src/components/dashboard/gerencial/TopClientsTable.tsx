'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TopClientsProps {
    data: {
        id: string
        nombre: string
        total_pagado: number
        creditos_activos: number
        ultimo_pago: string | null
    }[]
}

export function TopClientsTable({ data }: TopClientsProps) {
    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0
    })

    function getInitials(name: string) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Card className="col-span-4 lg:col-span-2 border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Top Clientes VIP</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {data.map((cliente, i) => (
                        <div key={cliente.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className={cn(
                                    "font-medium",
                                    i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                                        i === 1 ? "bg-zinc-400/20 text-zinc-400" :
                                            i === 2 ? "bg-amber-700/20 text-amber-700" :
                                                "bg-primary/10 text-primary"
                                )}>
                                    {getInitials(cliente.nombre)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{cliente.nombre}</p>
                                <p className="text-xs text-muted-foreground">
                                    {cliente.creditos_activos} créditos activos
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-sm">
                                {formatter.format(cliente.total_pagado)}
                            </div>
                        </div>
                    ))}

                    {data.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            No hay datos suficientes
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
