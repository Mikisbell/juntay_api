'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { ContratoVencimiento } from './types/contrato'
import { useWhatsAppModal } from './hooks/useWhatsAppModal'
import { WhatsAppModal } from './modals/WhatsAppModal'

// =================================================================
// VencimientoHoyCard - Para contratos que vencen hoy (urgente)
// =================================================================

export function VencimientoHoyCard({ contrato }: { contrato: ContratoVencimiento }) {
    const modal = useWhatsAppModal(contrato)

    return (
        <>
            <div className="flex items-center justify-between border rounded-lg p-4 bg-red-50/50 border-red-200">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="destructive">{contrato.codigo}</Badge>
                        <span className="font-semibold">{contrato.cliente}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Monto: S/. {contrato.monto.toFixed(2)}</span>
                        <span>•</span>
                        <span>{contrato.telefono || 'Sin teléfono'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={modal.llamar}
                        disabled={!contrato.telefono}
                    >
                        <Phone className="h-4 w-4" />
                        Llamar
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                        onClick={modal.abrirModal}
                        disabled={!contrato.telefono}
                    >
                        <FaWhatsapp className="h-4 w-4" />
                        WhatsApp
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

// =================================================================
// VencimientoSemanaCard - Para contratos que vencen esta semana
// =================================================================

export function VencimientoSemanaCard({ contrato }: { contrato: ContratoVencimiento }) {
    const modal = useWhatsAppModal(contrato)

    return (
        <>
            <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline">{contrato.codigo}</Badge>
                        <span className="font-medium">{contrato.cliente}</span>
                        <Badge variant={contrato.diasRestantes <= 3 ? "destructive" : "secondary"}>
                            {contrato.diasRestantes} días
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Vence: {new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')}</span>
                        <span>•</span>
                        <span>S/. {contrato.monto.toFixed(2)}</span>
                        <span>•</span>
                        <span>{contrato.telefono || 'Sin teléfono'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                        onClick={modal.abrirModal}
                        disabled={!contrato.telefono}
                    >
                        <FaWhatsapp className="h-4 w-4" />
                        WhatsApp
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
