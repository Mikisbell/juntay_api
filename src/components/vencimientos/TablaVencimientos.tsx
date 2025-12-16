'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Phone, Search, Eye, AlertCircle, Clock, Calendar as CalendarIcon, Gift } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { GestionMoraSheet } from '@/components/creditos/GestionMoraSheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ContratoVencimiento } from './types/contrato'
import { useWhatsAppModal } from './hooks/useWhatsAppModal'
import { WhatsAppModal } from './modals/WhatsAppModal'

type FilterType = 'todos' | 'hoy' | 'semana' | 'mes'

// Tipo extendido para tabla (incluye DNI)
type ContratoTabla = ContratoVencimiento & { dni: string }

export function TablaVencimientos({ contratos }: { contratos: ContratoTabla[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filtroActivo, setFiltroActivo] = useState<FilterType>('todos')
    const [sortColumn, setSortColumn] = useState<'diasRestantes' | 'monto' | 'cliente'>('diasRestantes')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoTabla | null>(null)

    // Filtrar y ordenar contratos
    const contratosFiltrados = useMemo(() => {
        let filtered = contratos

        if (filtroActivo === 'hoy') {
            filtered = filtered.filter(c => c.diasRestantes === 0)
        } else if (filtroActivo === 'semana') {
            filtered = filtered.filter(c => c.diasRestantes > 0 && c.diasRestantes <= 7)
        } else if (filtroActivo === 'mes') {
            filtered = filtered.filter(c => c.diasRestantes <= 30)
        }

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.dni.includes(searchTerm) ||
                c.telefono.includes(searchTerm)
            )
        }

        filtered.sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1
            if (sortColumn === 'diasRestantes') {
                return (a.diasRestantes - b.diasRestantes) * multiplier
            } else if (sortColumn === 'monto') {
                return (a.monto - b.monto) * multiplier
            } else {
                return a.cliente.localeCompare(b.cliente) * multiplier
            }
        })

        return filtered
    }, [contratos, filtroActivo, searchTerm, sortColumn, sortDirection])

    const handleSort = (column: typeof sortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const getUrgenciaColor = (dias: number) => {
        if (dias === 0) return 'destructive'
        if (dias <= 3) return 'default'
        if (dias <= 7) return 'secondary'
        return 'outline'
    }

    const getUrgenciaIcon = (dias: number) => {
        if (dias === 0) return <AlertCircle className="h-4 w-4 text-red-600" />
        if (dias <= 7) return <Clock className="h-4 w-4 text-yellow-600" />
        return <CalendarIcon className="h-4 w-4 text-blue-600" />
    }

    return (
        <div className="space-y-4">
            {/* Barra de herramientas */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código, cliente o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filtroActivo === 'todos' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFiltroActivo('todos')}
                    >
                        Todos ({contratos.length})
                    </Button>
                    <Button
                        variant={filtroActivo === 'hoy' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => setFiltroActivo('hoy')}
                        className={filtroActivo === 'hoy' ? '' : 'border-red-300 text-red-700 hover:bg-red-50'}
                    >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Hoy ({contratos.filter(c => c.diasRestantes === 0).length})
                    </Button>
                    <Button
                        variant={filtroActivo === 'semana' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFiltroActivo('semana')}
                        className={filtroActivo === 'semana' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'}
                    >
                        <Clock className="h-4 w-4 mr-1" />
                        Semana ({contratos.filter(c => c.diasRestantes > 0 && c.diasRestantes <= 7).length})
                    </Button>
                    <Button
                        variant={filtroActivo === 'mes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFiltroActivo('mes')}
                        className={filtroActivo === 'mes' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
                    >
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Mes ({contratos.filter(c => c.diasRestantes <= 30).length})
                    </Button>
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-16">Estado</TableHead>
                            <TableHead>DNI</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('cliente')}
                            >
                                Cliente {sortColumn === 'cliente' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Vencimiento</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('diasRestantes')}
                            >
                                Días {sortColumn === 'diasRestantes' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 text-right"
                                onClick={() => handleSort('monto')}
                            >
                                Monto {sortColumn === 'monto' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contratosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    No se encontraron contratos
                                </TableCell>
                            </TableRow>
                        ) : (
                            contratosFiltrados.map((contrato) => (
                                <TableRow key={contrato.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>{getUrgenciaIcon(contrato.diasRestantes)}</TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm font-medium text-slate-600">
                                            {contrato.dni}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{contrato.cliente}</TableCell>
                                    <TableCell className="text-muted-foreground">{contrato.telefono}</TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getUrgenciaColor(contrato.diasRestantes)}>
                                            {contrato.diasRestantes === 0 ? 'HOY' : `${contrato.diasRestantes}d`}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        S/. {contrato.monto.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <FilaAcciones
                                            contrato={contrato}
                                            onWhatsAppClick={() => setContratoSeleccionado(contrato)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground">
                Mostrando {contratosFiltrados.length} de {contratos.length} contratos
            </div>

            {/* Modal WhatsApp */}
            {contratoSeleccionado && (
                <WhatsAppModalWrapper
                    contrato={contratoSeleccionado}
                    onClose={() => setContratoSeleccionado(null)}
                />
            )}
        </div>
    )
}

// Componente separado para acciones de fila
function FilaAcciones({
    contrato,
    onWhatsAppClick
}: {
    contrato: ContratoTabla
    onWhatsAppClick: () => void
}) {
    return (
        <div className="flex justify-end gap-1">
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => window.location.href = `tel:${contrato.telefono.replace(/\D/g, '')}`}
                title="Llamar"
            >
                <Phone className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-[#25D366] hover:text-[#128C7E] hover:bg-green-50"
                onClick={onWhatsAppClick}
                title="WhatsApp"
            >
                <FaWhatsapp className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => window.location.href = `/dashboard/contratos/${contrato.id}`}
                title="Ver Detalle"
            >
                <Eye className="h-4 w-4" />
            </Button>
            {contrato.diasRestantes < 0 && (
                <GestionMoraSheet
                    creditoId={contrato.id}
                    codigoCredito={contrato.codigo}
                    clienteNombre={contrato.cliente}
                    moraPendiente={Math.abs(contrato.diasRestantes) * contrato.saldo * 0.003}
                    diasMora={Math.abs(contrato.diasRestantes)}
                >
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Gestionar Mora"
                    >
                        <Gift className="h-4 w-4" />
                    </Button>
                </GestionMoraSheet>
            )}
        </div>
    )
}

// Wrapper para el modal con hook
function WhatsAppModalWrapper({
    contrato,
    onClose
}: {
    contrato: ContratoTabla
    onClose: () => void
}) {
    const modal = useWhatsAppModal(contrato)

    // Abrir automáticamente cuando se monta
    useState(() => {
        modal.abrirModal()
    })

    const handleClose = () => {
        modal.cerrarModal()
        onClose()
    }

    return (
        <WhatsAppModal
            contrato={contrato}
            isOpen={true}
            onOpenChange={(open) => !open && handleClose()}
            mensaje={modal.mensaje}
            onMensajeChange={modal.setMensaje}
            onRestaurar={modal.restaurarMensaje}
            onEnviar={modal.enviar}
            enviando={modal.enviando}
            puedeEnviar={modal.puedeEnviar}
            cooldown={modal.cooldown}
            historial={modal.historial}
        />
    )
}
