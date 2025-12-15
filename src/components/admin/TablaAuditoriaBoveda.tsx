"use client"

import { useState, Fragment } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, FileText } from "lucide-react"

interface Movimiento {
    id: string
    tipo: string
    monto: number
    saldo_anterior: number
    saldo_nuevo: number
    referencia: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any
    fecha: string
    usuario_responsable_id: string
}

interface Props {
    movimientos: Movimiento[]
}

export function TablaAuditoriaBoveda({ movimientos }: Props) {
    const [expandido, setExpandido] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandido(expandido === id ? null : id)
    }

    const getTipoBadge = (tipo: string) => {
        const configs: Record<string, { label: string; className: string }> = {
            INYECCION_CAPITAL: { label: "Inyección", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
            ASIGNACION_CAJA: { label: "Asignación", className: "bg-blue-100 text-blue-800 border-blue-300" },
            DEVOLUCION_CAJA: { label: "Devolución", className: "bg-purple-100 text-purple-800 border-purple-300" },
        }

        const config = configs[tipo] || { label: tipo, className: "bg-slate-100 text-slate-800" }
        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        )
    }

    const formatMonto = (monto: number, tipo: string) => {
        const esPositivo = tipo === "INYECCION_CAPITAL" || tipo === "DEVOLUCION_CAJA"
        const signo = esPositivo ? "+ " : "- "
        const color = esPositivo ? "text-emerald-600" : "text-red-600"

        return (
            <span className={`${color} font-bold`}>
                {signo}S/ {Math.abs(monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
        )
    }

    const formatFecha = (fecha: string) => {
        try {
            return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es })
        } catch {
            return new Date(fecha).toLocaleString('es-PE')
        }
    }

    if (!movimientos || movimientos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Auditoría de Movimientos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No hay movimientos registrados aún</p>
                        <p className="text-sm">Los movimientos aparecerán aquí automáticamente</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Auditoría de Movimientos
                    <span className="text-sm text-slate-500 font-normal ml-auto">
                        Últimos {movimientos.length} movimientos
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-3 text-xs font-medium text-slate-600 uppercase w-8"></th>
                                <th className="text-left p-3 text-xs font-medium text-slate-600 uppercase">Fecha/Hora</th>
                                <th className="text-left p-3 text-xs font-medium text-slate-600 uppercase">Tipo</th>
                                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase">Monto</th>
                                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase">Saldo Anterior</th>
                                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase">Saldo Nuevo</th>
                                <th className="text-left p-3 text-xs font-medium text-slate-600 uppercase">Referencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((mov) => (
                                <Fragment key={mov.id}>
                                    {/* Fila Principal */}
                                    <tr
                                        onClick={() => toggleExpand(mov.id)}
                                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="p-3">
                                            {expandido === mov.id ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-slate-600">
                                            {formatFecha(mov.fecha)}
                                        </td>
                                        <td className="p-3">
                                            {getTipoBadge(mov.tipo)}
                                        </td>
                                        <td className="p-3 text-right text-sm">
                                            {formatMonto(mov.monto, mov.tipo)}
                                        </td>
                                        <td className="p-3 text-right text-sm text-slate-600">
                                            S/ {(mov.saldo_anterior ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-right text-sm font-semibold">
                                            S/ {(mov.saldo_nuevo ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-sm text-slate-700 truncate max-w-xs">
                                            {mov.referencia || "-"}
                                        </td>
                                    </tr>

                                    {/* Fila Expandida - Metadata */}
                                    {expandido === mov.id && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={7} className="p-4 border-b border-slate-200">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                                                            Detalles de la Operación
                                                        </p>
                                                        {mov.metadata && (
                                                            <>
                                                                {mov.metadata.nombre_aportante && (
                                                                    <p className="mb-1">
                                                                        <span className="font-medium">Aportante:</span>{" "}
                                                                        {mov.metadata.nombre_aportante}
                                                                    </p>
                                                                )}
                                                                {mov.metadata.numero_cuenta && (
                                                                    <p className="mb-1 font-mono text-xs">
                                                                        <span className="font-medium font-sans">Cuenta:</span>{" "}
                                                                        {mov.metadata.numero_cuenta}
                                                                    </p>
                                                                )}
                                                                {mov.metadata.numero_operacion && (
                                                                    <p className="mb-1 font-mono text-xs">
                                                                        <span className="font-medium font-sans">Operación:</span>{" "}
                                                                        {mov.metadata.numero_operacion}
                                                                    </p>
                                                                )}
                                                                {mov.metadata.tipo_comprobante && (
                                                                    <p className="mb-1">
                                                                        <span className="font-medium">Comprobante:</span>{" "}
                                                                        {mov.metadata.tipo_comprobante}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                                                            Metadata Completa (JSON)
                                                        </p>
                                                        <pre className="bg-slate-800 text-slate-100 p-2 rounded text-xs overflow-x-auto">
                                                            {JSON.stringify(mov.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                        Mostrando los últimos {movimientos.length} movimientos •
                        <button className="text-blue-600 hover:underline ml-1">
                            Ver historial completo
                        </button>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
