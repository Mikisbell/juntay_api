'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
    UserPlus, Users, Briefcase, Shield, Calculator, Eye, Mail, MoreHorizontal,
    Pencil, Ban, CheckCircle, RotateCcw, Phone, AlertCircle, PauseCircle, XCircle,
    Search, UserX, Clock, MessageCircle
} from 'lucide-react'
import { listarEmpleados, crearEmpleado, actualizarEmpleado, darDeBajaEmpleado, reactivarEmpleado, type EmpleadoCompleto, type EstadoEmpleado } from '@/lib/actions/empleados-actions'
import { invitarEmpleado } from '@/lib/actions/auth-empleados-actions'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

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

type FilterTab = 'todos' | 'activos' | 'licencia' | 'suspendidos' | 'baja' | 'sin_acceso'

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<EmpleadoCompleto[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<FilterTab>('todos')

    // Create/Edit Dialog State
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null)
    const [formTab, setFormTab] = useState('personal')

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

    // Computed stats
    const stats = useMemo(() => {
        const activos = empleados.filter(e => e.activo && e.estado === 'ACTIVO')
        const sinAcceso = empleados.filter(e => e.activo && !e.user_id)
        const enLicencia = empleados.filter(e => e.estado === 'LICENCIA')
        const suspendidos = empleados.filter(e => e.estado === 'SUSPENDIDO')

        return {
            total: empleados.length,
            activos: activos.length,
            sinAcceso: sinAcceso.length,
            enLicencia: enLicencia.length,
            suspendidos: suspendidos.length,
            baja: empleados.filter(e => e.estado === 'BAJA').length
        }
    }, [empleados])

    // Filtered empleados
    const filteredEmpleados = useMemo(() => {
        let result = empleados

        // Apply filter tab
        switch (activeFilter) {
            case 'activos':
                result = result.filter(e => e.activo && e.estado === 'ACTIVO')
                break
            case 'licencia':
                result = result.filter(e => e.estado === 'LICENCIA')
                break
            case 'suspendidos':
                result = result.filter(e => e.estado === 'SUSPENDIDO')
                break
            case 'baja':
                result = result.filter(e => e.estado === 'BAJA')
                break
            case 'sin_acceso':
                result = result.filter(e => e.activo && !e.user_id)
                break
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(e =>
                e.nombre_completo.toLowerCase().includes(query) ||
                e.numero_documento.includes(query) ||
                e.email?.toLowerCase().includes(query) ||
                e.telefono_principal?.includes(query)
            )
        }

        return result
    }, [empleados, activeFilter, searchQuery])

    // Row styling based on status
    const getRowClass = (emp: EmpleadoCompleto) => {
        if (emp.estado === 'BAJA') return 'bg-slate-50 opacity-60'
        if (emp.estado === 'SUSPENDIDO') return 'bg-red-50/50'
        if (emp.estado === 'LICENCIA') return 'bg-amber-50/50'
        if (emp.activo && !emp.user_id) return 'bg-yellow-50/50 border-l-4 border-l-yellow-400'
        return ''
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
        setFormTab('personal')
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
                await actualizarEmpleado(editingId, editingPersonaId, formData)
                toast.success('Empleado actualizado exitosamente')
            } else {
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
        } catch {
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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Error al enviar invitación'
            toast.error(msg)
        }
    }

    return (
        <div className="space-y-6 animate-in-fade-slide">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Talento</h1>
                    <p className="text-muted-foreground">Administración del personal y accesos al sistema.</p>
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

                        {/* Tabbed Form */}
                        <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="personal">👤 Personal</TabsTrigger>
                                <TabsTrigger value="laboral">💼 Laboral</TabsTrigger>
                                <TabsTrigger value="emergencia">🆘 Emergencia</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="mt-4">
                                <TabsContent value="personal" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipo Documento</Label>
                                            <Select
                                                value={formData.tipo_documento}
                                                onValueChange={(v) => setFormData({ ...formData, tipo_documento: v })}
                                                disabled={isEditing}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
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

                                    <div className="flex justify-end">
                                        <Button type="button" onClick={() => setFormTab('laboral')}>
                                            Siguiente →
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="laboral" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Cargo (Rol en Sistema) *</Label>
                                        <Select
                                            value={formData.cargo}
                                            onValueChange={(v) => setFormData({ ...formData, cargo: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                                                placeholder="987654321"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Teléfono Secundario</Label>
                                            <Input
                                                value={formData.telefono_secundario}
                                                onChange={(e) => setFormData({ ...formData, telefono_secundario: e.target.value })}
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

                                    {isEditing && (
                                        <>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Estado del Empleado</Label>
                                                    <Select
                                                        value={formData.estado}
                                                        onValueChange={(v) => setFormData({ ...formData, estado: v as EstadoEmpleado })}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                                            placeholder="Razón del estado"
                                                            className="h-20"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between">
                                        <Button type="button" variant="outline" onClick={() => setFormTab('personal')}>
                                            ← Anterior
                                        </Button>
                                        <Button type="button" onClick={() => setFormTab('emergencia')}>
                                            Siguiente →
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="emergencia" className="space-y-4">
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
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
                                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {PARENTESCOS.map((p) => (
                                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Teléfono</Label>
                                                <Input
                                                    value={formData.telefono_emergencia}
                                                    onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value })}
                                                    placeholder="987654321"
                                                    maxLength={9}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button type="button" variant="outline" onClick={() => setFormTab('laboral')}>
                                            ← Anterior
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="bg-slate-900 text-white">
                                                {isEditing ? 'Guardar Cambios' : 'Registrar Empleado'}
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </form>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Smart KPI Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                {/* Total activos */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Activo</p>
                                <h3 className="text-3xl font-bold text-slate-800">{stats.activos}</h3>
                            </div>
                            <Users className="h-8 w-8 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* Sin acceso - Actionable */}
                <Card
                    className={cn(
                        "border-0 shadow-sm cursor-pointer transition-all hover:scale-105",
                        stats.sinAcceso > 0
                            ? "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-300"
                            : "bg-gradient-to-br from-emerald-50 to-emerald-100"
                    )}
                    onClick={() => setActiveFilter(stats.sinAcceso > 0 ? 'sin_acceso' : 'todos')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sin Acceso</p>
                                <h3 className={cn(
                                    "text-3xl font-bold",
                                    stats.sinAcceso > 0 ? "text-amber-700" : "text-emerald-700"
                                )}>
                                    {stats.sinAcceso}
                                </h3>
                                {stats.sinAcceso > 0 && (
                                    <p className="text-xs text-amber-600 mt-1">Necesitan invitación →</p>
                                )}
                            </div>
                            <UserX className={cn("h-8 w-8", stats.sinAcceso > 0 ? "text-amber-500" : "text-emerald-500")} />
                        </div>
                    </CardContent>
                </Card>

                {/* En licencia */}
                <Card
                    className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setActiveFilter('licencia')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">En Licencia</p>
                                <h3 className="text-3xl font-bold text-amber-700">{stats.enLicencia}</h3>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Suspendidos */}
                <Card
                    className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setActiveFilter('suspendidos')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Suspendidos</p>
                                <h3 className="text-3xl font-bold text-red-700">{stats.suspendidos}</h3>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Dados de baja */}
                <Card
                    className="border-0 shadow-sm bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setActiveFilter('baja')}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dados de Baja</p>
                                <h3 className="text-3xl font-bold text-slate-600">{stats.baja}</h3>
                            </div>
                            <XCircle className="h-8 w-8 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Directorio de Personal
                            <Badge variant="secondary" className="ml-2">{filteredEmpleados.length}</Badge>
                        </CardTitle>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, DNI, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {[
                            { key: 'todos', label: 'Todos', count: empleados.length },
                            { key: 'activos', label: 'Activos', count: stats.activos },
                            { key: 'sin_acceso', label: 'Sin Acceso', count: stats.sinAcceso },
                            { key: 'licencia', label: 'En Licencia', count: stats.enLicencia },
                            { key: 'suspendidos', label: 'Suspendidos', count: stats.suspendidos },
                            { key: 'baja', label: 'Dados de Baja', count: stats.baja },
                        ].map(({ key, label, count }) => (
                            <Button
                                key={key}
                                variant={activeFilter === key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter(key as FilterTab)}
                                className={cn(
                                    "gap-1.5",
                                    activeFilter === key && "bg-slate-900"
                                )}
                            >
                                {label}
                                <Badge variant="secondary" className={cn(
                                    "ml-1 text-xs",
                                    activeFilter === key && "bg-white/20 text-white"
                                )}>
                                    {count}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando directorio...</div>
                    ) : filteredEmpleados.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'No se encontraron resultados' : 'No hay empleados en esta categoría'}
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
                                {filteredEmpleados.map((emp) => {
                                    const CargoIcon = CARGOS[emp.cargo as keyof typeof CARGOS]?.icon || Briefcase
                                    return (
                                        <TableRow
                                            key={emp.id}
                                            className={cn(
                                                "group transition-colors",
                                                getRowClass(emp)
                                            )}
                                        >
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
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-slate-600">{emp.email || '-'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">{emp.telefono_principal || '-'}</span>
                                                        {emp.telefono_principal && (
                                                            <a
                                                                href={`https://wa.me/51${emp.telefono_principal.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:text-green-700"
                                                                title="Enviar WhatsApp"
                                                            >
                                                                <MessageCircle className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {emp.user_id ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Habilitado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                                                        <Ban className="w-3.5 h-3.5" />
                                                        Sin Usuario
                                                        {emp.email && emp.activo && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-5 px-1.5 text-xs text-blue-600 hover:text-blue-700"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleInvitar(emp.id, emp.email!)
                                                                }}
                                                            >
                                                                Invitar
                                                            </Button>
                                                        )}
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
