'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Search, UserPlus, Wallet, Building2, FileText, TrendingUp, Calendar } from "lucide-react"
import { crearInversionista, actualizarInversionista, InversionistaDetalle } from "@/lib/actions/tesoreria-actions"
import { PersonSearch } from "@/components/pos/PersonSearch"
import { consultarEntidad, type DatosEntidad } from "@/lib/apis/consultasperu"

interface CreateInversionistaModalProps {
    inversionistaToEdit?: InversionistaDetalle | null
    onOpenChange?: (open: boolean) => void
}

const BANCOS_PERU = [
    'BCP',
    'BBVA',
    'Interbank',
    'Scotiabank',
    'BanBif',
    'Banco de la Nación',
    'Caja Huancayo',
    'Caja Arequipa',
    'Caja Trujillo',
    'Caja Piura',
    'Otro'
]

const TIPOS_APORTE = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'YAPE', label: 'Yape/Plin' },
]

export function CreateInversionistaModal({ inversionistaToEdit, onOpenChange }: CreateInversionistaModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("identificacion")

    // Tab 1: Identificación
    const [selectedPerson, setSelectedPerson] = useState<{ id: string, nombres: string } | null>(null)
    const [datosEntidad, setDatosEntidad] = useState<DatosEntidad | null>(null)

    // Tab 2: Datos Financieros
    const [tipoRelacion, setTipoRelacion] = useState("SOCIO")
    const [montoInversion, setMontoInversion] = useState('')
    const [porcentaje, setPorcentaje] = useState('')
    const [tasaMensual, setTasaMensual] = useState('')
    const [tipoAporte, setTipoAporte] = useState('EFECTIVO')

    // Datos Bancarios
    const [banco, setBanco] = useState('')
    const [numeroCuenta, setNumeroCuenta] = useState('')
    const [cci, setCci] = useState('')
    const [titularCuenta, setTitularCuenta] = useState('')

    // Tab 3: Contrato
    const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0])
    const [fechaRetorno, setFechaRetorno] = useState('')
    const [plazoValor, setPlazoValor] = useState('')
    const [plazoUnidad, setPlazoUnidad] = useState('MESES')
    const [notas, setNotas] = useState('')

    // Effect to load initial data if editing
    useState(() => {
        if (inversionistaToEdit) {
            setSelectedPerson({
                id: inversionistaToEdit.persona_id,
                nombres: inversionistaToEdit.nombre_completo
            })
            setTipoRelacion(inversionistaToEdit.tipo_relacion)
            setFechaIngreso(inversionistaToEdit.fecha_ingreso ? new Date(inversionistaToEdit.fecha_ingreso).toISOString().split('T')[0] : "")

            // Load metadata if exists
            if (inversionistaToEdit.metadata) {
                const meta = inversionistaToEdit.metadata
                if (meta.fecha_retorno) setFechaRetorno(meta.fecha_retorno)
                if (meta.monto_inversion) setMontoInversion(meta.monto_inversion.toString())
                if (meta.banco) setBanco(meta.banco)
                if (meta.numero_cuenta) setNumeroCuenta(meta.numero_cuenta)
                if (meta.cci) setCci(meta.cci)
                if (meta.titular_cuenta) setTitularCuenta(meta.titular_cuenta)
                if (meta.tipo_aporte) setTipoAporte(meta.tipo_aporte)
                if (meta.notas) setNotas(meta.notas)
            }
        }
    })

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (onOpenChange) onOpenChange(val)
    }



    const aplicarDuracion = (meses: number) => {
        const fechaBase = fechaIngreso ? new Date(fechaIngreso) : new Date()
        const nuevaFecha = new Date(fechaBase)
        nuevaFecha.setMonth(nuevaFecha.getMonth() + meses)
        setFechaRetorno(nuevaFecha.toISOString().split('T')[0])

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

    async function handleSubmit() {
        if (!selectedPerson) {
            toast.error("Debes seleccionar o registrar una persona")
            return
        }

        if (!montoInversion || parseFloat(montoInversion) <= 0) {
            toast.error("Debes ingresar el monto de inversión")
            setActiveTab("financiero")
            return
        }

        setLoading(true)

        // Construir metadata extendida
        const metadata = {
            fecha_retorno: fechaRetorno || null,
            monto_inversion: parseFloat(montoInversion),
            tipo_aporte: tipoAporte,
            banco: banco || null,
            numero_cuenta: numeroCuenta || null,
            cci: cci || null,
            titular_cuenta: titularCuenta || null,
            notas: notas || null,
            tasa_mensual: tipoRelacion === 'PRESTAMISTA' ? parseFloat(tasaMensual) : null,
            creado_con_formulario_dedicado: true
        }

        // Crear FormData
        const formData = new FormData()
        formData.set('persona_id', selectedPerson.id)
        formData.set('tipo', tipoRelacion)
        formData.set('porcentaje', porcentaje || '0')
        formData.set('fecha', fechaIngreso)
        formData.set('metadata', JSON.stringify(metadata))

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
                const action = inversionistaToEdit ? 'actualizado' : 'registrado'
                toast.success(`Inversionista ${action} correctamente`, {
                    description: `${selectedPerson.nombres} - S/ ${parseFloat(montoInversion).toLocaleString()}`
                })
                handleOpenChange(false)
                resetForm()
                router.refresh()
            }
        } catch (_error) {
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSelectedPerson(null)

        setDatosEntidad(null)
        setTipoRelacion('SOCIO')
        setMontoInversion('')
        setPorcentaje('')
        setTasaMensual('')
        setTipoAporte('EFECTIVO')
        setBanco('')
        setNumeroCuenta('')
        setCci('')
        setTitularCuenta('')
        setFechaIngreso(new Date().toISOString().split('T')[0])
        setFechaRetorno('')
        setPlazoValor('')
        setNotas('')
        setActiveTab('identificacion')
    }

    // Cuando se selecciona persona desde PersonSearch
    const handlePersonSelect = (personId: string, personName: string) => {
        setSelectedPerson({ id: personId, nombres: personName })
        setTitularCuenta(personName)
    }

    // Validación de tabs para navegación
    const canProceedToFinanciero = selectedPerson !== null
    const canProceedToContrato = canProceedToFinanciero && montoInversion && parseFloat(montoInversion) > 0

    return (
        <Dialog open={inversionistaToEdit ? true : open} onOpenChange={handleOpenChange}>
            {!inversionistaToEdit && (
                <DialogTrigger asChild>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Inversionista
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        {inversionistaToEdit ? 'Editar Inversionista' : 'Registrar Inversionista'}
                    </DialogTitle>
                    <DialogDescription>
                        {inversionistaToEdit ? 'Modificar datos del contrato de inversión.' : 'Completa los datos de la persona y los términos financieros.'}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="identificacion" className="gap-1.5">
                            <UserPlus className="w-4 h-4" />
                            Identificación
                        </TabsTrigger>
                        <TabsTrigger value="financiero" disabled={!canProceedToFinanciero} className="gap-1.5">
                            <Wallet className="w-4 h-4" />
                            Financiero
                        </TabsTrigger>
                        <TabsTrigger value="contrato" disabled={!canProceedToContrato} className="gap-1.5">
                            <FileText className="w-4 h-4" />
                            Contrato
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: IDENTIFICACIÓN */}
                    <TabsContent value="identificacion" className="space-y-4 py-4">
                        <div className="space-y-4">
                            {/* Persona seleccionada */}
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
                                                <p className="text-xs text-emerald-700">Listo para continuar</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedPerson(null)
                                                setDatosEntidad(null)
                                            }}
                                            className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                                        >
                                            Cambiar
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="border rounded-md p-4 bg-slate-50">
                                            <p className="text-sm font-medium mb-3 text-slate-700 flex items-center gap-2">
                                                <Search className="w-4 h-4 text-primary" />
                                                Buscar Inversionista
                                            </p>
                                            <PersonSearch
                                                onSelect={handlePersonSelect}
                                                placeholder="Nombre o DNI (para buscar en RENIEC)..."
                                                allowCreateFromAPI={true}
                                            />
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                                <p className="text-xs text-blue-700 flex items-start gap-2">
                                                    <span className="text-lg leading-none">💡</span>
                                                    <span>
                                                        Puedes buscar por <strong>Nombre</strong> o <strong>DNI</strong>.
                                                        Si el DNI no existe en el sistema, aparecerá una opción para
                                                        buscarlo automáticamente en <strong>RENIEC</strong> y registrarlo.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('financiero')}
                                    disabled={!canProceedToFinanciero}
                                >
                                    Continuar →
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: FINANCIERO */}
                    <TabsContent value="financiero" className="space-y-4 py-4">
                        {/* Tipo de Inversión */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Inversión *</Label>
                                <Select value={tipoRelacion} onValueChange={setTipoRelacion}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SOCIO">🤝 Socio (Equity)</SelectItem>
                                        <SelectItem value="PRESTAMISTA">💰 Prestamista (Deuda)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Monto de Inversión (S/) *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                                    <Input
                                        type="number"
                                        value={montoInversion}
                                        onChange={(e) => setMontoInversion(e.target.value)}
                                        placeholder="10,000"
                                        className="pl-9"
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Campos según tipo */}
                        <div className="grid grid-cols-2 gap-4">
                            {tipoRelacion === 'SOCIO' ? (
                                <div className="space-y-2">
                                    <Label>Participación (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={porcentaje}
                                            onChange={(e) => setPorcentaje(e.target.value)}
                                            placeholder="10"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="pr-8"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Tasa Mensual (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={tasaMensual}
                                            onChange={(e) => setTasaMensual(e.target.value)}
                                            placeholder="5"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            className="pr-8"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Forma de Aporte</Label>
                                <Select value={tipoAporte} onValueChange={setTipoAporte}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_APORTE.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Datos Bancarios */}
                        <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Datos Bancarios (para devoluciones)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Banco</Label>
                                    <Select value={banco} onValueChange={setBanco}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BANCOS_PERU.map(b => (
                                                <SelectItem key={b} value={b}>{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Titular de Cuenta</Label>
                                    <Input
                                        value={titularCuenta}
                                        onChange={(e) => setTitularCuenta(e.target.value)}
                                        placeholder="Nombre del titular"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Número de Cuenta</Label>
                                    <Input
                                        value={numeroCuenta}
                                        onChange={(e) => setNumeroCuenta(e.target.value)}
                                        placeholder="Ej: 123-456789-0-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CCI (20 dígitos)</Label>
                                    <Input
                                        value={cci}
                                        onChange={(e) => setCci(e.target.value.replace(/\D/g, '').slice(0, 20))}
                                        placeholder="00212300456789012345"
                                        maxLength={20}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('identificacion')}>
                                ← Anterior
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('contrato')}
                                disabled={!canProceedToContrato}
                            >
                                Continuar →
                            </Button>
                        </div>
                    </TabsContent>

                    {/* TAB 3: CONTRATO */}
                    <TabsContent value="contrato" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Fecha de Ingreso *
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaIngreso}
                                    onChange={(e) => setFechaIngreso(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Fecha de Devolución
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={fechaRetorno}
                                    onChange={(e) => setFechaRetorno(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Calculadora de plazo */}
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm font-medium text-amber-800 mb-2">Calculadora de Plazo</p>
                            <div className="flex gap-2 flex-wrap">
                                <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(1)} className="h-7 text-xs">+1 Mes</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(3)} className="h-7 text-xs">+3 Meses</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(6)} className="h-7 text-xs">+6 Meses</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(12)} className="h-7 text-xs">+1 Año</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => aplicarDuracion(24)} className="h-7 text-xs">+2 Años</Button>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    placeholder="Cantidad"
                                    value={plazoValor}
                                    onChange={(e) => {
                                        setPlazoValor(e.target.value)
                                        recalcularFechaDesdeInputs(e.target.value, plazoUnidad)
                                    }}
                                    className="w-24 h-8 text-sm"
                                />
                                <Select value={plazoUnidad} onValueChange={(val) => {
                                    setPlazoUnidad(val)
                                    recalcularFechaDesdeInputs(plazoValor, val)
                                }}>
                                    <SelectTrigger className="w-28 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MESES">Meses</SelectItem>
                                        <SelectItem value="ANOS">Años</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-amber-700 mt-2">
                                {fechaRetorno ? `Contrato hasta: ${new Date(fechaRetorno).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Contrato indefinido / a la vista'}
                            </p>
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <Label>Observaciones / Notas</Label>
                            <Textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="Condiciones especiales, acuerdos adicionales, referencias..."
                                className="h-20"
                            />
                        </div>

                        {/* Resumen antes de guardar */}
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <h4 className="font-semibold text-emerald-800 mb-2">📋 Resumen del Contrato</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="text-muted-foreground">Inversionista:</span> <strong>{selectedPerson?.nombres || '-'}</strong></p>
                                <p><span className="text-muted-foreground">Tipo:</span> <strong>{tipoRelacion === 'SOCIO' ? 'Socio (Equity)' : 'Prestamista (Deuda)'}</strong></p>
                                <p><span className="text-muted-foreground">Monto:</span> <strong>S/ {parseFloat(montoInversion || '0').toLocaleString()}</strong></p>
                                <p><span className="text-muted-foreground">{tipoRelacion === 'SOCIO' ? 'Participación:' : 'Tasa:'}</span> <strong>{tipoRelacion === 'SOCIO' ? `${porcentaje}%` : `${tasaMensual}% mensual`}</strong></p>
                                <p><span className="text-muted-foreground">Ingreso:</span> <strong>{new Date(fechaIngreso).toLocaleDateString('es-PE')}</strong></p>
                                <p><span className="text-muted-foreground">Devolución:</span> <strong>{fechaRetorno ? new Date(fechaRetorno).toLocaleDateString('es-PE') : 'Indefinido'}</strong></p>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('financiero')}>
                                ← Anterior
                            </Button>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {inversionistaToEdit ? 'Guardar Cambios' : 'Registrar Inversionista'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
