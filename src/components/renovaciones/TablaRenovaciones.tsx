'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { ContratoRenovable } from '@/lib/actions/renovaciones-actions'
import { RenovacionModal } from '@/components/renovaciones/RenovacionModal'

type Props = {
    contratos: ContratoRenovable[]
}

export function TablaRenovaciones({ contratos }: Props) {
    const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoRenovable | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const handleRenovar = (contrato: ContratoRenovable) => {
        setContratoSeleccionado(contrato)
        setModalOpen(true)
    }

    return (
        <>
            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="text-left p-4 font-medium">Código</th>
                            <th className="text-left p-4 font-medium">Cliente</th>
                            <th className="text-left p-4 font-medium">Vencimiento</th>
                            <th className="text-left p-4 font-medium">Días</th>
                            <th className="text-right p-4 font-medium">Préstamo</th>
                            <th className="text-right p-4 font-medium">Interés</th>
                            <th className="text-center p-4 font-medium">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contratos.map((contrato) => (
                            <tr key={contrato.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-4 font-mono text-sm">{contrato.codigo}</td>
                                <td className="p-4">{contrato.cliente_nombre}</td>
                                <td className="p-4">{new Date(contrato.fecha_vencimiento).toLocaleDateString('es-PE')}</td>
                                <td className="p-4">
                                    <Badge variant={contrato.dias_restantes <= 3 ? "destructive" : "secondary"}>
                                        {contrato.dias_restantes} días
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">S/. {contrato.monto_prestado.toFixed(2)}</td>
                                <td className="p-4 text-right font-semibold">S/. {contrato.interes_acumulado.toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleRenovar(contrato)}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Renovar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {contratos.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                    No hay contratos que coincidan con los filtros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <RenovacionModal
                contrato={contratoSeleccionado}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    )
}
