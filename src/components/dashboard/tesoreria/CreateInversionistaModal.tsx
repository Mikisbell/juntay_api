'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Plus, Search, UserPlus } from "lucide-react"
import { crearInversionista, actualizarInversionista, InversionistaDetalle } from "@/lib/actions/tesoreria-actions"
import { PersonSearch } from "@/components/pos/PersonSearch"
import { RegistroClienteCompleto } from "@/components/business/RegistroClienteCompleto"

interface CreateInversionistaModalProps {
    inversionistaToEdit?: InversionistaDetalle | null
    onOpenChange?: (open: boolean) => void
}

export function CreateInversionistaModal({ inversionistaToEdit, onOpenChange }: CreateInversionistaModalProps) {
    const router = useRouter() // Import useRouter from next/navigation
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("search")
    const [selectedPerson, setSelectedPerson] = useState<{ id: string, nombres: string } | null>(null)
    const [tipoRelacion, setTipoRelacion] = useState("SOCIO")
    const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0])
    const [fechaRetorno, setFechaRetorno] = useState("")

    // Effect to load initial data if editing
    useState(() => {
        if (inversionistaToEdit) {
            setSelectedPerson({
                id: inversionistaToEdit.persona_id,
                nombres: inversionistaToEdit.nombre_completo
            })
            setTipoRelacion(inversionistaToEdit.tipo_relacion)
            setFechaIngreso(inversionistaToEdit.fecha_ingreso ? new Date(inversionistaToEdit.fecha_ingreso).toISOString().split('T')[0] : "")

            if (inversionistaToEdit.metadata && inversionistaToEdit.metadata.fecha_retorno) {
                setFechaRetorno(inversionistaToEdit.metadata.fecha_retorno)
            }
        }
    })

    // Sync open state with parent if controlled
    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (onOpenChange) onOpenChange(val)
    }
    // Campos para calculadora de plazo
    const [plazoValor, setPlazoValor] = useState("")
    const [plazoUnidad, setPlazoUnidad] = useState("MESES") // "MESES" | "ANOS"

    const aplicarDuracion = (meses: number) => {
        const fechaBase = fechaIngreso ? new Date(fechaIngreso) : new Date()
        const nuevaFecha = new Date(fechaBase)
        nuevaFecha.setMonth(nuevaFecha.getMonth() + meses)
        setFechaRetorno(nuevaFecha.toISOString().split('T')[0])

        // Sync inputs if coming from buttons
        if (meses % 12 === 0) {
            setPlazoValor((meses / 12).toString())
            setPlazoUnidad("ANOS")
        } else {
            setPlazoValor(meses.toString())
            setPlazoUnidad("MESES")
        }
    }

    const recalcularFechaDesdeInputs = (valor: string, unidad: string) => {
        if (!valor) return
        const v = parseInt(valor)
        if (isNaN(v)) return

        const fechaBase = fechaIngreso ? new Date(fechaIngreso) : new Date()
        const nuevaFecha = new Date(fechaBase)

        if (unidad === "MESES") {
            nuevaFecha.setMonth(nuevaFecha.getMonth() + v)
        } else {
            nuevaFecha.setFullYear(nuevaFecha.getFullYear() + v)
        }
        setFechaRetorno(nuevaFecha.toISOString().split('T')[0])
    }

    async function handleSubmit(formData: FormData) {
        if (!selectedPerson) {
            toast.error("Debes seleccionar una persona")
            return
        }

        setLoading(true)
        formData.set('persona_id', selectedPerson.id)

        // Capturar tipo para el mensaje
        const tipo = formData.get('tipo') as string

        // Empaquetar metadata flexible
        const fechaRetorno = formData.get('fecha_retorno') as string
        const metadata = {
            fecha_retorno: fechaRetorno || null,
            creado_flexible: true
        }
        formData.append('metadata', JSON.stringify(metadata))

        try {
            let res
            if (inversionistaToEdit) {
                formData.append('id', inversionistaToEdit.id)
                res = await actualizarInversionista(formData)
            } else {
                res = await crearInversionista(formData)
            }

            if (res.error) {
                toast.error(res.error)
            } else {
                const action = inversionistaToEdit ? 'actualizado' : 'agregado'
                toast.success(`${tipo} ${action} correctamente`, {
                    description: `Vinculado a ${selectedPerson.nombres}. Fecha retorno: ${fechaRetorno || 'Indefinida'}`
                })
                handleOpenChange(false) // Use wrapper
                if (!inversionistaToEdit) {
                    setSelectedPerson(null)
                    setActiveTab("search")
                }
                router.refresh()
            }
        } catch (error) {
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewPersonRegistered = (cliente: any) => {
        // RegistroClienteCompleto devuelve un 'cliente', pero necesitamos la 'persona_id'
        // Asumimos que cliente tiene { persona_id, nombres, apellido_paterno, etc }
        // O si devuelve el objeto cliente completo de la BD

        console.log("Nuevo cliente registrado:", cliente)

        if (cliente && cliente.id) {
            setSelectedPerson({
                id: cliente.persona_id, // Usamos persona_id para la tabla inversionistas
                nombres: cliente.nombre_completo || `${cliente.nombres} ${cliente.apellido_paterno}`
            })
            // Volver al tab de resumen/formulario principal o simplemente mostrar seleccionado
            setActiveTab("search")
            toast.message("Persona creada correctamente", {
                description: "Ahora selecciona el TIPO de inversionista y haz clic en REGISTRAR.",
                duration: 6000,
            })
        }
    }

    return (
        <Dialog open={inversionistaToEdit ? true : open} onOpenChange={handleOpenChange}>
            {!inversionistaToEdit && (
                <DialogTrigger asChild>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Inversionista
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{inversionistaToEdit ? 'Editar Inversionista' : 'Registrar Inversionista'}</DialogTitle>
                    <DialogDescription>
                        {inversionistaToEdit ? 'Modificar datos del contrato.' : 'Vincular una persona existente o registrar una nueva.'}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {!inversionistaToEdit && (
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="search">
                                <Search className="w-4 h-4 mr-2" />
                                Buscar Existente
                            </TabsTrigger>
                            <TabsTrigger value="new">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Registrar Nuevo (DNI)
                            </TabsTrigger>
                        </TabsList>
                    )}

                    <TabsContent value="search" className="space-y-4 py-4">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Persona Seleccionada</Label>
                                {selectedPerson ? (
                                    <div className="flex items-center justify-between p-3 border rounded-md bg-emerald-50 border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-emerald-100 p-2 rounded-full">
                                                <UserPlus className="w-4 h-4 text-emerald-700" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-emerald-900">{selectedPerson.nombres}</p>
                                                <p className="text-xs text-emerald-700">Listo para vincular</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedPerson(null)}
                                            className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                                        >
                                            Cambiar
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border rounded-md p-2 bg-slate-50">
                                        <PersonSearch onSelect={(pId, pName) => setSelectedPerson({ id: pId, nombres: pName })} />
                                        <p className="text-xs text-center text-muted-foreground mt-2">
                                            Busca por nombre o DNI. Si no existe, usa la pestaña &quot;Registrar Nuevo&quot;.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo Relación</Label>
                                    <Select name="tipo" value={tipoRelacion} onValueChange={setTipoRelacion} required>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SOCIO">Socio (Equity)</SelectItem>
                                            <SelectItem value="PRESTAMISTA">Prestamista (Deuda)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        {tipoRelacion === 'SOCIO' ? 'Participación %' : 'Tasa Interés Mensual %'}
                                    </Label>

                                    <div className="relative">
                                        <Input
                                            type="number"
                                            name="porcentaje"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="pr-8"
                                            placeholder={tipoRelacion === 'SOCIO' ? "Ej. 10%" : "Ej. 5%"}
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha Ingreso (Libre)</Label>
                                <Input
                                    type="date"
                                    name="fecha"
                                    required
                                    value={fechaIngreso}
                                    onChange={(e) => setFechaIngreso(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        Fecha Devolución
                                        <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(1)} className="h-6 text-[10px]">+1M</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(6)} className="h-6 text-[10px]">+6M</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(12)} className="h-6 text-[10px]">+1A</Button>
                                    </div>
                                </Label>

                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            placeholder="Ej. 6"
                                            value={plazoValor}
                                            onChange={(e) => {
                                                setPlazoValor(e.target.value)
                                                recalcularFechaDesdeInputs(e.target.value, plazoUnidad)
                                            }}
                                        />
                                    </div>
                                    <div className="w-[120px]">
                                        <Select
                                            value={plazoUnidad}
                                            onValueChange={(val) => {
                                                setPlazoUnidad(val)
                                                recalcularFechaDesdeInputs(plazoValor, val)
                                            }}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MESES">Meses</SelectItem>
                                                <SelectItem value="ANOS">Años</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Input
                                    type="date"
                                    name="fecha_retorno"
                                    value={fechaRetorno}
                                    onChange={(e) => setFechaRetorno(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    {fechaRetorno ? "Contrato definido hasta esta fecha." : "Indefinido / A la vista."}
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                                <Button type="submit" disabled={loading || !selectedPerson}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {inversionistaToEdit ? 'Guardar Cambios' : 'Registrar Inversionista'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="new" className="py-2">
                        <RegistroClienteCompleto
                            embedded={true}
                            hideHeader={false}
                            disablePersistence={true}
                            onClienteRegistrado={handleNewPersonRegistered}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
