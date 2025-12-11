"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Calendar, Heart, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { condonarMora, extenderVencimiento } from "@/lib/actions/pagos-actions"

interface GestionMoraSheetProps {
    creditoId: string
    codigoCredito?: string
    clienteNombre?: string
    moraPendiente: number
    diasMora: number
    children?: React.ReactNode
}

const MOTIVOS_PREDEFINIDOS = [
    "Cliente frecuente - fidelización",
    "Primera mora del cliente",
    "Situación económica difícil",
    "Error del sistema",
    "Negociación comercial",
    "Retención de cliente",
    "Otro (especificar)"
]

export function GestionMoraSheet({
    creditoId,
    codigoCredito,
    clienteNombre,
    moraPendiente,
    diasMora,
    children
}: GestionMoraSheetProps) {
    const [open, setOpen] = useState(false)
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("")
    const [motivoPersonalizado, setMotivoPersonalizado] = useState("")
    const [montoCondonar, setMontoCondonar] = useState(moraPendiente)
    const [diasExtension, setDiasExtension] = useState(7)
    const queryClient = useQueryClient()

    const { mutate: ejecutarCondonacion, isPending: isPendingCondonar } = useMutation({
        mutationFn: () => condonarMora({
            creditoId,
            motivo: motivoSeleccionado === "Otro (especificar)" ? motivoPersonalizado : motivoSeleccionado,
            montoCondonado: montoCondonar
        }),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.mensaje)
                queryClient.invalidateQueries({ queryKey: ['creditos'] })
                queryClient.invalidateQueries({ queryKey: ['vencimientos'] })
                setOpen(false)
            } else {
                toast.error(result.error || 'Error al condonar mora')
            }
        },
        onError: () => toast.error('Error al procesar la condonación')
    })

    const { mutate: ejecutarExtension, isPending: isPendingExtension } = useMutation({
        mutationFn: () => extenderVencimiento({
            creditoId,
            diasExtension,
            motivo: motivoSeleccionado === "Otro (especificar)" ? motivoPersonalizado : motivoSeleccionado
        }),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.mensaje)
                queryClient.invalidateQueries({ queryKey: ['creditos'] })
                queryClient.invalidateQueries({ queryKey: ['vencimientos'] })
                setOpen(false)
            } else {
                toast.error(result.error || 'Error al extender vencimiento')
            }
        },
        onError: () => toast.error('Error al procesar la extensión')
    })

    const isPending = isPendingCondonar || isPendingExtension
    const motivoValido = motivoSeleccionado && (motivoSeleccionado !== "Otro (especificar)" || motivoPersonalizado.trim())

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                        <Gift className="w-4 h-4 mr-1" />
                        Gestionar Mora
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        Gestión de Mora - Retención
                    </SheetTitle>
                    <SheetDescription>
                        Herramientas para conservar clientes en situaciones especiales
                    </SheetDescription>
                </SheetHeader>

                {/* Info del crédito */}
                <div className="bg-slate-50 rounded-lg p-4 my-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Contrato:</span>
                        <span className="font-mono font-bold">{codigoCredito || creditoId.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Cliente:</span>
                        <span className="font-semibold">{clienteNombre || 'Cliente'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Mora actual:</span>
                        <Badge variant="destructive" className="text-base">
                            S/ {moraPendiente.toFixed(2)}
                        </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Días de mora:</span>
                        <span className="font-semibold text-amber-600">{diasMora} días</span>
                    </div>
                </div>

                <Tabs defaultValue="condonar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="condonar" className="gap-1">
                            <Gift className="w-4 h-4" />
                            Condonar
                        </TabsTrigger>
                        <TabsTrigger value="extender" className="gap-1">
                            <Calendar className="w-4 h-4" />
                            Extender
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: CONDONAR MORA */}
                    <TabsContent value="condonar" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Monto a condonar</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={montoCondonar}
                                    onChange={(e) => setMontoCondonar(parseFloat(e.target.value) || 0)}
                                    max={moraPendiente}
                                    step={0.01}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMontoCondonar(moraPendiente)}
                                    className="whitespace-nowrap"
                                >
                                    Todo (S/{moraPendiente.toFixed(2)})
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Motivo de condonación</Label>
                            <Select value={motivoSeleccionado} onValueChange={setMotivoSeleccionado}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un motivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                                        <SelectItem key={motivo} value={motivo}>
                                            {motivo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {motivoSeleccionado === "Otro (especificar)" && (
                            <div className="space-y-2">
                                <Label>Describe el motivo</Label>
                                <Textarea
                                    value={motivoPersonalizado}
                                    onChange={(e) => setMotivoPersonalizado(e.target.value)}
                                    placeholder="Explica el motivo de la condonación..."
                                    className="resize-none"
                                />
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800">
                                Esta acción quedará registrada en el historial del crédito para auditoría.
                            </p>
                        </div>

                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => ejecutarCondonacion()}
                            disabled={!motivoValido || isPending || montoCondonar <= 0}
                        >
                            {isPendingCondonar ? 'Procesando...' : `Condonar S/${montoCondonar.toFixed(2)}`}
                        </Button>
                    </TabsContent>

                    {/* TAB: EXTENDER VENCIMIENTO */}
                    <TabsContent value="extender" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Días de extensión</Label>
                            <div className="flex gap-2">
                                {[3, 7, 15, 30].map((dias) => (
                                    <Button
                                        key={dias}
                                        type="button"
                                        variant={diasExtension === dias ? "default" : "outline"}
                                        onClick={() => setDiasExtension(dias)}
                                        className="flex-1"
                                    >
                                        {dias}d
                                    </Button>
                                ))}
                            </div>
                            <Input
                                type="number"
                                value={diasExtension}
                                onChange={(e) => setDiasExtension(parseInt(e.target.value) || 0)}
                                min={1}
                                max={90}
                                className="mt-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Motivo de extensión</Label>
                            <Select value={motivoSeleccionado} onValueChange={setMotivoSeleccionado}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un motivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                                        <SelectItem key={motivo} value={motivo}>
                                            {motivo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {motivoSeleccionado === "Otro (especificar)" && (
                            <div className="space-y-2">
                                <Label>Describe el motivo</Label>
                                <Textarea
                                    value={motivoPersonalizado}
                                    onChange={(e) => setMotivoPersonalizado(e.target.value)}
                                    placeholder="Explica el motivo de la extensión..."
                                    className="resize-none"
                                />
                            </div>
                        )}

                        <p className="text-sm text-slate-500">
                            Esto moverá la fecha de vencimiento {diasExtension} días hacia adelante,
                            eliminando la mora actual si aplica.
                        </p>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => ejecutarExtension()}
                            disabled={!motivoValido || isPending || diasExtension <= 0}
                        >
                            {isPendingExtension ? 'Procesando...' : `Extender ${diasExtension} días`}
                        </Button>
                    </TabsContent>
                </Tabs>

                <SheetFooter className="mt-6">
                    <p className="text-xs text-slate-400 text-center w-full">
                        💼 Herramienta de retención de clientes - Uso responsable
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
