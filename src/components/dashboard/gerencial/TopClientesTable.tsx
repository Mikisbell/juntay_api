'use client'

/**
 * TopClientesTable - Ranked table of top 10 clients
 * Shows position, name, total paid, and last payment
 */

import { formatearMonto } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Crown, Medal, Trophy } from 'lucide-react'

interface TopCliente {
    id: string
    nombre: string
    total_pagado: number
    creditos_activos: number
    ultimo_pago: string | null
}

interface TopClientesTableProps {
    clientes: TopCliente[]
}

export function TopClientesTable({ clientes }: TopClientesTableProps) {
    if (clientes.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                No hay datos de clientes
            </div>
        )
    }

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg">
                        <Trophy className="w-4 h-4 text-yellow-900" />
                    </div>
                )
            case 2:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow">
                        <Medal className="w-4 h-4 text-slate-700" />
                    </div>
                )
            case 3:
                return (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow">
                        <Medal className="w-4 h-4 text-amber-100" />
                    </div>
                )
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                        {rank}
                    </div>
                )
        }
    }

    return (
        <div className="space-y-2">
            {clientes.map((cliente, index) => (
                <div
                    key={cliente.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-slate-50 ${index === 0 ? 'bg-yellow-50/50 border border-yellow-200' :
                            index === 1 ? 'bg-slate-50/50 border border-slate-200' :
                                index === 2 ? 'bg-amber-50/50 border border-amber-200' :
                                    'border border-transparent'
                        }`}
                >
                    {/* Rank Badge */}
                    {getRankBadge(index + 1)}

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {cliente.nombre.charAt(0).toUpperCase()}
                    </div>

                    {/* Name and details */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                            {cliente.nombre}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{cliente.creditos_activos} crédito{cliente.creditos_activos !== 1 ? 's' : ''} activo{cliente.creditos_activos !== 1 ? 's' : ''}</span>
                            {cliente.ultimo_pago && (
                                <>
                                    <span>•</span>
                                    <span>Último: {format(new Date(cliente.ultimo_pago), 'dd MMM', { locale: es })}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                        <p className={`font-bold ${index === 0 ? 'text-yellow-600' :
                                index === 1 ? 'text-slate-600' :
                                    index === 2 ? 'text-amber-700' :
                                        'text-slate-700'
                            }`}>
                            {formatearMonto(cliente.total_pagado)}
                        </p>
                        <p className="text-xs text-slate-400">total pagado</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
