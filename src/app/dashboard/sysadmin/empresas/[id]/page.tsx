'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Building2,
    ArrowLeft,
    MapPin,
    Users,
    Wallet,
    TrendingUp,
    Plus,
    Phone,
    Mail,
    Calendar,
    RefreshCw,
    Edit,
    Power,
    Loader2,
    CreditCard,
    CheckCircle2,
    XCircle,
    FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    obtenerDetalleEmpresa,
    listarSucursalesDeEmpresa,
    toggleEstadoEmpresa,
    toggleEstadoSucursal,
    type EmpresaDetalle,
    type SucursalResumen
} from '@/lib/actions/super-admin-actions'
import { CreateSucursalAdminWizard } from '@/components/sysadmin/CreateSucursalAdminWizard'

export default function EmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: empresaId } = use(params)
    const router = useRouter()
    const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null)
    const [sucursales, setSucursales] = useState<SucursalResumen[]>([])
    const [loading, setLoading] = useState(true)
    const [showWizard, setShowWizard] = useState(false)
    const [togglingEstado, setTogglingEstado] = useState(false)

    const cargar = async () => {
        setLoading(true)
        try {
            const [emp, suc] = await Promise.all([
                obtenerDetalleEmpresa(empresaId),
                listarSucursalesDeEmpresa(empresaId)
            ])
            setEmpresa(emp)
            setSucursales(suc)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresaId])

    const handleToggleEstado = async () => {
        if (!empresa) return
        setTogglingEstado(true)
        try {
            await toggleEstadoEmpresa(empresaId, !empresa.activo)
            toast.success(empresa.activo ? 'Empresa suspendida' : 'Empresa activada')
            await cargar()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cambiando estado')
        } finally {
            setTogglingEstado(false)
        }
    }

    const handleToggleSucursal = async (sucursalId: string, activa: boolean) => {
        try {
            await toggleEstadoSucursal(sucursalId, !activa)
            toast.success(activa ? 'Sucursal desactivada' : 'Sucursal activada')
            await cargar()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cambiando estado')
        }
    }

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(n)

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-64" />
            </div>
        )
    }

    if (!empresa) {
        return (
            <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Empresa no encontrada</p>
                <Button className="mt-4" onClick={() => router.push('/dashboard/sysadmin/empresas')}>
                    Volver al listado
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sysadmin/empresas')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-3 rounded-lg",
                            empresa.activo
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-slate-400 to-slate-500"
                        )}>
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {empresa.nombre_comercial}
                                {empresa.activo ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Activo
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="bg-red-500/10 text-red-600">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Suspendido
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-muted-foreground">{empresa.razon_social}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant={empresa.activo ? "destructive" : "default"}>
                                {togglingEstado ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Power className="h-4 w-4 mr-2" />
                                )}
                                {empresa.activo ? 'Suspender' : 'Activar'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {empresa.activo ? '¿Suspender empresa?' : '¿Activar empresa?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {empresa.activo
                                        ? 'Esto desactivará el acceso de todos los usuarios de esta empresa.'
                                        : 'Esto reactivará el acceso de todos los usuarios.'}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleToggleEstado}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">RUC</p>
                            <p className="font-mono font-bold">{empresa.ruc || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-sm truncate">{empresa.email || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{empresa.telefono || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/50">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Registro</p>
                            <p className="font-medium">
                                {new Date(empresa.created_at).toLocaleDateString('es-PE')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Sucursales</p>
                                    <p className="text-3xl font-bold text-blue-700">{empresa.total_sucursales}</p>
                                </div>
                                <MapPin className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Empleados</p>
                                    <p className="text-3xl font-bold text-purple-700">{empresa.total_empleados}</p>
                                </div>
                                <Users className="h-8 w-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-600">Cartera Total</p>
                                    <p className="text-2xl font-bold text-emerald-700">{formatMoney(empresa.cartera_total)}</p>
                                </div>
                                <Wallet className="h-8 w-8 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-600">Cobranza Mes</p>
                                    <p className="text-2xl font-bold text-amber-700">{formatMoney(empresa.cobranza_mes)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Separator />

            {/* Sucursales */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Sucursales
                                <Badge variant="secondary">{sucursales.length}</Badge>
                            </CardTitle>
                            <CardDescription>
                                Puntos de operación de esta empresa
                            </CardDescription>
                        </div>
                        <Button onClick={() => setShowWizard(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Sucursal
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {sucursales.length === 0 ? (
                        <div className="text-center py-8">
                            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No hay sucursales</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sucursales.map((suc, idx) => (
                                <motion.div
                                    key={suc.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={cn(
                                        "border-l-4 transition-all hover:shadow-md",
                                        suc.activa
                                            ? "border-l-emerald-500"
                                            : "border-l-slate-300 opacity-60"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        suc.activa ? "bg-blue-100" : "bg-slate-100"
                                                    )}>
                                                        <Building2 className={cn(
                                                            "h-5 w-5",
                                                            suc.activa ? "text-blue-600" : "text-slate-400"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{suc.nombre}</span>
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {suc.codigo}
                                                            </Badge>
                                                            {!suc.activa && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Inactiva
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {suc.direccion}
                                                        </p>
                                                        {(suc.departamento || suc.distrito) && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {[suc.distrito, suc.provincia, suc.departamento].filter(Boolean).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="flex items-center gap-1 text-purple-600">
                                                            <Users className="h-4 w-4" />
                                                            <span className="font-bold">{suc.empleados_count}</span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">Empleados</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center gap-1 text-emerald-600">
                                                            <Wallet className="h-4 w-4" />
                                                            <span className="font-bold text-sm">{formatMoney(suc.cartera_total)}</span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">Cartera</div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleSucursal(suc.id, suc.activa)}
                                                    >
                                                        <Power className={cn(
                                                            "h-4 w-4",
                                                            suc.activa ? "text-red-500" : "text-green-500"
                                                        )} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Sucursal Wizard */}
            <CreateSucursalAdminWizard
                open={showWizard}
                onOpenChange={setShowWizard}
                empresaId={empresaId}
                onSuccess={cargar}
            />
        </div>
    )
}
