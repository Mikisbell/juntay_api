'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Send, User, Calendar, DollarSign } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { enviarNotificacion } from '@/lib/actions/vencimientos-actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

type Contrato = {
    id: string
    codigo: string
    cliente: string
    telefono: string
    monto: number
    saldo: number
    fechaVencimiento: string
    diasRestantes: number
}

export function VencimientoHoyCard({ contrato }: { contrato: Contrato }) {
    const [enviando, setEnviando] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [mensajePersonalizado, setMensajePersonalizado] = useState('')
    const [cooldownInfo, setCooldownInfo] = useState<any>(null)
    const [historial, setHistorial] = useState<any[]>([])
    const [cargando, setCargando] = useState(false)

    const mensajePredeterminado = `Estimado/a ${contrato.cliente},

Le recordamos que su contrato ${contrato.codigo} vence HOY.

Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Por favor, acérquese a nuestras oficinas para regularizar su situación.

Gracias por su preferencia.
JUNTAY - Casa de Empeños`

    const handleLlamar = () => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }
        const tel = contrato.telefono.replace(/\D/g, '')
        window.location.href = `tel:${tel}`
    }

    const handleAbrirModal = async () => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }
        setMensajePersonalizado(mensajePredeterminado)
        setModalAbierto(true)

        // Cargar historial y verificar cooldown
        setCargando(true)
        try {
            const { verificarCooldownNotificacion, obtenerHistorialNotificaciones } = await import('@/lib/actions/vencimientos-actions')

            const [cooldown, hist] = await Promise.all([
                verificarCooldownNotificacion(contrato.id),
                obtenerHistorialNotificaciones(contrato.id)
            ])

            setCooldownInfo(cooldown)
            setHistorial(hist || [])
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setCargando(false)
        }
    }

    const handleEnviarRecordatorio = async () => {
        setEnviando(true)
        try {
            const resultado = await enviarNotificacion(
                contrato.telefono,
                contrato.cliente,
                'vencimiento_hoy',
                {
                    creditoId: contrato.id,
                    clienteId: contrato.id, // TODO: Obtener cliente_id real del contrato
                    codigo: contrato.codigo,
                    fecha: contrato.fechaVencimiento,
                    monto: contrato.saldo,
                    mensajePersonalizado
                }
            )

            if (resultado.success) {
                alert(`✅ ${resultado.mensaje}`)
                setModalAbierto(false)
                // Recargar historial después de enviar
                const { obtenerHistorialNotificaciones } = await import('@/lib/actions/vencimientos-actions')
                const hist = await obtenerHistorialNotificaciones(contrato.id)
                setHistorial(hist || [])
            } else {
                alert(`❌ ${resultado.mensaje}`)
            }
        } catch (error) {
            console.error(error)
            alert('Error al enviar notificación')
        } finally {
            setEnviando(false)
        }
    }

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
                        onClick={handleLlamar}
                        disabled={!contrato.telefono}
                    >
                        <Phone className="h-4 w-4" />
                        Llamar
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                        onClick={handleAbrirModal}
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

            {/* Modal estilo WhatsApp */}
            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
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
                            {cooldownInfo && !cooldownInfo.puedeEnviar && (
                                <Card className="p-3 bg-amber-50 border-amber-400 border-2">
                                    <div className="flex items-start gap-2">
                                        <div className="text-amber-600 mt-0.5">⚠️</div>
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900">Espera antes de enviar</p>
                                            <p className="text-xs text-amber-800 mt-1">{cooldownInfo.mensaje}</p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                Último mensaje: {new Date(cooldownInfo.ultimaNotificacion).toLocaleString('es-PE')}
                                            </p>
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
                                        {historial.slice(0, 3).map((not: any, idx: number) => (
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
                                    {mensajePersonalizado.length} caracteres
                                </Badge>
                            </div>
                            <Textarea
                                value={mensajePersonalizado}
                                onChange={(e) => setMensajePersonalizado(e.target.value)}
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
                                        <span>Vence: {new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE', { dateStyle: 'long' })}</span>
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
                                    {/* Mensaje del negocio (derecha, verde) */}
                                    <div className="flex justify-end">
                                        <div className="bg-[#005C4B] text-white rounded-lg px-3 py-2 max-w-[85%] shadow-md">
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {mensajePersonalizado || 'Escribe un mensaje...'}
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
                            onClick={() => setMensajePersonalizado(mensajePredeterminado)}
                            className="text-sm"
                        >
                            Restaurar Mensaje Original
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setModalAbierto(false)}
                                disabled={enviando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleEnviarRecordatorio}
                                disabled={enviando || !mensajePersonalizado.trim() || (cooldownInfo && !cooldownInfo.puedeEnviar)}
                                className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                            >
                                <FaWhatsapp className={`h-4 w-4 ${enviando ? 'animate-pulse' : ''}`} />
                                {enviando ? 'Enviando...' : 'Enviar por WhatsApp'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export function VencimientoSemanaCard({ contrato }: { contrato: Contrato }) {
    const [enviando, setEnviando] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [mensajePersonalizado, setMensajePersonalizado] = useState('')

    const mensajePredeterminado = `Estimado/a ${contrato.cliente},

Le recordamos que su contrato ${contrato.codigo} vence en ${contrato.diasRestantes} día${contrato.diasRestantes !== 1 ? 's' : ''}.

📅 Fecha de vencimiento: ${new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE', { dateStyle: 'long' })}
💰 Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Le invitamos a acercarse a nuestras oficinas antes del vencimiento.

Gracias por su preferencia.
JUNTAY - Casa de Empeños`

    const handleAbrirModal = () => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }
        setMensajePersonalizado(mensajePredeterminado)
        setModalAbierto(true)
    }

    const handleEnviarWhatsApp = async () => {
        setEnviando(true)
        try {
            const resultado = await enviarNotificacion(
                contrato.telefono,
                contrato.cliente,
                'vencimiento_proximo',
                {
                    creditoId: contrato.id,
                    clienteId: contrato.id, // TODO: Obtener cliente_id real
                    codigo: contrato.codigo,
                    fecha: contrato.fechaVencimiento,
                    monto: contrato.saldo,
                    dias: contrato.diasRestantes,
                    mensajePersonalizado
                }
            )

            if (resultado.success) {
                alert(`✅ ${resultado.mensaje}`)
                setModalAbierto(false)
            } else {
                alert(`❌ ${resultado.mensaje}`)
            }
        } catch (error) {
            console.error(error)
            alert('Error al enviar notificación')
        } finally {
            setEnviando(false)
        }
    }

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
                        onClick={handleAbrirModal}
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

            {/* Modal estilo WhatsApp - Igual que arriba */}
            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Editar Mensaje</Label>
                                <Badge variant="outline" className="text-xs">
                                    {mensajePersonalizado.length} caracteres
                                </Badge>
                            </div>
                            <Textarea
                                value={mensajePersonalizado}
                                onChange={(e) => setMensajePersonalizado(e.target.value)}
                                rows={16}
                                className="font-sans text-sm resize-none bg-white"
                                placeholder="Escribe tu mensaje aquí..."
                            />

                            <Card className="p-3 bg-amber-50 border-amber-200">
                                <p className="text-xs font-semibold text-amber-900 mb-2">Información del Contrato</p>
                                <div className="space-y-1 text-xs text-amber-800">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>Vence en {contrato.diasRestantes} día{contrato.diasRestantes !== 1 ? 's' : ''} ({new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" />
                                        <span>Saldo: S/. {contrato.saldo.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Vista Previa (Como se verá en WhatsApp)</Label>
                            <div className="bg-[#0B141A] rounded-lg p-4 min-h-[400px] flex flex-col">
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

                                <div className="flex-1 overflow-y-auto space-y-2">
                                    <div className="flex justify-end">
                                        <div className="bg-[#005C4B] text-white rounded-lg px-3 py-2 max-w-[85%] shadow-md">
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {mensajePersonalizado || 'Escribe un mensaje...'}
                                            </p>
                                            <p className="text-[10px] text-gray-300 text-right mt-1">
                                                {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="text-xs text-gray-500">
                                        El mensaje se enviará via WhatsApp Business
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t -mb-6 -mx-6 px-6 pb-6 bg-white rounded-b-lg">
                        <Button
                            variant="ghost"
                            onClick={() => setMensajePersonalizado(mensajePredeterminado)}
                            className="text-sm"
                        >
                            Restaurar Mensaje Original
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setModalAbierto(false)}
                                disabled={enviando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleEnviarWhatsApp}
                                disabled={enviando || !mensajePersonalizado.trim()}
                                className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                            >
                                <FaWhatsapp className={`h-4 w-4 ${enviando ? 'animate-pulse' : ''}`} />
                                {enviando ? 'Enviando...' : 'Enviar por WhatsApp'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
