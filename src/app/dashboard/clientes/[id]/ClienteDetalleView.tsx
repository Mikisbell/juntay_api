"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    User,
    FileText,
    CreditCard,
    History,
    MessageSquare,
    MoreHorizontal,
    Shield,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    DollarSign
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CentroComunicacionCliente } from "@/components/business/CentroComunicacionCliente"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { eliminarCliente } from "@/lib/actions/clientes-actions"

// Tipos traídos directamente aquí para props
interface ClienteCompleto {
    id: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    tipo_documento: string
    numero_documento: string
    telefono_principal: string | null
    email: string | null
    direccion: string | null
    score_crediticio: number
    activo: boolean
    created_at: string
    departamento?: string | null
    provincia?: string | null
    distrito?: string | null
}

interface ResumenFinanciero {
    creditosActivos: number
    deudaTotal: number
    proximoVencimiento: string | null
    diasParaVencimiento: number | null
    esClienteNuevo: boolean
    ultimoPago: { fecha: string, monto: number } | null
}

interface ClienteDetalleViewProps {
    cliente: ClienteCompleto
    resumen: ResumenFinanciero | null
    creditos?: Array<{
        id: string
        codigo_credito?: string
        monto_prestamo: number
        saldo_actual?: number
        fecha_desembolso: string
        fecha_vencimiento: string
        estado: string
        garantia?: {
            descripcion: string
        }
    }>
}

export function ClienteDetalleView({ cliente, resumen, creditos = [] }: ClienteDetalleViewProps) {
    const router = useRouter()
    const [whatsappOpen, setWhatsappOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEliminarCliente = async () => {
        setIsDeleting(true)
        try {
            const result = await eliminarCliente(cliente.id)
            if (result.success) {
                toast.success("Cliente eliminado correctamente")
                router.push("/dashboard/clientes")
            } else {
                toast.error(result.message || "No se pudo eliminar el cliente")
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error inesperado al eliminar")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    // Determinar riesgo/estado visual
    const getScoreColor = (score: number) => {
        if (score >= 700) return "text-emerald-600 bg-emerald-50 border-emerald-200"
        if (score >= 500) return "text-amber-600 bg-amber-50 border-amber-200"
        return "text-red-600 bg-red-50 border-red-200"
    }

    const initials = `${cliente.nombres?.[0] || ''}${cliente.apellido_paterno?.[0] || ''}`
    const fullName = `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno}`

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Header / Hero Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Navigation & Status */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/clientes" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Volver a Clientes
                        </Link>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cliente.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                                {cliente.activo ? "Cliente Activo" : "Inactivo"}
                            </Badge>
                            <Badge variant="outline" className="text-slate-500">
                                {cliente.tipo_documento}: {cliente.numero_documento}
                            </Badge>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombres}`} />
                                <AvatarFallback className="text-2xl bg-slate-100 text-slate-500">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                    {cliente.telefono_principal && (
                                        <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                                            <Phone className="h-3.5 w-3.5" />
                                            {cliente.telefono_principal}
                                        </div>
                                    )}
                                    {cliente.email && (
                                        <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                                            <Mail className="h-3.5 w-3.5" />
                                            {cliente.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Desde {new Date(cliente.created_at).getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Toolbar */}
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setWhatsappOpen(true)} variant="outline" className="h-10 border-slate-200 hover:bg-slate-50 hover:text-green-600 gap-2">
                                <MessageSquare className="h-4 w-4" />
                                WhatsApp
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-10 px-3">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        Eliminar Cliente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Separator orientation="vertical" className="h-8 mx-1" />
                            <Link href={`/dashboard/mostrador/nuevo-empeno?clienteId=${cliente.id}`}>
                                <Button className="h-10 gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Wallet className="h-4 w-4" />
                                    Nuevo Préstamo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Deuda Total
                                <Wallet className="h-4 w-4 text-slate-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                S/ {resumen?.deudaTotal.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {resumen?.creditosActivos || 0} créditos activos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Próximo Vencimiento
                                <Calendar className="h-4 w-4 text-slate-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {resumen?.proximoVencimiento ? (
                                <>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {resumen.proximoVencimiento}
                                    </div>
                                    <p className={`text-xs mt-1 font-medium ${(resumen.diasParaVencimiento || 0) < 3 ? "text-red-600" : "text-amber-600"
                                        }`}>
                                        Vence en {resumen.diasParaVencimiento} días
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-slate-400">
                                        --
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        No hay pagos pendientes
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Score Crediticio
                                <Shield className="h-4 w-4 text-slate-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {cliente.score_crediticio}
                                </div>
                                <Badge variant="outline" className={`${getScoreColor(cliente.score_crediticio)} border-opacity-50`}>
                                    {cliente.score_crediticio >= 700 ? 'Excelente' : cliente.score_crediticio >= 500 ? 'Regular' : 'Riesgo'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Última actualización: Hoy
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenido / Tabs */}
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b border-slate-200 dark:border-slate-800 rounded-none space-x-6">
                        <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 text-slate-500 data-[state=active]:text-primary font-medium">
                            Información General
                        </TabsTrigger>
                        <TabsTrigger value="creditos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 text-slate-500 data-[state=active]:text-primary font-medium">
                            Créditos ({resumen?.creditosActivos || 0})
                        </TabsTrigger>
                        <TabsTrigger value="pagos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-2 text-slate-500 data-[state=active]:text-primary font-medium">
                            Historial de Pagos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-8">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Detalles del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Identificación</h4>
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Documento</span>
                                            <span className="text-sm font-medium">{cliente.tipo_documento} {cliente.numero_documento}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Nombre Completo</span>
                                            <span className="text-sm font-medium">{fullName}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Estado</span>
                                            <span className="text-sm font-medium">{cliente.activo ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ubicación y Contacto</h4>
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Dirección</span>
                                            <span className="text-sm font-medium text-right max-w-[200px] truncate">{cliente.direccion || '-'}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Ubicación</span>
                                            <span className="text-sm font-medium">
                                                {[cliente.distrito, cliente.provincia].filter(Boolean).join(', ') || '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="text-sm text-slate-600">Email</span>
                                            <span className="text-sm font-medium">{cliente.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="creditos" className="mt-8">
                        {creditos.length > 0 ? (
                            <div className="space-y-3">
                                {creditos.map((credito) => {
                                    const estadoConfig: Record<string, { label: string; color: string }> = {
                                        PAGADO: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-800' },
                                        ACTIVO: { label: 'Activo', color: 'bg-blue-100 text-blue-800' },
                                        VENCIDO: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
                                        PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
                                        DESEMBOLSADO: { label: 'Activo', color: 'bg-blue-100 text-blue-800' },
                                        CANCELADO: { label: 'Cancelado', color: 'bg-slate-100 text-slate-800' },
                                    }
                                    const config = estadoConfig[credito.estado] || estadoConfig.PENDIENTE
                                    return (
                                        <Card key={credito.id} className="border-0 shadow-sm ring-1 ring-slate-200 hover:ring-primary/30 transition-all">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold">#{credito.codigo_credito || credito.id.slice(0, 8)}</span>
                                                            <Badge className={config.color}>{config.label}</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500">
                                                            {credito.garantia?.descripcion || 'Sin descripción'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Vence: {new Date(credito.fecha_vencimiento).toLocaleDateString('es-PE')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">S/ {credito.monto_prestamo.toFixed(2)}</p>
                                                        {credito.saldo_actual && credito.saldo_actual !== credito.monto_prestamo && (
                                                            <p className="text-xs text-slate-500">Saldo: S/ {credito.saldo_actual.toFixed(2)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                                    <FileText className="h-12 w-12 text-slate-200 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">Sin Créditos</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                        Este cliente aún no tiene créditos registrados.
                                    </p>
                                    <Link href={`/dashboard/mostrador/nuevo-empeno?clienteId=${cliente.id}`}>
                                        <Button>Crear Primer Préstamo</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="pagos" className="mt-8">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    Historial de Transacciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                                            <p className="text-xl font-bold text-slate-700">{creditos.length}</p>
                                            <p className="text-xs text-slate-500">Total Créditos</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                            <p className="text-xl font-bold text-emerald-700">
                                                {creditos.filter(c => c.estado === 'PAGADO' || c.estado === 'CANCELADO').length}
                                            </p>
                                            <p className="text-xs text-emerald-600">Pagados</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                                            <p className="text-xl font-bold text-blue-700">
                                                {creditos.filter(c => ['ACTIVO', 'DESEMBOLSADO', 'PENDIENTE'].includes(c.estado)).length}
                                            </p>
                                            <p className="text-xs text-blue-600">Activos</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                                            <p className="text-xl font-bold text-amber-700">
                                                S/ {creditos.reduce((sum, c) => sum + c.monto_prestamo, 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-amber-600">Total Prestado</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 text-center">
                                        Los pagos individuales se visualizan en el detalle de cada contrato.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>

            {/* Integration Component */}
            <CentroComunicacionCliente
                open={whatsappOpen}
                onOpenChange={setWhatsappOpen}
                cliente={{
                    id: cliente.id,
                    nombre: fullName,
                    telefono: cliente.telefono_principal
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de eliminar este cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente al cliente <strong>{fullName}</strong>.
                            <br /><br />
                            Nota: El sistema rechazará la eliminación si el cliente tiene historial de créditos para preservar la integridad de los datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleEliminarCliente()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Sí, eliminar cliente"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
