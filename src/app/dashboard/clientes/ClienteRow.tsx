"use client"

import { useRouter } from "next/navigation"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Star, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ClienteDropdownActions } from "./ClienteDropdownActions"

interface Cliente {
    id: string
    nombres: string
    apellido_paterno: string
    created_at: string
    numero_documento: string
    tipo_documento: string
    telefono_principal: string | null
    email: string | null
    proximo_vencimiento?: string | null
    deuda_total?: number
    score_crediticio?: number
    activo: boolean
}

interface ClienteRowProps {
    cliente: Cliente
}

// Determinar estado bancario del cliente
function getEstadoBancario(cliente: Cliente): 'vigente' | 'sin_creditos' | 'suspendido' {
    if (!cliente.activo) return 'suspendido'
    if (cliente.deuda_total && cliente.deuda_total > 0) return 'vigente'
    return 'sin_creditos'  // Activo pero sin créditos
}

// Configuración visual por estado
const estadoConfig = {
    vigente: {
        badge: 'Vigente',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rowClass: '',
        nameClass: 'text-slate-900 dark:text-white',
    },
    sin_creditos: {
        badge: 'Sin Créditos',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        rowClass: 'bg-slate-50/50 dark:bg-slate-900/30',
        nameClass: 'text-slate-600 dark:text-slate-400',
    },
    suspendido: {
        badge: 'Suspendido',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
        rowClass: 'bg-red-50/40 dark:bg-red-900/20 border-l-2 border-l-red-400',
        nameClass: 'text-red-700 dark:text-red-400',
    }
}

// Score crediticio badge
function getScoreBadge(score: number | undefined) {
    if (!score) return null
    if (score >= 700) return { icon: TrendingUp, color: 'text-emerald-500', label: 'A+' }
    if (score >= 500) return { icon: Minus, color: 'text-slate-400', label: 'B' }
    return { icon: TrendingDown, color: 'text-amber-500', label: 'C' }
}

export function ClienteRow({ cliente }: ClienteRowProps) {
    const router = useRouter()
    const estado = getEstadoBancario(cliente)
    const config = estadoConfig[estado]
    const scoreBadge = getScoreBadge(cliente.score_crediticio)

    const handleDoubleClick = () => {
        router.push(`/dashboard/clientes/${cliente.id}`)
    }

    // Helper para formato de vencimiento
    const getVencimientoDisplay = (fecha: string | null | undefined) => {
        if (!fecha) return <span className="text-slate-300">—</span>

        const venc = new Date(fecha)
        const hoy = new Date()
        const diffDias = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        const fechaStr = venc.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })

        if (diffDias < 0) {
            return (
                <div className="flex flex-col items-end">
                    <span className="text-red-600 font-bold text-sm">{fechaStr}</span>
                    <span className="text-[10px] text-red-500 font-medium">Vencido {Math.abs(diffDias)}d</span>
                </div>
            )
        }

        if (diffDias <= 7) {
            return (
                <div className="flex flex-col items-end">
                    <span className="text-amber-600 font-semibold text-sm">{fechaStr}</span>
                    <span className="text-[10px] text-amber-500">En {diffDias}d</span>
                </div>
            )
        }

        return <span className="text-slate-600 text-sm">{fechaStr}</span>
    }

    return (
        <TableRow
            onDoubleClick={handleDoubleClick}
            className={`group hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-all cursor-pointer ${config.rowClass}`}
        >
            {/* Cliente: Avatar + Nombre + DNI + Score */}
            <TableCell className="pl-6 py-3">
                <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 ring-2 ring-offset-2 shadow-sm transition-transform group-hover:scale-105 ${estado === 'suspendido' ? 'ring-red-200 opacity-70' :
                            estado === 'sin_creditos' ? 'ring-slate-200' : 'ring-emerald-200'
                        }`}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombres}&backgroundColor=f1f5f9`} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 text-xs font-medium">
                            {cliente.nombres?.[0]}{cliente.apellido_paterno?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm transition-colors ${config.nameClass} group-hover:text-primary`}>
                                {cliente.nombres} {cliente.apellido_paterno}
                            </span>
                            {scoreBadge && (
                                <div className={`flex items-center gap-0.5 ${scoreBadge.color}`} title={`Score: ${cliente.score_crediticio}`}>
                                    <scoreBadge.icon className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">{scoreBadge.label}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                            {cliente.tipo_documento} {cliente.numero_documento}
                        </span>
                    </div>
                </div>
            </TableCell>

            {/* Deuda Total */}
            <TableCell className="text-right py-3">
                {cliente.deuda_total && cliente.deuda_total > 0 ? (
                    <div className="flex flex-col items-end">
                        <span className="text-slate-900 dark:text-white font-bold text-sm">
                            S/ {cliente.deuda_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                ) : (
                    <span className="text-slate-300 text-sm">—</span>
                )}
            </TableCell>

            {/* Próximo Vencimiento */}
            <TableCell className="text-right py-3">
                {getVencimientoDisplay(cliente.proximo_vencimiento)}
            </TableCell>

            {/* Contacto */}
            <TableCell className="py-3">
                {cliente.telefono_principal ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/phone hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5 text-slate-400 group-hover/phone:text-primary" />
                        <span className="font-mono text-xs">{cliente.telefono_principal}</span>
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-300 italic">Sin teléfono</span>
                )}
            </TableCell>

            {/* Estado Bancario */}
            <TableCell className="text-center py-3">
                <Badge variant="outline" className={`text-[10px] h-6 px-2.5 font-medium ${config.badgeClass}`}>
                    {config.badge}
                </Badge>
            </TableCell>

            {/* Acciones */}
            <TableCell className="text-right pr-6 py-3" onClick={(e) => e.stopPropagation()}>
                <ClienteDropdownActions cliente={cliente} />
            </TableCell>
        </TableRow>
    )
}

