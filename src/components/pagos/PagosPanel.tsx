'use client'

import { useState, useTransition } from 'react'
import { Search, DollarSign, CheckCircle, RefreshCw, AlertCircle, Calendar, Package, User, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    buscarClientes,
    buscarContratosPorClienteId,
    renovarContratoAction,
    registrarPago,
    type ContratoParaPago,
    type ClienteBusqueda
} from '@/lib/actions/pagos-actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PagosPanelProps {
    cajaId: string
}

export function PagosPanel({ cajaId }: PagosPanelProps) {
    const [query, setQuery] = useState('')

    // State for the flow
    const [clientes, setClientes] = useState<ClienteBusqueda[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)
    const [contratos, setContratos] = useState<ContratoParaPago[]>([])
    const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoParaPago | null>(null)

    const [isPending, startTransition] = useTransition()
    const [procesando, setProcesando] = useState(false)

    const handleBuscar = () => {
        if (!query.trim()) return

        // Reset states
        setClientes([])
        setClienteSeleccionado(null)
        setContratos([])
        setContratoSeleccionado(null)

        startTransition(async () => {
            try {
                const resultados = await buscarClientes(query)

                if (resultados.length === 0) {
                    toast.info('No se encontraron clientes con contratos vigentes')
                } else if (resultados.length === 1) {
                    // Auto-select unique client
                    await seleccionarCliente(resultados[0])
                } else {
                    // Show client list
                    setClientes(resultados)
                }
            } catch (e) {
                toast.error('Error al buscar clientes')
            }
        })
    }

    const seleccionarCliente = async (cliente: ClienteBusqueda) => {
        setClienteSeleccionado(cliente)
        setContratos([]) // Clear previous contracts

        try {
            const resultados = await buscarContratosPorClienteId(cliente.id)
            setContratos(resultados)

            if (resultados.length === 0) {
                toast.info('Este cliente no tiene contratos vigentes')
            }
        } catch (e) {
            toast.error('Error al cargar contratos')
        }
    }

    const regresarAClientes = () => {
        setClienteSeleccionado(null)
        setContratos([])
        setContratoSeleccionado(null)
    }

    const regresarAContratos = () => {
        setContratoSeleccionado(null)
    }

    const handleRenovar = async () => {
        if (!contratoSeleccionado) return

        const montoAPagar = contratoSeleccionado.interes_acumulado + contratoSeleccionado.mora_pendiente

        if (!confirm(`¿Confirmar renovación? Se cobrará S/ ${montoAPagar.toFixed(2)} y el contrato se extiende por 1 mes.`)) return

        setProcesando(true)
        try {
            const result = await renovarContratoAction({
                creditoId: contratoSeleccionado.id,
                cajaId,
                montoPagado: montoAPagar
            })

            if (result.success) {
                toast.success(result.mensaje)
                // Refresh contracts for the current client
                if (clienteSeleccionado) {
                    await seleccionarCliente(clienteSeleccionado)
                }
                setContratoSeleccionado(null)
            } else {
                toast.error(result.error || 'Error al renovar')
            }
        } catch (e) {
            toast.error('Error inesperado')
        } finally {
            setProcesando(false)
        }
    }

    const handleDesempenar = async () => {
        if (!contratoSeleccionado) return

        const montoTotal = contratoSeleccionado.saldo_pendiente +
            contratoSeleccionado.interes_acumulado +
            contratoSeleccionado.mora_pendiente

        if (!confirm(`¿Confirmar desempeño total? Se cobrará S/ ${montoTotal.toFixed(2)} y se devolverá el bien al cliente.`)) return

        setProcesando(true)
        try {
            const result = await registrarPago({
                creditoId: contratoSeleccionado.id,
                tipoPago: 'desempeno',
                montoPagado: montoTotal,
                cajaOperativaId: cajaId
            })

            if (result.success) {
                toast.success('¡Desempeño completado! Recuerde entregar el bien al cliente.')
                // Refresh contracts
                if (clienteSeleccionado) {
                    await seleccionarCliente(clienteSeleccionado)
                }
                setContratoSeleccionado(null)
            } else {
                toast.error(result.error || 'Error al procesar desempeño')
            }
        } catch (e) {
            toast.error('Error inesperado')
        } finally {
            setProcesando(false)
        }
    }

    const formatFecha = (fecha: string) => {
        try {
            return format(new Date(fecha), "dd MMM yyyy", { locale: es })
        } catch {
            return fecha
        }
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Buscador */}
            <Card>
                <CardContent className="pt-4 lg:pt-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por DNI o nombre del cliente..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                                className="pl-10 h-11 lg:h-12 text-base"
                            />
                        </div>
                        <Button
                            onClick={handleBuscar}
                            disabled={isPending || !query.trim()}
                            className="h-11 lg:h-12 px-6"
                        >
                            {isPending ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Step 1: Client Selection List */}
            {!clienteSeleccionado && clientes.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Clientes Encontrados ({clientes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {clientes.map((cliente) => (
                            <div
                                key={cliente.id}
                                onClick={() => seleccionarCliente(cliente)}
                                className="flex items-center justify-between p-3 lg:p-4 rounded-lg border hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {cliente.nombre.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                                            {cliente.nombre}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            DNI: {cliente.documento}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary" className="hidden sm:flex">
                                        {cliente.contratosVigentes} contratos
                                    </Badge>
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Contracts List */}
            {clienteSeleccionado && !contratoSeleccionado && (
                <Card>
                    {/* Encabezado del cliente seleccionado */}
                    <CardHeader className="pb-3 bg-slate-50 border-b">
                        <div className="flex items-center gap-3">
                            {clientes.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={regresarAClientes} className="mr-[-10px]">
                                    <ChevronRight className="h-6 w-6 rotate-180 text-slate-400" />
                                </Button>
                            )}
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg lg:text-xl">
                                    {clienteSeleccionado.nombre}
                                </CardTitle>
                                <p className="text-sm text-slate-500">
                                    DNI: {clienteSeleccionado.documento}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Lista de contratos */}
                    <CardContent className="pt-4">
                        {contratos.length > 0 ? (
                            <>
                                <p className="text-sm text-slate-500 mb-3">
                                    {contratos.length} contrato{contratos.length > 1 ? 's' : ''} vigente{contratos.length > 1 ? 's' : ''}
                                </p>
                                <div className="space-y-2">
                                    {contratos.map((contrato) => (
                                        <div
                                            key={contrato.id}
                                            onClick={() => setContratoSeleccionado(contrato)}
                                            className="flex items-center justify-between p-3 lg:p-4 rounded-lg border-2 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                                        {contrato.codigo || 'SIN CÓDIGO'}
                                                    </span>
                                                    {contrato.dias_mora > 0 ? (
                                                        <Badge variant="destructive" className="text-xs">
                                                            {contrato.dias_mora}d mora
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                                            VIGENTE
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    <Package className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                                                    {contrato.garantia || 'Artículo en garantía'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    Vence: {formatFecha(contrato.fecha_vencimiento)}
                                                </p>
                                            </div>
                                            <div className="text-right pl-4 shrink-0">
                                                <p className="font-bold text-xl text-slate-800">
                                                    S/ {contrato.saldo_pendiente.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-slate-500">capital</p>
                                                <p className="text-xs text-amber-600 font-medium">
                                                    +S/ {contrato.interes_acumulado.toFixed(2)} int.
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>Este cliente no tiene créditos activos para pagar.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Contract Detail */}
            {contratoSeleccionado && clienteSeleccionado && (
                <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-blue-50/50 pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={regresarAContratos} className="mr-0">
                                    <ChevronRight className="h-6 w-6 rotate-180 text-slate-400" />
                                </Button>
                                <CardTitle className="text-lg lg:text-xl">
                                    <span className="font-mono">{contratoSeleccionado.codigo}</span>
                                </CardTitle>
                            </div>

                            {contratoSeleccionado.dias_mora > 0 ? (
                                <Badge variant="destructive" className="text-sm">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {contratoSeleccionado.dias_mora} días de mora
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-100 text-emerald-800 text-sm">
                                    VIGENTE
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {/* Info del cliente */}
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="font-semibold">{clienteSeleccionado.nombre}</p>
                                <p className="text-sm text-slate-500">DNI: {clienteSeleccionado.documento}</p>
                            </div>
                        </div>

                        {/* Info de la garantía */}
                        <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="font-medium">{contratoSeleccionado.garantia}</p>
                            </div>
                        </div>

                        {/* Info de vencimiento */}
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="font-medium">Vence: {formatFecha(contratoSeleccionado.fecha_vencimiento)}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Montos */}
                        <div className="grid grid-cols-2 gap-3 lg:gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500">Capital</p>
                                <p className="text-lg font-bold">S/ {contratoSeleccionado.saldo_pendiente.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500">Interés</p>
                                <p className="text-lg font-bold">S/ {contratoSeleccionado.interes_acumulado.toFixed(2)}</p>
                            </div>
                            {contratoSeleccionado.mora_pendiente > 0 && (
                                <div className="p-3 bg-red-50 rounded-lg col-span-2">
                                    <p className="text-xs text-red-600">Mora</p>
                                    <p className="text-lg font-bold text-red-600">S/ {contratoSeleccionado.mora_pendiente.toFixed(2)}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Botones de acción */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                onClick={handleRenovar}
                                disabled={procesando}
                                className="h-16 lg:h-20 flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <RefreshCw className="h-5 w-5 lg:h-6 lg:w-6" />
                                <span className="font-bold text-sm lg:text-base">RENOVAR</span>
                                <span className="text-[10px] lg:text-xs opacity-90">
                                    Pagar S/ {(contratoSeleccionado.interes_acumulado + contratoSeleccionado.mora_pendiente).toFixed(2)}
                                </span>
                            </Button>
                            <Button
                                onClick={handleDesempenar}
                                disabled={procesando}
                                className="h-16 lg:h-20 flex-col gap-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                                <span className="font-bold text-sm lg:text-base">DESEMPEÑAR</span>
                                <span className="text-[10px] lg:text-xs opacity-90">
                                    Pagar S/ {(contratoSeleccionado.saldo_pendiente + contratoSeleccionado.interes_acumulado + contratoSeleccionado.mora_pendiente).toFixed(2)}
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Estado vacío (no clients found) */}
            {clientes.length === 0 && !isPending && query && !clienteSeleccionado && (
                <Card className="border-dashed">
                    <CardContent className="py-8 lg:py-12 text-center text-slate-500">
                        <Search className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base lg:text-lg">No se encontraron clientes</p>
                        <p className="text-sm">Intente con otro DNI o nombre</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
