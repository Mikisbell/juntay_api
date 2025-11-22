'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContratoDetalleSheet } from '@/components/business/ContratoDetalleSheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ContratoDetalle {
    id: string
    codigo: string
    estado: string
    monto_prestado: number
    saldo_pendiente: number
    interes_acumulado: number
    tasa_interes: number
    fecha_vencimiento: string
    periodo_dias: number
    cliente_nombre: string
    garantia_descripcion: string
    garantia_valor: number
}

interface Props {
    contratos: ContratoDetalle[]
}

export function TablaContratos({ contratos }: Props) {
    const [selectedContrato, setSelectedContrato] = useState<ContratoDetalle | null>(null)

    const calcularDiasVencimiento = (fecha: string) => {
        const dias = Math.ceil(
            (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return dias
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contratos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                No hay contratos vigentes
                            </TableCell>
                        </TableRow>
                    ) : (
                        contratos.map((contrato) => {
                            const dias = calcularDiasVencimiento(contrato.fecha_vencimiento)
                            const urgente = dias < 7

                            return (
                                <TableRow key={contrato.id} className={urgente ? 'bg-amber-50' : ''}>
                                    <TableCell className="font-medium">{contrato.codigo}</TableCell>
                                    <TableCell>{contrato.cliente_nombre}</TableCell>
                                    <TableCell>S/ {contrato.monto_prestado.toFixed(2)}</TableCell>
                                    <TableCell className="font-bold text-rose-600">
                                        S/ {contrato.saldo_pendiente.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">
                                                {new Date(contrato.fecha_vencimiento).toLocaleDateString('es-PE')}
                                            </span>
                                            <span className={`text-xs ${dias < 0 ? 'text-red-600 font-bold' : dias < 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `${dias} días`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={contrato.estado === 'vigente' ? 'default' : 'destructive'}>
                                            {contrato.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedContrato(contrato)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Gestionar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>

            {/* Sheet de Detalle */}
            {selectedContrato && (
                <ContratoDetalleSheet
                    open={!!selectedContrato}
                    onClose={() => setSelectedContrato(null)}
                    contrato={selectedContrato}
                />
            )}
        </>
    )
}
