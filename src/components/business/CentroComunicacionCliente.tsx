"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Loader2, Send, MessageSquare, Clock, CreditCard, CheckCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { enviarMensajeCliente } from "@/lib/actions/whatsapp-actions"
import { getClienteResumenFinanciero } from "@/lib/actions/clientes-actions"

interface CentroComunicacionClienteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cliente: {
        id: string
        nombre: string
        telefono: string | null
        score?: number
    }
}

// Interfaz para los datos del resumen
interface DatosFinancieros {
    creditosActivos: number
    deudaTotal: number
    proximoVencimiento: string | null
    diasParaVencimiento: number | null
    esClienteNuevo: boolean
    ultimoPago: { fecha: string, monto: number } | null
}

export function CentroComunicacionCliente({ open, onOpenChange, cliente }: CentroComunicacionClienteProps) {
    const [mensaje, setMensaje] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [cargandoDatos, setCargandoDatos] = useState(false)
    const [datos, setDatos] = useState<DatosFinancieros | null>(null)

    // Cargar datos al abrir
    useEffect(() => {
        if (open) {
            setCargandoDatos(true)
            getClienteResumenFinanciero(cliente.id)
                .then(res => {
                    setDatos(res)
                })
                .catch(err => console.error(err))
                .finally(() => setCargandoDatos(false))
        }
    }, [open, cliente.id])

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
                mensaje
            )

            if (resultado.success) {
                toast.success("Mensaje enviado correctamente", {
                    description: `Enviado a ${cliente.nombre} (${cliente.telefono})`
                })
                setMensaje("")
                onOpenChange(false)
            } else {
                toast.error("Error al enviar", {
                    description: resultado.error
                })
            }
        } catch (_error) {
            toast.error("Error de conexión", { description: "Intenta nuevamente" })
        } finally {
            setEnviando(false)
        }
    }

    const seleccionarPlantilla = (textoGenerador: (nombre: string, datos?: DatosFinancieros) => string) => {
        setMensaje(textoGenerador(cliente.nombre.split(' ')[0], datos || undefined))
    }

    // Definir plantillas dinámicas según el estado del cliente
    const obtenerPlantillas = () => {
        if (!datos) return []

        const plantillas = []

        // 1. Plantilla Bienvenida (siempre o solo nuevos)
        plantillas.push({
            id: "general",
            icono: Sparkles,
            titulo: "Saludo General",
            texto: (nombre: string) => `✨ Hola ${nombre}, gracias por confiar en JUNTAY. Cualquier consulta estamos a tu disposición.`
        })

        // 2. Plantillas de Cobranza/Renovación (SOLO si hay deuda)
        if (datos.creditosActivos > 0) {
            plantillas.push({
                id: "recordatorio",
                icono: Clock,
                titulo: "Recordatorio Pago",
                texto: (nombre: string, d?: DatosFinancieros) => `🔔 Hola ${nombre}, te recordamos que tu crédito vence el ${d?.proximoVencimiento}. Monto: S/ ${d?.deudaTotal.toFixed(2)}. ¿Deseas renovar?`
            })

            plantillas.push({
                id: "promo",
                icono: CreditCard,
                titulo: "Oferta Renovación",
                texto: (nombre: string) => `💎 ${nombre}, por tu buen historial tienes disponible una tasa preferencial del 15% para tu próxima renovación. ¡Aprovéchala!`
            })
        }

        // 3. Plantilla Cliente Nuevo (sin historial)
        if (datos.esClienteNuevo) {
            plantillas.push({
                id: "info",
                icono: MessageSquare,
                titulo: "Info Préstamos",
                texto: (nombre: string) => `👋 Hola ${nombre}, ¿necesitas efectivo? Aceptamos electrodomésticos, herramientas y más. Tasa del 20% con total seguridad.`
            })
        }

        return plantillas
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-0 gap-0">
                {/* Header Premium */}
                <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                    <SheetHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombre}`} />
                                    <AvatarFallback>{cliente.nombre.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <SheetTitle className="text-xl font-bold">{cliente.nombre}</SheetTitle>
                                    <SheetDescription className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className={`
                                            ${!datos || datos.esClienteNuevo ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                        `}>
                                            {cargandoDatos ? 'Cargando...' : (datos?.esClienteNuevo ? 'Cliente Nuevo' : 'Cliente Recurrente')}
                                        </Badge>
                                        <span className="text-slate-500">• {cliente.telefono || "Sin teléfono"}</span>
                                    </SheetDescription>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-xs text-slate-400 block uppercase tracking-wider font-medium">Score</span>
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{cliente.score || '-'}</span>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <ScrollArea className="flex-1 px-6 py-6">
                    {cargandoDatos ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-slate-500">Analizando perfil financiero...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-6">
                            {/* Contexto Financiero (Condicional) */}
                            {datos && datos.creditosActivos > 0 && (
                                <section className="space-y-3">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> Contexto Financiero
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500">Próximo Vencimiento</p>
                                            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                {datos.proximoVencimiento}
                                                {datos.diasParaVencimiento !== null && (
                                                    <Badge variant="secondary" className={`text-xs h-5 px-1.5 border-0 ${datos.diasParaVencimiento < 3 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {datos.diasParaVencimiento} días
                                                    </Badge>
                                                )}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500">Deuda Total</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                S/ {datos.deudaTotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Mensaje de no deuda */}
                            {datos && datos.creditosActivos === 0 && !datos.esClienteNuevo && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
                                    <CheckCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-emerald-800">¡Al día!</h4>
                                        <p className="text-xs text-emerald-600 mt-0.5">El cliente no tiene deudas pendientes actualmente.</p>
                                    </div>
                                </div>
                            )}

                            {/* Generador de Mensajes */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> Sugerencias Inteligentes
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {obtenerPlantillas().map((plantilla) => (
                                        <button
                                            key={plantilla.id}
                                            onClick={() => seleccionarPlantilla(plantilla.texto)}
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/50 transition-all text-center group"
                                        >
                                            <plantilla.icono className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{plantilla.titulo}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Editor y Vista Previa */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Componer Mensaje
                                </h3>

                                {mensaje && (
                                    <div className="bg-[#E3F2FD] dark:bg-slate-800/50 p-4 rounded-lg rounded-tl-none relative ml-2 mb-4 border border-blue-100 dark:border-slate-700">
                                        <div className="absolute -left-2 top-0 w-3 h-3 bg-[#E3F2FD] dark:bg-slate-800/50 [clip-path:polygon(100%_0,0_0,100%_100%)]"></div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">{mensaje}</p>
                                        <div className="flex justify-end mt-1">
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                Ahora <CheckCheck className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Escribe un mensaje personalizado o selecciona una plantilla..."
                                    className="min-h-[120px] resize-none border-slate-200 dark:border-slate-800 focus-visible:ring-primary shadow-sm bg-white dark:bg-slate-900"
                                />
                            </section>

                            {/* Historial (Read only) */}
                            {datos?.ultimoPago && (
                                <section className="space-y-3 opacity-75">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historial Reciente</h3>
                                    <div className="space-y-3 pl-3 border-l-2 border-slate-100 dark:border-slate-800">
                                        <div className="relative">
                                            <div className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-emerald-500"></div>
                                            <p className="text-xs text-slate-500 mb-0.5 flex justify-between">
                                                <span>Pago Recibido</span>
                                                <span>{datos.ultimoPago.fecha}</span>
                                            </p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                Cliente realizó pago por S/ {datos.ultimoPago.monto.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer Fijo */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-400 hidden sm:inline-block">
                            Se enviará vía WhatsApp Business API
                        </span>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleEnviar}
                                disabled={enviando || !mensaje.trim() || !cliente.telefono}
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 sm:flex-none min-w-[140px] shadow-lg shadow-green-600/20"
                            >
                                {enviando ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Enviar Mensaje
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
