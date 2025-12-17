
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UserPlus, Users, Briefcase, Shield, Calculator, Eye, Mail, MoreHorizontal, Pencil, Ban, CheckCircle, RotateCcw, Phone, AlertCircle, PauseCircle, XCircle } from 'lucide-react'
import { listarEmpleados, crearEmpleado, actualizarEmpleado, darDeBajaEmpleado, reactivarEmpleado, type EmpleadoCompleto, type EstadoEmpleado } from '@/lib/actions/empleados-actions'
import { invitarEmpleado } from '@/lib/actions/auth-empleados-actions'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const CARGOS = {
    cajero: { label: 'Cajero', icon: Calculator, color: 'bg-emerald-500' },
    tasador: { label: 'Tasador', icon: Eye, color: 'bg-violet-500' },
    gerente: { label: 'Gerente', icon: Briefcase, color: 'bg-amber-500' },
    admin: { label: 'Administrador', icon: Shield, color: 'bg-red-500' }
}

const ESTADOS: Record<EstadoEmpleado, { label: string; icon: typeof CheckCircle; color: string }> = {
    ACTIVO: { label: 'Activo', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    LICENCIA: { label: 'En Licencia', icon: PauseCircle, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    SUSPENDIDO: { label: 'Suspendido', icon: AlertCircle, color: 'bg-red-100 text-red-700 border-red-300' },
    BAJA: { label: 'Dado de Baja', icon: XCircle, color: 'bg-slate-100 text-slate-500 border-slate-300' }
}

const PARENTESCOS = ['Esposa/o', 'Padre', 'Madre', 'Hermano/a', 'Hijo/a', 'Tío/a', 'Otro']

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<EmpleadoCompleto[]>([])
    const [loading, setLoading] = useState(true)

    // Create/Edit Dialog State
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        tipo_documento: 'DNI',
        numero_documento: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        cargo: 'cajero',
        telefono: '',
        telefono_secundario: '',
        email: '',
        direccion: '',
        // KYE Fields
        estado: 'ACTIVO' as EstadoEmpleado,
        motivo_estado: '',
        nombre_contacto_emergencia: '',
        parentesco_emergencia: '',
        telefono_emergencia: ''
    })

    useEffect(() => {
        cargarEmpleados()
    }, [])

    const cargarEmpleados = async () => {
        try {
            const data = await listarEmpleados()
            setEmpleados(data)
        } catch (error) {
            toast.error('Error al cargar empleados')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            tipo_documento: 'DNI',
            numero_documento: '',
            nombres: '',
            apellido_paterno: '',
            apellido_materno: '',
            cargo: 'cajero',
            telefono: '',
            telefono_secundario: '',
            email: '',
            direccion: '',
            estado: 'ACTIVO',
            motivo_estado: '',
            nombre_contacto_emergencia: '',
            parentesco_emergencia: '',
            telefono_emergencia: ''
        })
        setIsEditing(false)
        setEditingId(null)
        setEditingPersonaId(null)
    }

    const handleEditClick = (emp: EmpleadoCompleto) => {
        setFormData({
            tipo_documento: emp.tipo_documento,
            numero_documento: emp.numero_documento,
            nombres: emp.nombres,
            apellido_paterno: emp.apellido_paterno,
            apellido_materno: emp.apellido_materno,
            cargo: emp.cargo,
            telefono: emp.telefono_principal || '',
            telefono_secundario: emp.telefono_secundario || '',
            email: emp.email || '',
            direccion: emp.direccion || '',
            estado: emp.estado || 'ACTIVO',
            motivo_estado: emp.motivo_estado || '',
            nombre_contacto_emergencia: emp.nombre_contacto_emergencia || '',
            parentesco_emergencia: emp.parentesco_emergencia || '',
            telefono_emergencia: emp.telefono_emergencia || ''
        })
        setIsEditing(true)
        setEditingId(emp.id)
        setEditingPersonaId(emp.persona_id)
        setDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (isEditing && editingId && editingPersonaId) {
                // Update Logic
                await actualizarEmpleado(editingId, editingPersonaId, formData)
                toast.success('Empleado actualizado exitosamente')
            } else {
                // Create Logic
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await crearEmpleado(formData as any)
                toast.success('Empleado registrado exitosamente')
            }

            setDialogOpen(false)
            resetForm()
            cargarEmpleados()
        } catch (error) {
            toast.error(isEditing ? 'Error al actualizar' : 'Error al registrar')
            console.error(error)
        }
    }

    const handleEstadoChange = async (id: string, nuevoEstado: boolean) => {
        try {
            if (nuevoEstado) {
                await reactivarEmpleado(id)
                toast.success('Empleado reactivado')
            } else {
                await darDeBajaEmpleado(id)
                toast.success('Empleado dado de baja')
            }
            cargarEmpleados()
        } catch (error) {
            toast.error('Error al cambiar estado')
        }
    }

    const handleInvitar = async (empleadoId: string, email: string | null) => {
        if (!email) {
            toast.error('El empleado debe tener un email registrado')
            return
        }
        try {
            const result = await invitarEmpleado(empleadoId, email)
            toast.success(result.message)
            toast.success(result.message)
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Error al enviar invitación'
            toast.error(msg)
        }
    }

    return (
        <div className="space-y-6 animate-in-fade-slide">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Talento</h1>
                    <p className="text-muted-foreground">Administración centralizada del personal y accesos.</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                            <UserPlus className="w-4 h-4" />
                            Nuevo Empleado
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo Documento</Label>
                                    <Select
                                        value={formData.tipo_documento}
                                        onValueChange={(v) => setFormData({ ...formData, tipo_documento: v })}
                                        disabled={isEditing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CE">CE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Número Documento *</Label>
                                    <Input
                                        value={formData.numero_documento}
                                        onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nombres *</Label>
                                <Input
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Apellido Paterno *</Label>
                                    <Input
                                        value={formData.apellido_paterno}
                                        onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido Materno *</Label>
                                    <Input
                                        value={formData.apellido_materno}
                                        onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Cargo (Rol en Sistema) *</Label>
                                <Select
                                    value={formData.cargo}
                                    onValueChange={(v) => setFormData({ ...formData, cargo: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CARGOS).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Teléfono Principal</Label>
                                    <Input
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        placeholder="Ej: 987654321"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono Secundario (Referencia)</Label>
                                    <Input
                                        value={formData.telefono_secundario}
                                        onChange={(e) => setFormData({ ...formData, telefono_secundario: e.target.value })}
                                        placeholder="Familiar o Emergencia"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email Corporativo</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dirección</Label>
                                    <Input
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Estado del Empleado (Solo en edición) */}
                            {isEditing && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Estado del Empleado
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Estado</Label>
                                                <Select
                                                    value={formData.estado}
                                                    onValueChange={(v) => setFormData({ ...formData, estado: v as EstadoEmpleado })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(ESTADOS).map(([key, { label }]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.estado !== 'ACTIVO' && (
                                                <div className="space-y-2">
                                                    <Label>Motivo</Label>
                                                    <Textarea
                                                        value={formData.motivo_estado}
                                                        onChange={(e) => setFormData({ ...formData, motivo_estado: e.target.value })}
                                                        placeholder="Razón del estado (licencia médica, suspensión, etc.)"
                                                        className="h-20"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Contacto de Emergencia */}
                            <Separator className="my-4" />
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Contacto de Emergencia
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre Contacto</Label>
                                        <Input
                                            value={formData.nombre_contacto_emergencia}
                                            onChange={(e) => setFormData({ ...formData, nombre_contacto_emergencia: e.target.value })}
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Parentesco</Label>
                                        <Select
                                            value={formData.parentesco_emergencia}
                                            onValueChange={(v) => setFormData({ ...formData, parentesco_emergencia: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PARENTESCOS.map((p) => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono Emergencia</Label>
                                        <Input
                                            value={formData.telefono_emergencia}
                                            onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value })}
                                            placeholder="987654321"
                                            maxLength={9}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-slate-900 text-white">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar Empleado'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(CARGOS).map(([key, { label, icon: Icon, color }]) => {
                    const count = empleados.filter(e => e.cargo === key && e.activo).length
                    return (
                        <Card key={key} className="glass-panel border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{label}s</p>
                                        <h3 className="text-2xl font-bold">{count}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                                        <Icon className={`w-5 h-5 text-${color.replace('bg-', '')}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="glass-panel border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Directorio de Personal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando directorio...</div>
                    ) : empleados.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay empleados registrados
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Colaborador</TableHead>
                                    <TableHead>Rol & Cargo</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Acceso</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Control</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {empleados.map((emp) => {
                                    const CargoIcon = CARGOS[emp.cargo as keyof typeof CARGOS]?.icon || Briefcase
                                    return (
                                        <TableRow key={emp.id} className="group hover:bg-slate-50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-200">
                                                        <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">
                                                            {emp.nombres.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{emp.nombre_completo}</p>
                                                        <p className="text-xs text-muted-foreground">{emp.numero_documento}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1.5 py-1 pl-1 pr-2">
                                                    <div className={`p-1 rounded-full ${CARGOS[emp.cargo as keyof typeof CARGOS]?.color || 'bg-slate-500'} bg-opacity-20`}>
                                                        <CargoIcon className={`w-3 h-3 ${CARGOS[emp.cargo as keyof typeof CARGOS]?.color.replace('bg-', 'text-') || 'text-slate-500'}`} />
                                                    </div>
                                                    {CARGOS[emp.cargo as keyof typeof CARGOS]?.label || emp.cargo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-slate-600">{emp.email || '-'}</span>
                                                    <span className="text-xs text-muted-foreground">{emp.telefono_principal || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {emp.user_id ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Habilitado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                                        <Ban className="w-3.5 h-3.5" />
                                                        Sin Usuario
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const estadoInfo = ESTADOS[emp.estado as EstadoEmpleado] || ESTADOS.ACTIVO
                                                    const EstadoIcon = estadoInfo.icon
                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="outline" className={`gap-1.5 ${estadoInfo.color}`}>
                                                                <EstadoIcon className="w-3 h-3" />
                                                                {estadoInfo.label}
                                                            </Badge>
                                                            {emp.motivo_estado && (
                                                                <span className="text-[10px] text-slate-400 max-w-[120px] truncate" title={emp.motivo_estado}>
                                                                    {emp.motivo_estado}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                                                        <DropdownMenuItem onClick={() => handleEditClick(emp)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar Datos
                                                        </DropdownMenuItem>

                                                        {!emp.user_id && emp.email && emp.activo && (
                                                            <DropdownMenuItem onClick={() => handleInvitar(emp.id, emp.email!)}>
                                                                <Mail className="mr-2 h-4 w-4" /> Enviar Invitación
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />

                                                        {emp.activo ? (
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleEstadoChange(emp.id, false)}>
                                                                <Ban className="mr-2 h-4 w-4" /> Dar de Baja
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem className="text-green-600 focus:text-green-600 focus:bg-green-50" onClick={() => handleEstadoChange(emp.id, true)}>
                                                                <RotateCcw className="mr-2 h-4 w-4" /> Reactivar
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
