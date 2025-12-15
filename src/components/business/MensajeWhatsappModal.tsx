"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { enviarMensajeCliente } from "@/lib/actions/whatsapp-actions"

interface MensajeWhatsappModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cliente: {
        id: string
        nombre: string
        telefono: string | null
    }
}

const PLANTILLAS = [
    {
        titulo: "Saludo general",
        mensaje: "Esperamos que te encuentres bien. Te contactamos de JUNTAY para brindarte nuestros servicios."
    },
    {
        titulo: "Invitación a renovar",
        mensaje: "Te recordamos que puedes renovar tu crédito y mantener tu garantía en resguardo. ¿Te gustaría más información?"
    },
    {
        titulo: "Promoción",
        mensaje: "¡Tenemos una promoción especial para ti! Tasas preferenciales para clientes frecuentes. Contáctanos para más detalles."
    }
]

export function MensajeWhatsappModal({ open, onOpenChange, cliente }: MensajeWhatsappModalProps) {
    const [mensaje, setMensaje] = useState("")
    const [enviando, setEnviando] = useState(false)

    const handleEnviar = async () => {
        if (!mensaje.trim()) {
            toast.error("Escribe un mensaje primero")
            return
        }

        if (!cliente.telefono) {
            toast.error("El cliente no tiene teléfono registrado")
            return
        }

        setEnviando(true)
        try {
            const resultado = await enviarMensajeCliente(
                cliente.telefono,
                mensaje,
                cliente.nombre
            )

            if (resultado.success) {
                toast.success("Mensaje enviado correctamente", {
                    description: `Enviado a ${cliente.nombre}`
                })
                setMensaje("")
                onOpenChange(false)
            } else {
                toast.error("Error al enviar", {
                    description: resultado.error
                })
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setEnviando(false)
        }
    }

    const usarPlantilla = (texto: string) => {
        setMensaje(texto)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        Enviar WhatsApp
                    </DialogTitle>
                    <DialogDescription>
                        Enviar mensaje a <strong>{cliente.nombre}</strong>
                        {cliente.telefono && (
                            <span className="text-slate-500"> ({cliente.telefono})</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Plantillas rápidas */}
                    <div>
                        <Label className="text-xs text-muted-foreground">Plantillas rápidas:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {PLANTILLAS.map((p, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => usarPlantilla(p.mensaje)}
                                >
                                    {p.titulo}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Área de mensaje */}
                    <div className="space-y-2">
                        <Label>Mensaje</Label>
                        <Textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            El mensaje se firmará automáticamente como &quot;— JUNTAY Financiera&quot;
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleEnviar}
                        disabled={enviando || !mensaje.trim() || !cliente.telefono}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {enviando ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Enviar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
