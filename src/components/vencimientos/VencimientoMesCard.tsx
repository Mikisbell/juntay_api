'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { ContratoVencimiento } from './types/contrato'
import { useWhatsAppModal } from './hooks/useWhatsAppModal'
import { WhatsAppModal } from './modals/WhatsAppModal'

type Props = {
    contrato: ContratoVencimiento
}

export function VencimientoMesCard({ contrato }: Props) {
    const modal = useWhatsAppModal(contrato)

    return (
        <>
            <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{contrato.codigo}</Badge>
                    <span className="text-sm font-medium">{contrato.cliente}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                        {new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')}
                    </span>
                    <Badge variant="secondary">{contrato.diasRestantes}d</Badge>
                    <span className="font-semibold">S/. {contrato.monto.toFixed(2)}</span>
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={modal.llamar}
                            disabled={!contrato.telefono}
                            title="Llamar"
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-[#25D366] hover:text-[#128C7E] hover:bg-green-50"
                            onClick={modal.abrirModal}
                            disabled={!contrato.telefono}
                            title="WhatsApp"
                        >
                            <FaWhatsapp className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/dashboard/contratos/${contrato.id}`}
                        >
                            Ver Detalle
                        </Button>
                    </div>
                </div>
            </div>

            <WhatsAppModal
                contrato={contrato}
                isOpen={modal.isOpen}
                onOpenChange={modal.cerrarModal}
                mensaje={modal.mensaje}
                onMensajeChange={modal.setMensaje}
                onRestaurar={modal.restaurarMensaje}
                onEnviar={modal.enviar}
                enviando={modal.enviando}
                puedeEnviar={modal.puedeEnviar}
                cooldown={modal.cooldown}
                historial={modal.historial}
            />
        </>
    )
}
