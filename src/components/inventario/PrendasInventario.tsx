"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Package, Search, DollarSign, Calendar, Tag, Store } from 'lucide-react'

interface PrendaInventario {
    id: string
    creditoId: string
    codigoCredito: string
    descripcion: string
    categoria?: string
    valorTasacion: number
    montoDeuda: number
    fechaVencimiento: string
    diasMora: number
    clienteNombre: string
    fotos?: string[]
}

interface PrendasInventarioProps {
    prendas: PrendaInventario[]
    onVender?: (prenda: PrendaInventario) => void
}

export function PrendasInventario({ prendas, onVender }: PrendasInventarioProps) {
    const [busqueda, setBusqueda] = useState('')
    const [ordenar, setOrdenar] = useState<'mora' | 'valor'>('mora')

    const prendasFiltradas = useMemo(() => {
        const result = prendas.filter(p =>
            p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigoCredito.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
        )

        // Ordenar
        if (ordenar === 'mora') {
            result.sort((a, b) => b.diasMora - a.diasMora)
        } else {
            result.sort((a, b) => b.valorTasacion - a.valorTasacion)
        }

        return result
    }, [prendas, busqueda, ordenar])

    // Estadísticas
    const totalPrendas = prendas.length
    const valorTotal = prendas.reduce((sum, p) => sum + p.valorTasacion, 0)
    const deudaTotal = prendas.reduce((sum, p) => sum + p.montoDeuda, 0)
    const listoParaVenta = prendas.filter(p => p.diasMora >= 7).length

    return (
        <div className="space-y-4">
            {/* Header con Búsqueda */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-amber-600" />
                        Inventario de Prendas No Reclamadas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Búsqueda y Filtros */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por descripción, código o cliente..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant={ordenar === 'mora' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOrdenar('mora')}
                        >
                            Por Mora
                        </Button>
                        <Button
                            variant={ordenar === 'valor' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOrdenar('valor')}
                        >
                            Por Valor
                        </Button>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <Package className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                            <p className="text-2xl font-bold text-slate-700">{totalPrendas}</p>
                            <p className="text-xs text-slate-500">Total Prendas</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                            <p className="text-2xl font-bold text-amber-700">S/ {valorTotal.toFixed(0)}</p>
                            <p className="text-xs text-amber-600">Valor Tasación</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-center">
                            <Calendar className="h-5 w-5 mx-auto mb-1 text-red-600" />
                            <p className="text-2xl font-bold text-red-700">S/ {deudaTotal.toFixed(0)}</p>
                            <p className="text-xs text-red-600">Deuda</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg text-center">
                            <Store className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                            <p className="text-2xl font-bold text-emerald-700">{listoParaVenta}</p>
                            <p className="text-xs text-emerald-600">Listo para Venta</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Prendas */}
            <Card>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                        <div className="divide-y">
                            {prendasFiltradas.map(prenda => (
                                <div key={prenda.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-4">
                                        {/* Imagen */}
                                        <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            {prenda.fotos && prenda.fotos[0] ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={prenda.fotos[0]} alt={prenda.descripcion} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="h-8 w-8 text-slate-400" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="font-medium text-sm">{prenda.descripcion}</p>
                                                    <p className="text-xs text-slate-500">
                                                        #{prenda.codigoCredito} • {prenda.clienteNombre}
                                                    </p>
                                                </div>
                                                <Badge className={prenda.diasMora >= 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                                                    {prenda.diasMora >= 7 ? '✓ Listo para venta' : `${prenda.diasMora} días mora`}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex gap-4 text-sm">
                                                    <span className="text-slate-600">
                                                        <Tag className="inline h-3 w-3 mr-1" />
                                                        Tasación: <strong>S/ {prenda.valorTasacion.toFixed(2)}</strong>
                                                    </span>
                                                    <span className="text-red-600">
                                                        Deuda: <strong>S/ {prenda.montoDeuda.toFixed(2)}</strong>
                                                    </span>
                                                </div>

                                                {onVender && prenda.diasMora >= 7 && (
                                                    <Button size="sm" variant="outline" onClick={() => onVender(prenda)}>
                                                        Registrar Venta
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {prendasFiltradas.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>{busqueda ? 'No se encontraron prendas' : 'No hay prendas en inventario'}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
