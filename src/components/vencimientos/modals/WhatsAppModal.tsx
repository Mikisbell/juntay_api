'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, User } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ContratoVencimiento } from '../types/contrato'

type CooldownInfo = {
    puedeEnviar: boolean
    mensaje?: string
    ultimaNotificacion?: string
} | null

type HistorialItem = {
    fecha: string
    tipo: string
    estado: string
}

type WhatsAppModalProps = {
    contrato: ContratoVencimiento
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    mensaje: string
    onMensajeChange: (mensaje: string) => void
    onRestaurar: () => void
    onEnviar: () => void
    enviando: boolean
    puedeEnviar: boolean
    cooldown?: CooldownInfo
    historial?: HistorialItem[]
}

export function WhatsAppModal({
    contrato,
    isOpen,
    onOpenChange,
    mensaje,
    onMensajeChange,
    onRestaurar,
    onEnviar,
    enviando,
    puedeEnviar,
    cooldown,
    historial = []
}: WhatsAppModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-[#ECE5DD]">
                <DialogHeader className="bg-[#128C7E] text-white rounded-t-lg -mt-6 -mx-6 px-6 py-4">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <FaWhatsapp className="h-5 w-5" />
                        Enviar Mensaje por WhatsApp
                    </DialogTitle>
                    <p className="text-sm text-white/80 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {contrato.cliente} • {contrato.telefono}
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Editor de Mensaje */}
                    <div className="space-y-3">
                        {/* Advertencia de Cooldown */}
                        {cooldown && !cooldown.puedeEnviar && (
                            <Card className="p-3 bg-amber-50 border-amber-400 border-2">
                                <div className="flex items-start gap-2">
                                    <div className="text-amber-600 mt-0.5">⚠️</div>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Espera antes de enviar</p>
                                        <p className="text-xs text-amber-800 mt-1">{cooldown.mensaje}</p>
                                        {cooldown.ultimaNotificacion && (
                                            <p className="text-xs text-amber-700 mt-1">
                                                Último mensaje: {new Date(cooldown.ultimaNotificacion).toLocaleString('es-PE')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Historial de Mensajes */}
                        {historial.length > 0 && (
                            <Card className="p-3 bg-gray-50 border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                    📜 Historial de Notificaciones
                                </p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {historial.slice(0, 3).map((not, idx) => (
                                        <div key={idx} className="text-xs border-l-2 border-blue-400 pl-2">
                                            <p className="font-medium text-gray-700">
                                                {new Date(not.fecha).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-gray-600">
                                                {not.tipo.replace('_', ' ')} •
                                                {not.estado === 'simulado' ? ' 🔵 Simulado' : ' ✅ Enviado'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Editar Mensaje</Label>
                            <Badge variant="outline" className="text-xs">
                                {mensaje.length} caracteres
                            </Badge>
                        </div>
                        <Textarea
                            value={mensaje}
                            onChange={(e) => onMensajeChange(e.target.value)}
                            rows={16}
                            className="font-sans text-sm resize-none bg-white"
                            placeholder="Escribe tu mensaje aquí..."
                        />

                        {/* Info del contrato */}
                        <Card className="p-3 bg-blue-50 border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Información del Contrato</p>
                            <div className="space-y-1 text-xs text-blue-800">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {contrato.diasRestantes === 0
                                            ? 'Vence HOY'
                                            : `Vence en ${contrato.diasRestantes} día${contrato.diasRestantes !== 1 ? 's' : ''}`
                                        } ({new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Saldo: S/. {contrato.saldo.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Vista Previa estilo WhatsApp */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Vista Previa (Como se verá en WhatsApp)</Label>
                        <div className="bg-[#0B141A] rounded-lg p-4 min-h-[400px] flex flex-col">
                            {/* Header WhatsApp */}
                            <div className="bg-[#202C33] rounded-t-lg -mx-4 -mt-4 px-4 py-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{contrato.cliente}</p>
                                        <p className="text-gray-400 text-xs">en línea</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje Preview */}
                            <div className="flex-1 overflow-y-auto space-y-2">
                                <div className="flex justify-end">
                                    <div className="bg-[#005C4B] text-white rounded-lg px-3 py-2 max-w-[85%] shadow-md">
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {mensaje || 'Escribe un mensaje...'}
                                        </p>
                                        <p className="text-[10px] text-gray-300 text-right mt-1">
                                            {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-500">
                                    El mensaje se enviará via WhatsApp Business
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between items-center pt-4 border-t -mb-6 -mx-6 px-6 pb-6 bg-white rounded-b-lg">
                    <Button
                        variant="ghost"
                        onClick={onRestaurar}
                        className="text-sm"
                    >
                        Restaurar Mensaje Original
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={enviando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onEnviar}
                            disabled={!puedeEnviar}
                            className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                        >
                            <FaWhatsapp className={`h-4 w-4 ${enviando ? 'animate-pulse' : ''}`} />
                            {enviando ? 'Enviando...' : 'Enviar por WhatsApp'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
