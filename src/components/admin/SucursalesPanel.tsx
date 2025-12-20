'use client'

import { useEffect, useState } from 'react'
import {
    Building2,
    Plus,
    MapPin,
    Phone,
    Users,
    Wallet,
    RefreshCw,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    listarSucursales,
    crearSucursal,
    obtenerResumenConsolidadoSucursales,
    type Sucursal,
    type ResumenSucursal
} from '@/lib/actions/sucursales-actions'
import { cn } from '@/lib/utils'

/**
 * Panel de Gestión de Sucursales
 */
export function SucursalesPanel() {
    const [sucursales, setSucursales] = useState<Sucursal[]>([])
    const [resumen, setResumen] = useState<ResumenSucursal[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [creando, setCreando] = useState(false)
    const [form, setForm] = useState({
        codigo: '',
        nombre: '',
        direccion: '',
        telefono: ''
    })

    const cargar = async () => {
        setLoading(true)
        try {
            const [suc, res] = await Promise.all([
                listarSucursales(),
                obtenerResumenConsolidadoSucursales()
            ])
            setSucursales(suc)
            setResumen(res)
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error cargando sucursales')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
    }, [])

    const handleCrear = async () => {
        if (!form.codigo || !form.nombre || !form.direccion) {
            toast.error('Completa los campos requeridos')
            return
        }

        setCreando(true)
        try {
            const result = await crearSucursal(form)
            if (result.success) {
                toast.success('Sucursal creada')
                setDialogOpen(false)
                setForm({ codigo: '', nombre: '', direccion: '', telefono: '' })
                cargar()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error creando sucursal')
        } finally {
            setCreando(false)
        }
    }

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

    // Totales consolidados
    const totalCartera = resumen.reduce((sum, r) => sum + r.carteraTotal, 0)
    const totalCobranza = resumen.reduce((sum, r) => sum + r.cobranzaDelDia, 0)
    const totalCreditos = resumen.reduce((sum, r) => sum + r.creditosActivos, 0)

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Sucursales
                    </h2>
                    <p className="text-muted-foreground">
                        {sucursales.length} sucursal{sucursales.length !== 1 ? 'es' : ''} activa{sucursales.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={cargar}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Sucursal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nueva Sucursal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Código *</Label>
                                        <Input
                                            placeholder="SUC-01"
                                            value={form.codigo}
                                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            placeholder="01-1234567"
                                            value={form.telefono}
                                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input
                                        placeholder="Sucursal Principal"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dirección *</Label>
                                    <Input
                                        placeholder="Av. Principal 123, Lima"
                                        value={form.direccion}
                                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleCrear} disabled={creando} className="w-full">
                                    {creando ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Crear Sucursal
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Resumen Consolidado */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <Wallet className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                        <div className="text-2xl font-bold text-blue-700">
                            {formatMoney(totalCartera)}
                        </div>
                        <div className="text-sm text-blue-600">Cartera Total</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50">
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                        <div className="text-2xl font-bold text-green-700">
                            {formatMoney(totalCobranza)}
                        </div>
                        <div className="text-sm text-green-600">Cobranza Hoy</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                        <div className="text-2xl font-bold text-purple-700">
                            {totalCreditos}
                        </div>
                        <div className="text-sm text-purple-600">Créditos Activos</div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Sucursales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sucursales.map((suc) => {
                    const res = resumen.find(r => r.sucursalId === suc.id)
                    return (
                        <Card key={suc.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        {suc.nombre}
                                    </CardTitle>
                                    <Badge variant={suc.activa ? 'default' : 'secondary'}>
                                        {suc.codigo}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5" />
                                    <span>{suc.direccion}</span>
                                </div>
                                {suc.telefono && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{suc.telefono}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                    <div className="text-center">
                                        <div className="font-bold">{suc.empleados}</div>
                                        <div className="text-xs text-muted-foreground">Empleados</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold">{suc.cajasActivas}</div>
                                        <div className="text-xs text-muted-foreground">Cajas</div>
                                    </div>
                                </div>

                                {res && (
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                        <div>
                                            <div className="text-sm font-medium">
                                                {formatMoney(res.carteraTotal)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Cartera</div>
                                        </div>
                                        <div>
                                            <div className={cn(
                                                'text-sm font-medium flex items-center gap-1',
                                                res.moraPorcentaje > 15 && 'text-red-600'
                                            )}>
                                                {res.moraPorcentaje > 15 && <AlertTriangle className="h-3 w-3" />}
                                                {res.moraPorcentaje}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">Mora</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {sucursales.length === 0 && (
                <Card className="p-8 text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No hay sucursales registradas</p>
                    <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear primera sucursal
                    </Button>
                </Card>
            )}
        </div>
    )
}
