"use client"

import { useRouter } from "next/navigation"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, TrendingUp, TrendingDown, Minus, MessageCircle, DollarSign, Sparkles } from "lucide-react"
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
function getEstadoBancario(cliente: Cliente): 'critico' | 'alerta' | 'vigente' | 'sin_creditos' | 'suspendido' {
    if (!cliente.activo) return 'suspendido'
    if (!cliente.deuda_total || cliente.deuda_total === 0) return 'sin_creditos'

    // Check vencimiento
    if (cliente.proximo_vencimiento) {
        const venc = new Date(cliente.proximo_vencimiento)
        const hoy = new Date()
        const diffDias = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDias < 0) return 'critico'  // Vencido
        if (diffDias <= 7) return 'alerta'   // Por vencer
    }

    return 'vigente'
}

// Check if client is new (created < 7 days ago)
function isClienteNuevo(createdAt: string): boolean {
    const created = new Date(createdAt)
    const hoy = new Date()
    const diffDias = Math.ceil((hoy.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return diffDias <= 7
}

// Configuración visual por estado
const estadoConfig = {
    critico: {
        badge: 'Vencido',
        badgeClass: 'bg-red-100 text-red-700 border-red-300 animate-pulse',
        rowClass: 'bg-red-50/60 dark:bg-red-950/40 border-l-4 border-l-red-500',
        nameClass: 'text-red-700 dark:text-red-400',
        showCobrar: true,
    },
    alerta: {
        badge: 'Por Vencer',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
        rowClass: 'bg-amber-50/40 dark:bg-amber-950/30 border-l-2 border-l-amber-400',
        nameClass: 'text-slate-900 dark:text-white',
        showCobrar: true,
    },
    vigente: {
        badge: 'Vigente',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rowClass: '',
        nameClass: 'text-slate-900 dark:text-white',
        showCobrar: false,
    },
    sin_creditos: {
        badge: 'Sin Créditos',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        rowClass: 'bg-slate-50/50 dark:bg-slate-900/30',
        nameClass: 'text-slate-600 dark:text-slate-400',
        showCobrar: false,
    },
    suspendido: {
        badge: 'Suspendido',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
        rowClass: 'bg-red-50/40 dark:bg-red-900/20 border-l-2 border-l-red-400 opacity-70',
        nameClass: 'text-red-700 dark:text-red-400',
        showCobrar: false,
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
    const esNuevo = isClienteNuevo(cliente.created_at)

    const handleDoubleClick = () => {
        router.push(`/dashboard/clientes/${cliente.id}`)
    }

    const handleCobrar = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/dashboard/cobros/registrar?cliente=${cliente.id}`)
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
                    <span className="text-[10px] text-red-500 font-semibold bg-red-100 px-1.5 rounded">
                        ⚠️ {Math.abs(diffDias)}d vencido
                    </span>
                </div>
            )
        }

        if (diffDias <= 7) {
            return (
                <div className="flex flex-col items-end">
                    <span className="text-amber-600 font-semibold text-sm">{fechaStr}</span>
                    <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 rounded">En {diffDias}d</span>
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
            {/* Cliente: Avatar + Nombre + DNI + Score + NUEVO badge */}
            <TableCell className="pl-6 py-3">
                <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 ring-2 ring-offset-2 shadow-sm transition-transform group-hover:scale-105 ${estado === 'suspendido' ? 'ring-red-200 opacity-70' :
                            estado === 'critico' ? 'ring-red-300' :
                                estado === 'alerta' ? 'ring-amber-300' :
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
                            {esNuevo && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0 h-4 gap-0.5">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    NUEVO
                                </Badge>
                            )}
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
                        <span className={`font-bold text-sm ${estado === 'critico' ? 'text-red-700' : 'text-slate-900 dark:text-white'}`}>
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

            {/* Contacto - AHORA CON WHATSAPP VISIBLE */}
            <TableCell className="py-3">
                {cliente.telefono_principal ? (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-mono text-xs">{cliente.telefono_principal}</span>
                        </div>
                        {/* WHATSAPP VISIBLE BUTTON */}
                        <a
                            href={`https://wa.me/51${cliente.telefono_principal.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition-colors"
                            title="Enviar WhatsApp"
                        >
                            <MessageCircle className="h-4 w-4" />
                        </a>
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-300 italic">Sin teléfono</span>
                )}
            </TableCell>

            {/* Estado Bancario + Acciones Inline */}
            <TableCell className="text-center py-3">
                <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className={`text-[10px] h-6 px-2.5 font-medium ${config.badgeClass}`}>
                        {config.badge}
                    </Badge>

                    {/* COBRAR BUTTON - Solo para vencidos o por vencer */}
                    {config.showCobrar && cliente.activo && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCobrar}
                            className="h-6 px-2 text-xs gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                            <DollarSign className="h-3 w-3" />
                            Cobrar
                        </Button>
                    )}
                </div>
            </TableCell>

            {/* Acciones Dropdown */}
            <TableCell className="text-right pr-6 py-3" onClick={(e) => e.stopPropagation()}>
                <ClienteDropdownActions cliente={cliente} />
            </TableCell>
        </TableRow>
    )
}
