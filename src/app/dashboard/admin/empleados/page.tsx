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
import { UserPlus, Users, Briefcase, Shield, Calculator, Eye, Mail } from 'lucide-react'
import { listarEmpleados, crearEmpleado, type EmpleadoCompleto } from '@/lib/actions/empleados-actions'
import { invitarEmpleado } from '@/lib/actions/auth-empleados-actions'
import { toast } from 'sonner'

const CARGOS = {
    cajero: { label: 'Cajero', icon: Calculator, color: 'bg-blue-500' },
    tasador: { label: 'Tasador', icon: Eye, color: 'bg-purple-500' },
    gerente: { label: 'Gerente', icon: Briefcase, color: 'bg-orange-500' },
    admin: { label: 'Administrador', icon: Shield, color: 'bg-red-500' }
}

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<EmpleadoCompleto[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    const [formData, setFormData] = useState({
        tipo_documento: 'DNI',
        numero_documento: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        cargo: 'cajero',
        telefono: '',
        email: '',
        direccion: ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await crearEmpleado(formData as any)
            toast.success('Empleado registrado exitosamente')
            setDialogOpen(false)
            cargarEmpleados()
            // Reset form
            setFormData({
                tipo_documento: 'DNI',
                numero_documento: '',
                nombres: '',
                apellido_paterno: '',
                apellido_materno: '',
                cargo: 'cajero',
                telefono: '',
                email: '',
                direccion: ''
            })
        } catch (error) {
            toast.error('Error al registrar empleado')
            console.error(error)
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
            cargarEmpleados()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar invitación')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
                    <p className="text-muted-foreground">Administra el personal de la empresa</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Nuevo Empleado
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo Documento</Label>
                                    <Select
                                        value={formData.tipo_documento}
                                        onValueChange={(v) => setFormData({ ...formData, tipo_documento: v })}
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
                                <Label>Cargo *</Label>
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
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Registrar Empleado
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(CARGOS).map(([key, { label, icon: Icon, color }]) => {
                    const count = empleados.filter(e => e.cargo === key).length
                    return (
                        <Card key={key}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{label}s</p>
                                        <h3 className="text-2xl font-bold">{count}</h3>
                                    </div>
                                    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                                        <Icon className={`w-5 h-5 text-${color.replace('bg-', '')}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Personal Activo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
                    ) : empleados.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay empleados registrados
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Fecha Ingreso</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {empleados.map((emp) => {
                                    const CargoIcon = CARGOS[emp.cargo as keyof typeof CARGOS]?.icon || Briefcase
                                    return (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{emp.nombre_completo}</p>
                                                    <p className="text-sm text-muted-foreground">{emp.email || 'Sin email'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{emp.numero_documento}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    <CargoIcon className="w-3 h-3" />
                                                    {CARGOS[emp.cargo as keyof typeof CARGOS]?.label || emp.cargo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{emp.telefono_principal || '-'}</TableCell>
                                            <TableCell>{new Date(emp.fecha_ingreso).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={emp.activo ? 'default' : 'secondary'}>
                                                    {emp.activo ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {!emp.user_id && emp.email && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        onClick={() => handleInvitar(emp.id, emp.email)}
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        Invitar
                                                    </Button>
                                                )}
                                                {emp.user_id && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        Cuenta activa
                                                    </Badge>
                                                )}
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
