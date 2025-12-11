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
import { enviarNotificacion, verificarCooldownNotificacion, obtenerHistorialNotificaciones } from '@/lib/actions/vencimientos-actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

type Contrato = {
    id: string
    codigo: string
    cliente: string
    dni: string
    telefono: string
    monto: number
    saldo: number
    fechaVencimiento: string
    diasRestantes: number
}

type FilterType = 'todos' | 'hoy' | 'semana' | 'mes'

export function TablaVencimientos({ contratos }: { contratos: Contrato[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filtroActivo, setFiltroActivo] = useState<FilterType>('todos')
    const [sortColumn, setSortColumn] = useState<'diasRestantes' | 'monto' | 'cliente'>('diasRestantes')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    // Estado del modal WhatsApp
    const [modalAbierto, setModalAbierto] = useState(false)
    const [contratoSeleccionado, setContratoSeleccionado] = useState<Contrato | null>(null)
    const [mensajePersonalizado, setMensajePersonalizado] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [cooldownInfo, setCooldownInfo] = useState<any>(null)
    const [historial, setHistorial] = useState<any[]>([])

    // Filtrar y ordenar contratos
    const contratosFiltrados = useMemo(() => {
        let filtered = contratos

        // Filtro por período
        if (filtroActivo === 'hoy') {
            filtered = filtered.filter(c => c.diasRestantes === 0)
        } else if (filtroActivo === 'semana') {
            filtered = filtered.filter(c => c.diasRestantes > 0 && c.diasRestantes <= 7)
        } else if (filtroActivo === 'mes') {
            filtered = filtered.filter(c => c.diasRestantes <= 30)
        }

        // Búsqueda
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.dni.includes(searchTerm) ||
                c.telefono.includes(searchTerm)
            )
        }

        // Ordenar
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
        if (dias <= 3) return 'default'  // Rojo/warning
        if (dias <= 7) return 'secondary' // Amarillo
        return 'outline' // Azul/normal
    }

    const getUrgenciaIcon = (dias: number) => {
        if (dias === 0) return <AlertCircle className="h-4 w-4 text-red-600" />
        if (dias <= 7) return <Clock className="h-4 w-4 text-yellow-600" />
        return <CalendarIcon className="h-4 w-4 text-blue-600" />
    }

    const handleAbrirWhatsApp = async (contrato: Contrato) => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }

        setContratoSeleccionado(contrato)
        const mensajeDefault = `Estimado/a ${contrato.cliente},

Le recordamos que su contrato ${contrato.codigo} ${contrato.diasRestantes === 0 ? 'vence HOY' : `vence en ${contrato.diasRestantes} día${contrato.diasRestantes !== 1 ? 's' : ''}`}.

Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Por favor, acérquese a nuestras oficinas para regularizar su situación.

Gracias por su preferencia.
JUNTAY - Casa de Empeños`

        setMensajePersonalizado(mensajeDefault)
        setModalAbierto(true)

        // Cargar historial y cooldown
        try {
            const [cooldown, hist] = await Promise.all([
                verificarCooldownNotificacion(contrato.id),
                obtenerHistorialNotificaciones(contrato.id)
            ])
            setCooldownInfo(cooldown)
            setHistorial(hist || [])
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleEnviar = async () => {
        if (!contratoSeleccionado) return

        setEnviando(true)
        try {
            // 1. Abrir WhatsApp Web en nueva pestaña (Smart Link)
            const mensajeEncoded = encodeURIComponent(mensajePersonalizado)
            const numero = contratoSeleccionado.telefono.replace(/\D/g, '')
            const whatsappUrl = `https://wa.me/${numero}?text=${mensajeEncoded}`
            window.open(whatsappUrl, '_blank')

            // 2. Registrar en historial (Backend)
            const resultado = await enviarNotificacion(
                contratoSeleccionado.telefono,
                contratoSeleccionado.cliente,
                contratoSeleccionado.diasRestantes === 0 ? 'vencimiento_hoy' : 'vencimiento_proximo',
                {
                    creditoId: contratoSeleccionado.id,
                    clienteId: contratoSeleccionado.id,
                    codigo: contratoSeleccionado.codigo,
                    fecha: contratoSeleccionado.fechaVencimiento,
                    monto: contratoSeleccionado.saldo,
                    dias: contratoSeleccionado.diasRestantes,
                    mensajePersonalizado
                }
            )

            if (resultado.success) {
                setModalAbierto(false)
            } else {
                console.error('Error registrando historial:', resultado.mensaje)
                // No mostramos alerta al usuario para no interrumpir el flujo, ya que WhatsApp se abrió
                setModalAbierto(false)
            }
        } catch (error) {
            console.error(error)
            alert('Error al procesar la acción')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Barra de herramientas */}
            <div className="flex items-center justify-between gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código, cliente o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // Search is already reactive via searchTerm, just prevent form submission
                                e.preventDefault()
                            }
                        }}
                        className="pl-10"
                    />
                </div>

                {/* Filtros rápidos */}
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

            {/* Tabla profesional */}
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
                                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                    No se encontraron contratos
                                </TableCell>
                            </TableRow>
                        ) : (
                            contratosFiltrados.map((contrato) => (
                                <TableRow
                                    key={contrato.id}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <TableCell>
                                        {getUrgenciaIcon(contrato.diasRestantes)}
                                    </TableCell>

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
                                                onClick={() => handleAbrirWhatsApp(contrato)}
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
                                            {/* Botón Gestionar Mora solo si está vencido */}
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Resultados */}
            <div className="text-sm text-muted-foreground">
                Mostrando {contratosFiltrados.length} de {contratos.length} contratos
            </div>

            {/* Modal WhatsApp */}
            {contratoSeleccionado && (
                <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                    <DialogContent className="max-w-4xl bg-[#ECE5DD]">
                        <DialogHeader className="bg-[#128C7E] text-white rounded-t-lg -mt-6 -mx-6 px-6 py-4">
                            <DialogTitle className="flex items-center gap-2">
                                <FaWhatsapp className="h-5 w-5" />
                                Enviar Mensaje WhatsApp
                            </DialogTitle>
                            <p className="text-sm text-white/80">
                                {contratoSeleccionado.cliente} • {contratoSeleccionado.telefono}
                            </p>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-3">
                                {cooldownInfo && !cooldownInfo.puedeEnviar && (
                                    <Card className="p-3 bg-amber-50 border-amber-400 border-2">
                                        <p className="text-sm font-semibold text-amber-900">⚠️ Espera antes de enviar</p>
                                        <p className="text-xs text-amber-800 mt-1">{cooldownInfo.mensaje}</p>
                                    </Card>
                                )}

                                <Label>Editar Mensaje</Label>
                                <Textarea
                                    value={mensajePersonalizado}
                                    onChange={(e) => setMensajePersonalizado(e.target.value)}
                                    rows={16}
                                    className="font-sans text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Vista Previa</Label>
                                <div className="bg-[#0B141A] rounded-lg p-4 min-h-[400px]">
                                    <div className="bg-[#005C4B] text-white rounded-lg px-3 py-2">
                                        <p className="text-sm whitespace-pre-wrap">{mensajePersonalizado}</p>
                                        <p className="text-[10px] text-gray-300 text-right mt-1">
                                            {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setModalAbierto(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleEnviar}
                                disabled={enviando || !mensajePersonalizado.trim() || (cooldownInfo && !cooldownInfo.puedeEnviar)}
                                className="gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                            >
                                <FaWhatsapp className="h-4 w-4" />
                                {enviando ? 'Enviando...' : 'Enviar'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
