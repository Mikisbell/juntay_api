"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Credito {
    id: string
    codigo_credito?: string
    monto_prestamo: number
    saldo_actual?: number
    fecha_desembolso: string
    fecha_vencimiento: string
    estado: string
    garantia?: {
        descripcion: string
    }
}

interface ClienteHistorialProps {
    clienteId: string
    clienteNombre: string
    creditos: Credito[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const estadoConfig: Record<string, { label: string; color: string; icon: any }> = {
    PAGADO: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    ACTIVO: { label: 'Activo', color: 'bg-blue-100 text-blue-800', icon: Clock },
    VENCIDO: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800', icon: Clock },
    DESEMBOLSADO: { label: 'Activo', color: 'bg-blue-100 text-blue-800', icon: Clock },
    CANCELADO: { label: 'Cancelado', color: 'bg-slate-100 text-slate-800', icon: CheckCircle },
}

export function ClienteHistorial({ clienteId, clienteNombre, creditos }: ClienteHistorialProps) {
    // Ordenar por fecha más reciente primero
    const creditosOrdenados = [...creditos].sort((a, b) =>
        new Date(b.fecha_desembolso).getTime() - new Date(a.fecha_desembolso).getTime()
    )

    // Estadísticas
    const totalPrestado = creditos.reduce((sum, c) => sum + c.monto_prestamo, 0)
    const creditosPagados = creditos.filter(c => c.estado === 'PAGADO' || c.estado === 'CANCELADO').length
    const creditosActivos = creditos.filter(c => ['ACTIVO', 'DESEMBOLSADO', 'PENDIENTE'].includes(c.estado)).length
    const creditosVencidos = creditos.filter(c => c.estado === 'VENCIDO').length

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-slate-600" />
                    Historial de {clienteNombre}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Estadísticas Resumen */}
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xl font-bold text-slate-700">{creditos.length}</p>
                        <p className="text-[10px] text-slate-500">Total</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded">
                        <p className="text-xl font-bold text-emerald-700">{creditosPagados}</p>
                        <p className="text-[10px] text-emerald-600">Pagados</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xl font-bold text-blue-700">{creditosActivos}</p>
                        <p className="text-[10px] text-blue-600">Activos</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                        <p className="text-xl font-bold text-red-700">{creditosVencidos}</p>
                        <p className="text-[10px] text-red-600">Vencidos</p>
                    </div>
                </div>

                {/* Total Prestado */}
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-slate-600" />
                    <div>
                        <p className="text-xs text-slate-500">Monto total prestado</p>
                        <p className="text-lg font-bold text-slate-700">S/ {totalPrestado.toFixed(2)}</p>
                    </div>
                </div>

                {/* Lista de Créditos */}
                <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                        {creditosOrdenados.map(credito => {
                            const config = estadoConfig[credito.estado] || estadoConfig.PENDIENTE
                            const IconComponent = config.icon

                            return (
                                <div key={credito.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-sm">#{credito.codigo_credito || credito.id.slice(0, 8)}</p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(credito.fecha_desembolso), "dd MMM yyyy", { locale: es })}
                                            </p>
                                        </div>
                                        <Badge className={`text-xs ${config.color}`}>
                                            <IconComponent className="h-3 w-3 mr-1" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-600 truncate max-w-[150px]">
                                            {credito.garantia?.descripcion || 'Sin descripción'}
                                        </p>
                                        <p className="font-bold text-sm">S/ {credito.monto_prestamo.toFixed(2)}</p>
                                    </div>
                                </div>
                            )
                        })}

                        {creditos.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Sin historial de créditos</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
