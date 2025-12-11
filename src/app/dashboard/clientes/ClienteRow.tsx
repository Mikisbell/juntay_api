"use client"

import { useRouter } from "next/navigation"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, ShieldCheck } from "lucide-react"
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
    proximo_vencimiento?: string | null // Nuevo campo
    deuda_total?: number
    score_crediticio?: number
    activo: boolean
}

interface ClienteRowProps {
    cliente: Cliente
}

export function ClienteRow({ cliente }: ClienteRowProps) {
    const router = useRouter()

    const handleDoubleClick = () => {
        router.push(`/dashboard/clientes/${cliente.id}`)
    }

    // Helper para formato de vencimiento compacto
    const getVencimientoDisplay = (fecha: string | null | undefined) => {
        if (!fecha) return <span className="text-slate-300">-</span>

        const venc = new Date(fecha)
        const hoy = new Date()
        const diffDias = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

        const fechaStr = venc.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })

        if (diffDias < 0) { // Vencido (CRÍTICO)
            return (
                <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold px-2">
                        Vencido
                    </Badge>
                    <span className="text-[11px] text-red-600/80 font-medium mt-0.5">{fechaStr} ({Math.abs(diffDias)}d)</span>
                </div>
            )
        }

        if (diffDias <= 7) { // Próximo (ALERTA)
            return (
                <div className="flex flex-col items-end">
                    <span className="text-amber-600 font-semibold">{fechaStr}</span>
                    <span className="text-[10px] text-amber-500 font-medium">En {diffDias} días</span>
                </div>
            )
        }

        return <span className="text-slate-500 font-medium">{fechaStr}</span>
    }

    return (
        <TableRow
            onDoubleClick={handleDoubleClick}
            className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${!cliente.activo ? 'opacity-60 bg-slate-50' : ''}`}
        >
            {/* 1. Cliente Identidad (Foto + Nombre + DNI) */}
            <TableCell className="pl-6 py-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombres}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px]">{cliente.nombres?.[0]}{cliente.apellido_paterno?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                            {cliente.nombres} {cliente.apellido_paterno}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground leading-tight">
                            <span>{cliente.tipo_documento} {cliente.numero_documento}</span>
                        </div>
                    </div>
                </div>
            </TableCell>

            {/* 2. KPI: Deuda Total (Destacado) */}
            <TableCell className="text-right">
                {cliente.deuda_total && cliente.deuda_total > 0 ? (
                    <span className="text-slate-900 dark:text-white font-bold text-sm bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        S/ {cliente.deuda_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                ) : (
                    <span className="text-slate-300">-</span>
                )}
            </TableCell>

            {/* 3. KPI: Vencimiento (Semáforo real) */}
            <TableCell className="text-right">
                {getVencimientoDisplay(cliente.proximo_vencimiento)}
            </TableCell>

            {/* 4. Contacto (Secundario) */}
            <TableCell>
                <div className="flex flex-col gap-0.5">
                    {cliente.telefono_principal ? (
                        <div className="flex items-center text-xs text-slate-500">
                            <Phone className="mr-1.5 h-3 w-3 text-slate-400" />
                            {cliente.telefono_principal}
                        </div>
                    ) : (
                        <span className="text-[10px] text-slate-300 italic">Sin contacto</span>
                    )}
                </div>
            </TableCell>

            {/* 5. Estado (Solo Excepciones) */}
            <TableCell className="text-center">
                {!cliente.activo && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 text-slate-500 bg-slate-100">
                        Inactivo
                    </Badge>
                )}
                {/* Score solo si es excelente (Oportunidad) o muy malo (Riesgo), omitir promedio */}
                {cliente.score_crediticio && cliente.score_crediticio >= 700 && (
                    <Badge variant="outline" className="ml-1 text-[10px] h-5 px-1.5 text-emerald-600 bg-emerald-50 border-emerald-100">
                        A+
                    </Badge>
                )}
            </TableCell>

            {/* 6. Acciones */}
            <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                <ClienteDropdownActions cliente={cliente} />
            </TableCell>
        </TableRow>
    )
}
