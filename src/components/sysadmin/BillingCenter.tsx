'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    Search,
    RefreshCw,
    Building2,
    Calendar,
    Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    listarFacturas,
    obtenerResumenBilling,
    marcarFacturaPagada,
    type FacturaSaas,
    type FacturaEstado,
    type BillingResumen
} from '@/lib/actions/billing-actions'

export function BillingCenter() {
    const [facturas, setFacturas] = useState<FacturaSaas[]>([])
    const [resumen, setResumen] = useState<BillingResumen | null>(null)
    const [loading, setLoading] = useState(true)

    // Filters
    const [estadoFilter, setEstadoFilter] = useState<FacturaEstado | ''>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Payment dialog
    const [paymentDialog, setPaymentDialog] = useState<FacturaSaas | null>(null)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [paymentRef, setPaymentRef] = useState('')

    const cargar = async () => {
        setLoading(true)
        try {
            const [facturasResult, resumenResult] = await Promise.all([
                listarFacturas({ estado: estadoFilter || undefined }),
                obtenerResumenBilling()
            ])
            setFacturas(facturasResult)
            setResumen(resumenResult)
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
    }, [estadoFilter])

    const handleMarkPaid = async () => {
        if (!paymentDialog || !paymentMethod || !paymentRef) {
            toast.error('Complete todos los campos')
            return
        }

        const result = await marcarFacturaPagada(paymentDialog.id, paymentMethod, paymentRef)
        if (result.success) {
            toast.success('Factura marcada como pagada')
            setPaymentDialog(null)
            setPaymentMethod('')
            setPaymentRef('')
            cargar()
        } else {
            toast.error('Error:', { description: result.error })
        }
    }

    const getEstadoBadge = (estado: FacturaEstado) => {
        switch (estado) {
            case 'pagada': return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Pagada</Badge>
            case 'pendiente': return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
            case 'vencida': return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencida</Badge>
            case 'cancelada': return <Badge variant="secondary">Cancelada</Badge>
            default: return <Badge variant="outline">{estado}</Badge>
        }
    }

    const filteredFacturas = facturas.filter(f =>
        f.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.empresa?.nombre_comercial?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatMoney = (n: number, currency = 'USD') =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        Centro de Facturación
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión de suscripciones y cobros SaaS
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Factura
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            {resumen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Ingresos del Mes</p>
                                        <p className="text-2xl font-bold text-green-700">{formatMoney(resumen.ingresosMes)}</p>
                                        {resumen.ingresosMesAnterior > 0 && (
                                            <p className="text-xs text-green-600 flex items-center mt-1">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                {((resumen.ingresosMes - resumen.ingresosMesAnterior) / resumen.ingresosMesAnterior * 100).toFixed(0)}% vs mes anterior
                                            </p>
                                        )}
                                    </div>
                                    <DollarSign className="h-8 w-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">MRR</p>
                                        <p className="text-2xl font-bold text-blue-700">{formatMoney(resumen.mrrActual)}</p>
                                        <p className="text-xs text-blue-600">Monthly Recurring Revenue</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                                        <p className="text-2xl font-bold text-yellow-700">{resumen.facturasPendientes}</p>
                                        <p className="text-xs text-yellow-600">Facturas por cobrar</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className={cn(
                            "border-0",
                            resumen.facturasVencidas > 0
                                ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950"
                                : "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950"
                        )}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={cn("text-sm font-medium", resumen.facturasVencidas > 0 ? "text-red-600" : "text-emerald-600")}>
                                            Vencidas
                                        </p>
                                        <p className={cn("text-2xl font-bold", resumen.facturasVencidas > 0 ? "text-red-700" : "text-emerald-700")}>
                                            {resumen.facturasVencidas}
                                        </p>
                                        <p className={cn("text-xs", resumen.facturasVencidas > 0 ? "text-red-600" : "text-emerald-600")}>
                                            {resumen.facturasVencidas > 0 ? 'Requieren atención' : 'Todo al día'}
                                        </p>
                                    </div>
                                    <AlertTriangle className={cn("h-8 w-8", resumen.facturasVencidas > 0 ? "text-red-400" : "text-emerald-400")} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por número o empresa..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={estadoFilter || 'all'} onValueChange={v => setEstadoFilter(v === 'all' ? '' : v as FacturaEstado)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="pagada">Pagadas</SelectItem>
                        <SelectItem value="vencida">Vencidas</SelectItem>
                        <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Facturas
                        <Badge variant="secondary">{filteredFacturas.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                        Historial de facturación SaaS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredFacturas.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No hay facturas</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFacturas.map((factura) => (
                                    <TableRow key={factura.id}>
                                        <TableCell className="font-mono font-medium">
                                            {factura.numero}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {factura.empresa?.nombre_comercial || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {factura.periodo_inicio} - {factura.periodo_fin}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatMoney(factura.total, factura.moneda)}
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(factura.estado)}
                                        </TableCell>
                                        <TableCell className={cn(
                                            factura.estado === 'vencida' && 'text-red-600 font-medium'
                                        )}>
                                            {factura.fecha_vencimiento}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                {factura.estado === 'pendiente' && (
                                                    <Button size="sm" onClick={() => setPaymentDialog(factura)}>
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Pagar
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Pago</DialogTitle>
                        <DialogDescription>
                            Factura {paymentDialog?.numero} - {formatMoney(paymentDialog?.total || 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Método de Pago</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                                    <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="efectivo">Efectivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Referencia de Pago</Label>
                            <Input
                                placeholder="Número de operación, transacción, etc."
                                value={paymentRef}
                                onChange={e => setPaymentRef(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialog(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirmar Pago
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
