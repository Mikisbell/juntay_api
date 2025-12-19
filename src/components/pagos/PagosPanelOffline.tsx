

/**
 * Panel de Pagos "Financial Cockpit" V3
 * 
 * V3.0: Diseño High-Density, 3 Columnas, Light Mode
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRxDB, useCreditosLocales, useRegistrarPagoLocal } from '@/lib/rxdb/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, User, CheckCircle2, ChevronRight, AlertCircle, Clock, AlertTriangle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { formatearNumero } from '@/lib/utils/decimal'
import { buscarClientes, type ClienteBusqueda, buscarContratosPorClienteId, type ContratoParaPago } from '@/lib/actions/pagos-actions'
import { obtenerVencimientosAgrupados, type ContratoVencimiento } from '@/lib/actions/vencimientos-actions'
import { enviarRecordatorioCliente } from '@/lib/actions/whatsapp-actions'
import { motion } from 'framer-motion'
import { TransactionBuilder } from './cockpit/TransactionBuilder'
import { TrustScore } from './cockpit/TrustScore'
import { imprimirVoucherPago } from '@/components/printing/documents'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'

interface PagosPanelOfflineProps {
    cajaId: string
    usuarioId: string
}

export function PagosPanelOffline({ cajaId, usuarioId }: PagosPanelOfflineProps) {
    const { isReady, isOnline, forceSync: _forceSync, isSyncing: _isSyncing } = useRxDB()
    const { registrarPago } = useRegistrarPagoLocal()

    // State
    const [busqueda, setBusqueda] = useState('')
    const [_isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<ClienteBusqueda[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteBusqueda | null>(null)

    // Multi-select for "Shopping Cart" logic
    const [selectedCreditoIds, setSelectedCreditoIds] = useState<Set<string>>(new Set())

    // [New State] Transaction Success Handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastTransaction, setLastTransaction] = useState<any>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [_isProcessing, setIsProcessing] = useState(false)

    // Data Loading
    const [creditosServer, setCreditosServer] = useState<ContratoParaPago[]>([])
    const [_loadingServer, setLoadingServer] = useState(false)
    const { creditos: creditosLocales } = useCreditosLocales(clienteSeleccionado?.id)

    // Vencimientos data for sidebar
    const [vencimientosHoy, setVencimientosHoy] = useState<ContratoVencimiento[]>([])
    const [vencimientosSemana, setVencimientosSemana] = useState<ContratoVencimiento[]>([])
    const [loadingVencimientos, setLoadingVencimientos] = useState(true)
    const [enviandoRecordatorio, setEnviandoRecordatorio] = useState<string | null>(null)

    // Derived Credits List
    const creditosDisponibles = useMemo(() => {
        if (isOnline && creditosServer.length > 0) {
            return creditosServer.map(c => ({
                id: c.id,
                codigo: c.codigo,
                fecha_vencimiento: c.fecha_vencimiento,
                saldo_pendiente: String(c.saldo_pendiente || 0),
                monto_prestado: String(c.monto_prestado || 0),
                estado: c.dias_mora > 0 ? 'vencido' : 'vigente',
                interes_devengado_actual: String(c.interes_acumulado || 0),
                dias_mora: c.dias_mora,
                // NUEVO: Campos para cálculo de interés flexible
                created_at: c.created_at,
                tasa_interes: c.tasa_interes || 20
            }))
        }
        return creditosLocales.map(c => ({
            ...c,
            codigo: c.codigo_credito,
            dias_mora: 0,
            // NUEVO: Campos para cálculo de interés flexible
            created_at: c.created_at,
            tasa_interes: c.tasa_interes || 20
        }))
    }, [isOnline, creditosServer, creditosLocales])

    // Fetch Server Data
    useEffect(() => {
        if (isOnline && clienteSeleccionado?.id) {
            setLoadingServer(true)
            buscarContratosPorClienteId(clienteSeleccionado.id)
                .then(setCreditosServer)
                .catch(err => console.error(err))
                .finally(() => setLoadingServer(false))
        }
    }, [isOnline, clienteSeleccionado?.id])

    // Fetch Vencimientos for sidebar
    useEffect(() => {
        if (isOnline) {
            setLoadingVencimientos(true)
            obtenerVencimientosAgrupados()
                .then(data => {
                    setVencimientosHoy(data.hoy)
                    setVencimientosSemana(data.semana)
                })
                .catch(err => console.error('Error fetching vencimientos:', err))
                .finally(() => setLoadingVencimientos(false))
        }
    }, [isOnline])

    // Handler for sending WhatsApp reminder
    const handleEnviarRecordatorio = async (v: ContratoVencimiento) => {
        if (!v.telefono) {
            toast.error('Cliente sin teléfono registrado')
            return
        }
        setEnviandoRecordatorio(v.id)
        try {
            const result = await enviarRecordatorioCliente(
                v.telefono,
                v.cliente,
                v.codigo,
                v.diasRestantes,
                v.saldo
            )
            if (result.success) {
                toast.success('Recordatorio enviado por WhatsApp')
            } else {
                toast.error(result.error || 'Error enviando recordatorio')
            }
        } catch (err) {
            console.error('[PagosPanelOffline] Error sending reminder:', err)
            toast.error('Error de conexión')
        } finally {
            setEnviandoRecordatorio(null)
        }
    }

    // Handlers
    const handleSearch = async () => {
        if (!busqueda.trim()) return
        setIsSearching(true)
        try {
            if (isOnline) {
                const res = await buscarClientes(busqueda)
                setSearchResults(res)
            } else {
                toast.warning("Búsqueda solo disponible Online por ahora")
            }
        } catch (_e) {
            toast.error("Error buscando cliente")
        } finally {
            setIsSearching(false)
        }
    }

    const toggleCreditoSelection = (id: string) => {
        const newSet = new Set(selectedCreditoIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedCreditoIds(newSet)
    }

    // [Modified Handler]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleProcessPayment = async (data: any) => {
        // console.log('[PagosPanelOffline] handleProcessPayment CALLED with:', data)
        // console.log('[PagosPanelOffline] cajaId:', cajaId, 'usuarioId:', usuarioId)

        const { intent, amount, contracts, metadata } = data
        // console.log('[PagosPanelOffline] Parsed - intent:', intent, 'amount:', amount, 'contracts:', contracts)

        if (!contracts || contracts.length === 0) {
            console.error('[PagosPanelOffline] No contracts provided!')
            toast.error('No hay contratos seleccionados')
            return
        }

        setIsProcessing(true) // Assuming local loading state

        try {
            const processedItems = []
            let totalProcessed = 0

            // Sequential processing (simulated consolidation)
            for (const creditoId of contracts) {
                const contractData = creditosDisponibles.find(c => c.id === creditoId)
                const montoIndividual = parseFloat(amount) / contracts.length // Simplified split

                // Actual DB Call - CHECK RESULT
                const result = await registrarPago({
                    credito_id: creditoId,
                    monto: montoIndividual,
                    tipo: intent === 'RENOVAR' ? 'renovacion' : intent === 'LIQUIDAR' ? 'desempeno' : 'capital', // Maps: RENOVAR→renovacion, AMORTIZAR→capital, LIQUIDAR→desempeno
                    metodo_pago: 'efectivo',
                    caja_operativa_id: cajaId,
                    usuario_id: usuarioId,
                    observaciones: metadata?.condonarInteres ? 'Renovación con condonación de deuda' : undefined,
                    // Pass specific flag for hook logic
                    condonarInteres: metadata?.condonarInteres
                })

                // Check if registration failed
                if (!result.success) {
                    throw new Error(result.error || 'Error al registrar pago')
                }

                console.log('[PagosPanelOffline] Pago registrado:', result)

                processedItems.push({
                    id: creditoId,
                    codigo: contractData?.codigo || '???',
                    concepto: intent,
                    monto: montoIndividual.toString(),
                    saldoAnterior: contractData?.saldo_pendiente || 0,
                    nuevoSaldo: intent === 'LIQUIDAR' ? 0 : (intent === 'RENOVAR' ? parseFloat(contractData?.saldo_pendiente || '0') : parseFloat(contractData?.saldo_pendiente || '0') - montoIndividual)
                })
                totalProcessed += montoIndividual
            }

            // Prepare Data for Receipt
            setLastTransaction({
                clienteNombre: clienteSeleccionado?.nombre || 'Cliente',
                clienteDocumento: clienteSeleccionado?.documento,
                fecha: new Date(),
                items: processedItems,
                totalPagado: totalProcessed,
                cajaId
            })

            // Show Success
            toast.success('Transacción completada exitosamente')
            setShowSuccessModal(true)

            // Refresh Data
            if (clienteSeleccionado?.id) {
                buscarContratosPorClienteId(clienteSeleccionado.id).then(setCreditosServer)
            }
            setSelectedCreditoIds(new Set())

        } catch (error) {
            console.error(error)
            toast.error('Error al procesar el pago')
        } finally {
            setIsProcessing(false)
        }
    }

    // Prepare objects for builder
    const selectedContractsObjects = useMemo(() => {
        return creditosDisponibles.filter(c => selectedCreditoIds.has(c.id))
    }, [creditosDisponibles, selectedCreditoIds]) // Fixed dependency

    // Empty State Global
    if (!isReady) return <div className="p-10 flex justify-center"><RefreshCw className="animate-spin" /></div>

    return (
        <div className="h-[calc(100vh-80px)] w-full bg-slate-50 text-slate-700 overflow-hidden flex flex-col md:flex-row border rounded-none md:rounded-xl shadow-xl border-slate-200">

            {/* COLUMN 1: SIDEBAR / HISTORIAL */}
            <div className="w-full md:w-72 lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Cola / Historial</h3>
                    <div className="relative">
                        <Input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Buscar cliente..."
                            className="bg-white border-slate-200 text-slate-700 pl-9 focus:ring-indigo-500 h-10"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
                    {/* Search Results - show first if there are results */}
                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase px-1">Resultados de Búsqueda</h4>
                            {searchResults.map(cliente => (
                                <div
                                    key={cliente.id}
                                    onClick={() => {
                                        setClienteSeleccionado(cliente)
                                        setSelectedCreditoIds(new Set())
                                    }}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${clienteSeleccionado?.id === cliente.id
                                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                                        : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-sm text-slate-800">{cliente.nombre}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{cliente.documento}</div>
                                        </div>
                                        {cliente.contratosVigentes > 0 && (
                                            <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">
                                                {cliente.contratosVigentes}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vencen HOY - Urgent */}
                    {vencimientosHoy.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-red-500 uppercase px-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Vencen HOY ({vencimientosHoy.length})
                            </h4>
                            {vencimientosHoy.slice(0, 5).map(v => (
                                <div key={v.id} className="p-2 rounded-lg bg-red-50 border border-red-200 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-800 truncate">{v.cliente}</div>
                                            <div className="text-xs text-slate-500 font-mono">{v.codigo}</div>
                                            <div className="text-xs font-bold text-red-600 mt-1">S/ {formatearNumero(v.saldo)}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                                            onClick={() => handleEnviarRecordatorio(v)}
                                            disabled={enviandoRecordatorio === v.id || !v.telefono}
                                            title={v.telefono ? 'Enviar recordatorio WhatsApp' : 'Sin teléfono'}
                                        >
                                            {enviandoRecordatorio === v.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vencen Esta Semana */}
                    {vencimientosSemana.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-amber-600 uppercase px-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Esta Semana ({vencimientosSemana.length})
                            </h4>
                            {vencimientosSemana.slice(0, 5).map(v => (
                                <div key={v.id} className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-800 truncate">{v.cliente}</div>
                                            <div className="text-xs text-slate-500">{v.diasRestantes} días - S/ {formatearNumero(v.saldo)}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                                            onClick={() => handleEnviarRecordatorio(v)}
                                            disabled={enviandoRecordatorio === v.id || !v.telefono}
                                            title={v.telefono ? 'Enviar recordatorio WhatsApp' : 'Sin teléfono'}
                                        >
                                            {enviandoRecordatorio === v.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading State */}
                    {loadingVencimientos && (
                        <div className="text-center py-6">
                            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-400" />
                            <p className="text-xs text-slate-400">Cargando vencimientos...</p>
                        </div>
                    )}

                    {/* Empty State - only show if no data at all */}
                    {!loadingVencimientos && searchResults.length === 0 && vencimientosHoy.length === 0 && vencimientosSemana.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <User className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                            <p className="text-xs text-slate-500">Sin vencimientos próximos</p>
                            <p className="text-[10px] text-slate-400 mt-1">Busca un cliente para comenzar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMN 2: COCKPIT (Main Area) */}
            <div className="flex-1 bg-white flex flex-col min-w-0">
                {clienteSeleccionado ? (
                    <>
                        {/* Cockpit Header */}
                        <div className="h-48 border-b border-slate-200 p-6 flex justify-between items-end bg-gradient-to-br from-blue-50/50 to-indigo-50/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000" />

                            <div className="relative z-10 flex gap-6 items-center">
                                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                                    {clienteSeleccionado.nombre.charAt(0)}
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{clienteSeleccionado.nombre}</h1>
                                    <div className="flex items-center gap-3 mt-1 text-slate-500 font-mono text-sm">
                                        <span>ID: {clienteSeleccionado.documento}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                        <span className="text-emerald-400">Nivel Premium</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 hidden lg:block">
                                <TrustScore score={85} level="VIP" />
                            </div>
                        </div>

                        {/* Contracts Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contratos Activos</h3>
                                <div className="text-xs text-slate-600 font-mono">Presiona [Espacio] para seleccionar</div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                    <div className="col-span-1 text-center">Sel</div>
                                    <div className="col-span-2">Código</div>
                                    <div className="col-span-1">Estado</div>
                                    <div className="col-span-2 text-right">Monto Orig.</div>
                                    <div className="col-span-2 text-right">Saldo</div>
                                    <div className="col-span-2">Próximo Pago</div>
                                    <div className="col-span-2 text-center">Acción</div>
                                </div>

                                {/* Rows */}
                                {creditosDisponibles.map(credito => {
                                    const isSelected = selectedCreditoIds.has(credito.id)
                                    return (
                                        <motion.div
                                            key={credito.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => toggleCreditoSelection(credito.id)}
                                            className={`grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg border cursor-pointer transition-all group font-mono text-sm
                                                ${isSelected
                                                    ? 'bg-blue-50 border-blue-300 shadow-md ring-1 ring-blue-200'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="col-span-1 flex justify-center">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                    {isSelected && <CheckCircle2 size={12} />}
                                                </div>
                                            </div>
                                            <div className="col-span-2 font-bold text-slate-800 relative">
                                                {credito.codigo}
                                                {isSelected && <span className="absolute -left-2 w-1 h-4 bg-blue-500 rounded-full top-1" />}
                                            </div>
                                            <div className="col-span-1">
                                                <Badge variant="outline" className={`text-[10px] h-5 border-0 px-1.5 ${credito.estado === 'vigente'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {credito.estado}
                                                </Badge>
                                            </div>
                                            <div className="col-span-2 text-right text-slate-500">
                                                {formatearNumero(credito.monto_prestado)}
                                            </div>
                                            <div className="col-span-2 text-right font-bold text-slate-700">
                                                {formatearNumero(credito.saldo_pendiente)}
                                            </div>
                                            <div className="col-span-2 text-slate-500 text-xs">
                                                {new Date(credito.fecha_vencimiento).toLocaleDateString()}
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <ChevronRight size={16} className={`text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-blue-500' : ''}`} />
                                            </div>
                                        </motion.div>
                                    )
                                })}

                                {creditosDisponibles.length === 0 && (
                                    <div className="py-20 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No hay contratos activos para mostrar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 animate-pulse">
                            <Search className="w-10 h-10 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700">Cabina Financiera Inactiva</h2>
                        <p className="max-w-xs text-center mt-2 text-slate-500">Busca un cliente en el panel lateral para activar los controles.</p>
                    </div>
                )}
            </div>

            {/* COLUMN 3: TRANSACTION BUILDER */}
            <div className="w-full md:w-80 lg:w-96 border-l border-slate-200 bg-white shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-20">
                <TransactionBuilder
                    selectedContracts={selectedContractsObjects}
                    onProcessPayment={handleProcessPayment}
                />
            </div>

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold text-slate-800">¡Pago Exitoso!</DialogTitle>
                        <DialogDescription className="text-center text-slate-500">
                            La transacción ha sido registrada correctamente en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="text-center space-y-2 py-4">
                        <p className="text-slate-500">Se ha registrado el pago correctamente.</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                            <div className="flex justify-between text-sm font-medium text-slate-700">
                                <span>Total Pagado:</span>
                                <span className="font-mono text-emerald-600 font-bold text-lg">
                                    {lastTransaction ? formatearNumero(lastTransaction.totalPagado) : '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button
                            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                            onClick={() => imprimirVoucherPago(lastTransaction)}
                        >
                            <RefreshCw className="mr-2 h-5 w-5" /> IMPRIMIR VOUCHER [P]
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 font-normal"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Cerrar y Continuar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

