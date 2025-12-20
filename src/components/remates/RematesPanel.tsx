'use client'

import { useEffect, useState } from 'react'
import {
    Gavel,
    DollarSign,
    TrendingUp,
    Package,
    ShoppingCart,
    RefreshCw,
    Tag
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
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    obtenerArticulosRemate,
    obtenerResumenRemates,
    registrarVentaRemate,
    type ArticuloRemate,
    type ResumenRemates
} from '@/lib/actions/remates-module-actions'
import { cn } from '@/lib/utils'

interface RematesPanelProps {
    vendedorId: string
}

/**
 * Panel Principal de Remates
 */
export function RematesPanel({ vendedorId }: RematesPanelProps) {
    const [articulos, setArticulos] = useState<ArticuloRemate[]>([])
    const [resumen, setResumen] = useState<ResumenRemates | null>(null)
    const [loading, setLoading] = useState(true)
    const [articuloActivo, setArticuloActivo] = useState<ArticuloRemate | null>(null)
    const [vendiendo, setVendiendo] = useState(false)
    const [formVenta, setFormVenta] = useState({
        precio: '',
        comprador: '',
        telefono: '',
        metodoPago: 'efectivo'
    })

    const cargar = async () => {
        setLoading(true)
        try {
            const [arts, res] = await Promise.all([
                obtenerArticulosRemate({ estado: 'disponible' }),
                obtenerResumenRemates()
            ])
            setArticulos(arts)
            setResumen(res)
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error cargando remates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
    }, [])

    const handleVender = async () => {
        if (!articuloActivo || !formVenta.precio) {
            toast.error('Ingresa el precio de venta')
            return
        }

        setVendiendo(true)
        try {
            const result = await registrarVentaRemate({
                articuloId: articuloActivo.id,
                precioVenta: parseFloat(formVenta.precio),
                comprador: formVenta.comprador || undefined,
                compradorTelefono: formVenta.telefono || undefined,
                metodoPago: formVenta.metodoPago,
                vendedorId
            })

            if (result.success) {
                toast.success('¡Venta registrada!', {
                    description: `Utilidad: ${formatMoney(result.utilidad || 0)}`
                })
                setArticuloActivo(null)
                setFormVenta({ precio: '', comprador: '', telefono: '', metodoPago: 'efectivo' })
                cargar()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error registrando venta')
        } finally {
            setVendiendo(false)
        }
    }

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

    const getEstadoBadge = (estado: ArticuloRemate['estado']) => {
        switch (estado) {
            case 'vendido':
                return <Badge className="bg-green-500">Vendido</Badge>
            case 'reservado':
                return <Badge className="bg-yellow-500">Reservado</Badge>
            case 'retirado':
                return <Badge className="bg-gray-500">Retirado</Badge>
            default:
                return <Badge className="bg-blue-500">Disponible</Badge>
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
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
                        <Gavel className="h-6 w-6" />
                        Remates
                    </h2>
                    <p className="text-muted-foreground">
                        {articulos.length} artículo{articulos.length !== 1 ? 's' : ''} disponible{articulos.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button variant="outline" onClick={cargar}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Resumen */}
            {resumen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50">
                        <CardContent className="p-4 text-center">
                            <Package className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-blue-700">
                                {resumen.totalDisponibles}
                            </div>
                            <div className="text-sm text-blue-600">Disponibles</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                        <CardContent className="p-4 text-center">
                            <Tag className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                            <div className="text-2xl font-bold text-purple-700">
                                {formatMoney(resumen.valorTotalInventario)}
                            </div>
                            <div className="text-sm text-purple-600">Valor Inventario</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                        <CardContent className="p-4 text-center">
                            <ShoppingCart className="h-6 w-6 mx-auto text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-700">
                                {formatMoney(resumen.ventasDelMes)}
                            </div>
                            <div className="text-sm text-green-600">Ventas del Mes</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50">
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                            <div className={cn(
                                'text-2xl font-bold',
                                resumen.utilidadDelMes >= 0 ? 'text-green-700' : 'text-red-700'
                            )}>
                                {formatMoney(resumen.utilidadDelMes)}
                            </div>
                            <div className="text-sm text-amber-600">Utilidad del Mes</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Catálogo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articulos.map((art) => (
                    <Card key={art.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base truncate pr-2">
                                    {art.descripcion}
                                </CardTitle>
                                {getEstadoBadge(art.estado)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Categoría:</span>
                                <span className="capitalize">{art.categoria}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Días en remate:</span>
                                <span>{art.diasEnRemate}</span>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-muted-foreground">Precio mínimo:</span>
                                    <span className="font-bold text-red-600">{formatMoney(art.precioMinimo)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Sugerido:</span>
                                    <span className="font-bold text-green-600">{formatMoney(art.precioSugerido)}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => {
                                    setArticuloActivo(art)
                                    setFormVenta({ ...formVenta, precio: art.precioSugerido.toString() })
                                }}
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Vender
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {articulos.length === 0 && (
                <Card className="p-8 text-center">
                    <Gavel className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No hay artículos disponibles para remate</p>
                </Card>
            )}

            {/* Dialog de Venta */}
            <Dialog open={!!articuloActivo} onOpenChange={(open) => !open && setArticuloActivo(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Registrar Venta
                        </DialogTitle>
                    </DialogHeader>

                    {articuloActivo && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="font-medium">{articuloActivo.descripcion}</div>
                                <div className="text-sm text-muted-foreground">
                                    Mínimo: {formatMoney(articuloActivo.precioMinimo)} •
                                    Sugerido: {formatMoney(articuloActivo.precioSugerido)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Precio de Venta *</Label>
                                <Input
                                    type="number"
                                    value={formVenta.precio}
                                    onChange={(e) => setFormVenta({ ...formVenta, precio: e.target.value })}
                                    placeholder="S/"
                                />
                                {formVenta.precio && parseFloat(formVenta.precio) < articuloActivo.precioMinimo && (
                                    <p className="text-xs text-red-600">⚠️ Por debajo del precio mínimo</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Comprador</Label>
                                    <Input
                                        value={formVenta.comprador}
                                        onChange={(e) => setFormVenta({ ...formVenta, comprador: e.target.value })}
                                        placeholder="Nombre (opcional)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={formVenta.telefono}
                                        onChange={(e) => setFormVenta({ ...formVenta, telefono: e.target.value })}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
                                <Select
                                    value={formVenta.metodoPago}
                                    onValueChange={(v) => setFormVenta({ ...formVenta, metodoPago: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="yape">Yape</SelectItem>
                                        <SelectItem value="plin">Plin</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formVenta.precio && (
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-sm text-green-600">Utilidad estimada</div>
                                    <div className="text-xl font-bold text-green-700">
                                        {formatMoney(parseFloat(formVenta.precio) - articuloActivo.valorOriginal)}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleVender}
                                disabled={vendiendo || !formVenta.precio}
                                className="w-full"
                            >
                                {vendiendo ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <DollarSign className="h-4 w-4 mr-2" />
                                )}
                                Registrar Venta
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
