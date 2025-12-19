"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    User,
    CreditCard,
    MessageSquare,
    MoreHorizontal,
    Shield,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    TrendingUp,
    Clock,
    UserCheck,
    Pencil,
    X,
    PhoneCall,
    Sparkles,
    ArrowUpRight,
    Receipt
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { CentroComunicacionCliente } from "@/components/business/CentroComunicacionCliente"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { eliminarCliente, actualizarCliente } from "@/lib/actions/clientes-actions"
import { cn } from "@/lib/utils"

// Tipos extendidos para el nuevo perfil
interface ClienteExtended {
    id: string
    persona_id: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    nombre_completo: string
    tipo_documento: string
    numero_documento: string
    telefono_principal: string | null
    telefono_secundario: string | null
    parentesco_referencia: string | null
    email: string | null
    direccion: string | null
    activo: boolean
    created_at: string
    score_crediticio: number
    stats: {
        totalCreditos: number
        creditosPagados: number
        creditosActivos: number
        creditosVencidos: number
        totalPrestado: number
        deudaActual: number
        totalPagos: number
        montoTotalPagado: number
    }
    proximoVencimiento: string | null
    diasParaVencimiento: number | null
    estadoRiesgo: 'critico' | 'alerta' | 'normal' | 'sin_deuda'
}

interface Credito {
    id: string
    codigo_credito?: string
    monto_prestamo: number
    saldo_actual?: number
    fecha_desembolso: string
    fecha_vencimiento: string
    estado: string
    garantia?: { descripcion: string }
}

interface Pago {
    id: string
    credito_id: string
    codigo_credito: string
    monto_total: number
    monto_capital: number
    monto_interes: number
    monto_mora: number
    metodo_pago: string
    fecha_pago: string
    created_at: string
}

interface ClienteDetalleViewProps {
    cliente: ClienteExtended
    creditos?: Credito[]
    pagos?: Pago[]
}

export function ClienteDetalleView({ cliente, creditos = [], pagos = [] }: ClienteDetalleViewProps) {
    const router = useRouter()
    const [whatsappOpen, setWhatsappOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Form state para edición
    const [editForm, setEditForm] = useState({
        nombres: cliente.nombres,
        apellido_paterno: cliente.apellido_paterno,
        apellido_materno: cliente.apellido_materno,
        telefono_principal: cliente.telefono_principal || '',
        telefono_secundario: cliente.telefono_secundario || '',
        parentesco_referencia: cliente.parentesco_referencia || '',
        email: cliente.email || '',
        direccion: cliente.direccion || ''
    })

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
        } catch {
            toast.error("Ocurrió un error inesperado al eliminar")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    const handleGuardarEdicion = async () => {
        setIsSaving(true)
        try {
            const result = await actualizarCliente(cliente.id, cliente.persona_id, editForm)
            if (result.success) {
                toast.success("Cliente actualizado correctamente")
                setIsEditDialogOpen(false)
                router.refresh()
            }
        } catch {
            toast.error("Error al actualizar cliente")
        } finally {
            setIsSaving(false)
        }
    }

    // Helpers
    const getScoreGrade = (score: number) => {
        if (score >= 750) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Excelente' }
        if (score >= 650) return { grade: 'A', color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Muy Bueno' }
        if (score >= 550) return { grade: 'B', color: 'text-amber-600', bg: 'bg-amber-100', label: 'Regular' }
        if (score >= 450) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100', label: 'Bajo' }
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100', label: 'Riesgo' }
    }

    const getRiskConfig = (risk: string) => {
        switch (risk) {
            case 'critico': return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '⚠️ CLIENTE EN MORA' }
            case 'alerta': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: '⏰ Próximo a Vencer' }
            case 'normal': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '✅ Al Día' }
            default: return { icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: '✨ Sin Deuda' }
        }
    }

    const initials = `${cliente.nombres?.[0] || ''}${cliente.apellido_paterno?.[0] || ''}`
    const fullName = `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}`.trim()
    const scoreInfo = getScoreGrade(cliente.score_crediticio)
    const riskConfig = getRiskConfig(cliente.estadoRiesgo)
    const clienteDesde = new Date(cliente.created_at)
    const añosCliente = Math.floor((Date.now() - clienteDesde.getTime()) / (1000 * 60 * 60 * 24 * 365))

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
            {/* Alert Banner for Critical Clients */}
            {cliente.estadoRiesgo === 'critico' && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 animate-pulse" />
                        <span className="font-medium">Este cliente tiene deuda vencida. Contactar inmediatamente.</span>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => setWhatsappOpen(true)}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contactar Ahora
                    </Button>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/clientes" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Volver a Clientes
                        </Link>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "font-medium",
                                    cliente.activo
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                )}
                            >
                                {cliente.activo ? "✓ Activo" : "✕ Suspendido"}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn("font-semibold", riskConfig.bg, riskConfig.color, riskConfig.border)}
                            >
                                {riskConfig.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Profile Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            {/* Avatar with Score Ring */}
                            <div className="relative">
                                <Avatar className={cn(
                                    "h-24 w-24 border-4 shadow-lg",
                                    cliente.estadoRiesgo === 'critico' ? 'border-red-300' :
                                        cliente.estadoRiesgo === 'alerta' ? 'border-amber-300' : 'border-emerald-300'
                                )}>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombres}&backgroundColor=f1f5f9`} />
                                    <AvatarFallback className="text-2xl bg-slate-100 text-slate-600">{initials}</AvatarFallback>
                                </Avatar>
                                {/* Score Badge */}
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md",
                                    scoreInfo.bg, scoreInfo.color
                                )}>
                                    {scoreInfo.grade}
                                </div>
                            </div>

                            {/* Name and Info */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                                        {cliente.tipo_documento} {cliente.numero_documento}
                                    </span>
                                    {cliente.telefono_principal && (
                                        <a href={`tel:${cliente.telefono_principal}`} className="flex items-center gap-1 hover:text-primary">
                                            <Phone className="h-3.5 w-3.5" />
                                            {cliente.telefono_principal}
                                        </a>
                                    )}
                                    {cliente.email && (
                                        <a href={`mailto:${cliente.email}`} className="flex items-center gap-1 hover:text-primary">
                                            <Mail className="h-3.5 w-3.5" />
                                            {cliente.email}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Cliente desde {clienteDesde.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
                                        {añosCliente > 0 && <span className="text-emerald-600">({añosCliente}+ años)</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {cliente.telefono_principal && (
                                <>
                                    <a href={`tel:${cliente.telefono_principal}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <PhoneCall className="h-4 w-4" />
                                            Llamar
                                        </Button>
                                    </a>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => setWhatsappOpen(true)}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        WhatsApp
                                    </Button>
                                </>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Editar Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <X className="h-4 w-4 mr-2" /> Eliminar Cliente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Separator orientation="vertical" className="h-8 mx-1" />
                            <Link href={`/dashboard/mostrador/nuevo-empeno?clienteId=${cliente.id}`}>
                                <Button className="gap-2 shadow-md">
                                    <Wallet className="h-4 w-4" />
                                    Nuevo Préstamo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto w-full px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Deuda Actual */}
                    <Card className={cn(
                        "border-0 shadow-sm",
                        cliente.stats.deudaActual > 0 && cliente.estadoRiesgo === 'critico'
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-white"
                    )}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Deuda Actual</span>
                                <Wallet className={cn("h-4 w-4",
                                    cliente.stats.deudaActual > 0 ? "text-red-500" : "text-slate-400"
                                )} />
                            </div>
                            <div className={cn(
                                "text-2xl font-bold",
                                cliente.stats.deudaActual > 0 && cliente.estadoRiesgo === 'critico'
                                    ? "text-red-700"
                                    : "text-slate-900"
                            )}>
                                S/ {cliente.stats.deudaActual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Score */}
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Score</span>
                                <Shield className={cn("h-4 w-4", scoreInfo.color)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-slate-900">{cliente.score_crediticio}</span>
                                <Badge className={cn("text-xs", scoreInfo.bg, scoreInfo.color)}>{scoreInfo.label}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Créditos Activos */}
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Créditos Activos</span>
                                <CreditCard className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">{cliente.stats.creditosActivos}</span>
                                <span className="text-xs text-slate-400">de {cliente.stats.totalCreditos} total</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Prestado */}
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Total Prestado</span>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                S/ {cliente.stats.totalPrestado.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Pagado */}
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Total Pagado</span>
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-emerald-600">
                                    S/ {cliente.stats.montoTotalPagado.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                                </span>
                                <span className="text-xs text-slate-400">({cliente.stats.totalPagos} pagos)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content - Tabs */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-8 pb-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-white p-1 rounded-lg shadow-sm mb-6">
                        <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <User className="h-4 w-4" /> Resumen
                        </TabsTrigger>
                        <TabsTrigger value="creditos" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <CreditCard className="h-4 w-4" /> Créditos ({creditos.length})
                        </TabsTrigger>
                        <TabsTrigger value="pagos" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <Receipt className="h-4 w-4" /> Pagos ({pagos.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <User className="h-5 w-5 text-primary" />
                                        Información Personal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Documento</p>
                                            <p className="font-medium">{cliente.tipo_documento} {cliente.numero_documento}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Teléfono Principal</p>
                                            <p className="font-medium">{cliente.telefono_principal || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Email</p>
                                            <p className="font-medium">{cliente.email || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Dirección</p>
                                            <p className="font-medium">{cliente.direccion || '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reference Contact - NOW VISIBLE! */}
                            <Card className={cn(
                                "border-0 shadow-sm",
                                cliente.telefono_secundario ? "bg-orange-50/50" : "bg-white"
                            )}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <UserCheck className="h-5 w-5 text-orange-500" />
                                        Contacto de Referencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cliente.telefono_secundario ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                                                <div>
                                                    <p className="text-sm text-slate-500">
                                                        {cliente.parentesco_referencia || 'Familiar/Referencia'}
                                                    </p>
                                                    <p className="font-bold text-lg">{cliente.telefono_secundario}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href={`tel:${cliente.telefono_secundario}`}>
                                                        <Button size="sm" variant="outline" className="h-9">
                                                            <PhoneCall className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/51${cliente.telefono_secundario.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button size="sm" variant="outline" className="h-9 text-green-600">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="text-xs text-orange-600">
                                                💡 Usar solo si no se logra contactar al cliente principal
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400">
                                            <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p>Sin contacto de referencia registrado</p>
                                            <Button
                                                variant="link"
                                                className="mt-2"
                                                onClick={() => setIsEditDialogOpen(true)}
                                            >
                                                Agregar referencia
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Próximo Vencimiento Alert */}
                        {cliente.proximoVencimiento && cliente.diasParaVencimiento !== null && (
                            <Card className={cn(
                                "border-0 shadow-sm",
                                cliente.diasParaVencimiento < 0 ? "bg-red-50 border-red-200" :
                                    cliente.diasParaVencimiento <= 7 ? "bg-amber-50 border-amber-200" :
                                        "bg-emerald-50 border-emerald-200"
                            )}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className={cn(
                                            "h-6 w-6",
                                            cliente.diasParaVencimiento < 0 ? "text-red-600" :
                                                cliente.diasParaVencimiento <= 7 ? "text-amber-600" : "text-emerald-600"
                                        )} />
                                        <div>
                                            <p className="font-medium">Próximo Vencimiento: {cliente.proximoVencimiento}</p>
                                            <p className={cn(
                                                "text-sm",
                                                cliente.diasParaVencimiento < 0 ? "text-red-600 font-bold" :
                                                    cliente.diasParaVencimiento <= 7 ? "text-amber-600" : "text-emerald-600"
                                            )}>
                                                {cliente.diasParaVencimiento < 0
                                                    ? `⚠️ Vencido hace ${Math.abs(cliente.diasParaVencimiento)} días`
                                                    : cliente.diasParaVencimiento === 0
                                                        ? '⏰ Vence HOY'
                                                        : `Vence en ${cliente.diasParaVencimiento} días`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {cliente.diasParaVencimiento <= 7 && (
                                        <Button
                                            variant={cliente.diasParaVencimiento < 0 ? "destructive" : "outline"}
                                            onClick={() => setWhatsappOpen(true)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Recordar Pago
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Créditos Tab */}
                    <TabsContent value="creditos" className="space-y-4">
                        {creditos.length > 0 ? (
                            creditos.map((credito) => {
                                const esVencido = new Date(credito.fecha_vencimiento) < new Date()
                                return (
                                    <Link
                                        key={credito.id}
                                        href={`/dashboard/contratos/${credito.id}`}
                                        className="block"
                                    >
                                        <Card className={cn(
                                            "border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                                            esVencido ? "bg-red-50 ring-1 ring-red-200" : "bg-white hover:ring-1 hover:ring-primary/30"
                                        )}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">#{credito.codigo_credito || credito.id.slice(0, 8)}</span>
                                                            <Badge className={cn(
                                                                esVencido ? "bg-red-100 text-red-700" :
                                                                    credito.estado === 'PAGADO' || credito.estado === 'cancelado' ? "bg-emerald-100 text-emerald-700" :
                                                                        "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {esVencido ? 'Vencido' : credito.estado}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-500">{credito.garantia?.descripcion || 'Sin descripción'}</p>
                                                        <p className="text-xs text-slate-400">
                                                            Vence: {new Date(credito.fecha_vencimiento).toLocaleDateString('es-PE')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div>
                                                            <p className="text-lg font-bold">S/ {credito.monto_prestamo.toFixed(2)}</p>
                                                            {credito.saldo_actual && credito.saldo_actual !== credito.monto_prestamo && (
                                                                <p className="text-xs text-slate-500">Saldo: S/ {credito.saldo_actual.toFixed(2)}</p>
                                                            )}
                                                        </div>
                                                        <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })
                        ) : (
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-12 text-center">
                                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                    <h3 className="text-lg font-medium text-slate-900">Sin Créditos</h3>
                                    <p className="text-slate-500 mt-1">Este cliente no tiene créditos registrados.</p>
                                    <Link href={`/dashboard/mostrador/nuevo-empeno?clienteId=${cliente.id}`}>
                                        <Button className="mt-4">Crear Primer Préstamo</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Pagos Tab - NOW WITH REAL DATA! */}
                    <TabsContent value="pagos" className="space-y-4">
                        {pagos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <Card className="border-0 shadow-sm bg-emerald-50">
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-emerald-700">{pagos.length}</p>
                                            <p className="text-xs text-emerald-600">Pagos Totales</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-slate-700">
                                                S/ {pagos.reduce((s, p) => s + p.monto_total, 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">Total Pagado</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-slate-700">
                                                S/ {pagos.reduce((s, p) => s + p.monto_interes, 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-500">En Intereses</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-sm">
                                        <CardContent className="p-4 text-center">
                                            <p className="text-2xl font-bold text-slate-700">
                                                {pagos[0] ? new Date(pagos[0].fecha_pago).toLocaleDateString('es-PE') : '-'}
                                            </p>
                                            <p className="text-xs text-slate-500">Último Pago</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Payment Timeline */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Historial de Pagos</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {pagos.map((pago, idx) => (
                                            <div
                                                key={pago.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg",
                                                    idx === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                                        idx === 0 ? "bg-emerald-100" : "bg-slate-200"
                                                    )}>
                                                        <DollarSign className={cn(
                                                            "h-5 w-5",
                                                            idx === 0 ? "text-emerald-600" : "text-slate-500"
                                                        )} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            S/ {pago.monto_total.toFixed(2)}
                                                            {idx === 0 && <Badge className="ml-2 bg-emerald-100 text-emerald-700">Último</Badge>}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Contrato #{pago.codigo_credito} • {pago.metodo_pago || 'Efectivo'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        Capital: S/{pago.monto_capital.toFixed(0)} | Int: S/{pago.monto_interes.toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card className="border-0 shadow-sm">
                                <CardContent className="p-12 text-center">
                                    <Receipt className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                    <h3 className="text-lg font-medium text-slate-900">Sin Pagos Registrados</h3>
                                    <p className="text-slate-500 mt-1">Este cliente no tiene pagos en su historial.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <CentroComunicacionCliente
                open={whatsappOpen}
                onOpenChange={setWhatsappOpen}
                cliente={{
                    id: cliente.id,
                    nombre: fullName,
                    telefono: cliente.telefono_principal
                }}
            />

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nombres</Label>
                                <Input
                                    value={editForm.nombres}
                                    onChange={e => setEditForm({ ...editForm, nombres: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Apellido Paterno</Label>
                                <Input
                                    value={editForm.apellido_paterno}
                                    onChange={e => setEditForm({ ...editForm, apellido_paterno: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Teléfono Principal</Label>
                                <Input
                                    value={editForm.telefono_principal}
                                    onChange={e => setEditForm({ ...editForm, telefono_principal: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <Separator />
                        <p className="text-sm font-medium text-orange-600">Contacto de Referencia</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Teléfono Referencia</Label>
                                <Input
                                    value={editForm.telefono_secundario}
                                    onChange={e => setEditForm({ ...editForm, telefono_secundario: e.target.value })}
                                    placeholder="987654321"
                                />
                            </div>
                            <div>
                                <Label>Parentesco</Label>
                                <Input
                                    value={editForm.parentesco_referencia}
                                    onChange={e => setEditForm({ ...editForm, parentesco_referencia: e.target.value })}
                                    placeholder="Esposa, Padre, Hermano..."
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Dirección</Label>
                            <Input
                                value={editForm.direccion}
                                onChange={e => setEditForm({ ...editForm, direccion: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleGuardarEdicion} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente a <strong>{fullName}</strong>.
                            El sistema rechazará si tiene historial de créditos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleEliminarCliente() }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
