'use client'

import { useEffect, useState } from 'react'
import {
    Landmark,
    Upload,
    CheckCircle2,
    Clock,
    AlertTriangle,
    RefreshCw,
    FileSpreadsheet,
    Link2,
    X,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    obtenerTransaccionesPendientes,
    obtenerResumenBancario,
    obtenerAlertasBancarias,
    buscarSugerenciasConciliacion,
    conciliarTransaccion,
    ignorarTransaccion,
    importarTransacciones,
    type TransaccionBancaria,
    type ResumenBancario,
    type SugerenciaConciliacion,
    type TipoBanco
} from '@/lib/actions/integracion-bancaria-actions'
import { parsearLineaExtracto } from '@/lib/utils/banco-parser'
import { cn } from '@/lib/utils'

/**
 * Panel de Integración Bancaria
 */
export function BancoPanel() {
    const [transacciones, setTransacciones] = useState<TransaccionBancaria[]>([])
    const [resumen, setResumen] = useState<ResumenBancario | null>(null)
    const [alertas, setAlertas] = useState<Array<{ tipo: string; mensaje: string; transaccionId: string; prioridad: string }>>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [dialogImportar, setDialogImportar] = useState(false)
    const [dialogConciliar, setDialogConciliar] = useState<TransaccionBancaria | null>(null)

    // Import form
    const [banco, setBanco] = useState<TipoBanco>('bcp')
    const [textoExtracto, setTextoExtracto] = useState('')
    const [importando, setImportando] = useState(false)

    // Conciliación
    const [sugerencias, setSugerencias] = useState<SugerenciaConciliacion[]>([])
    const [buscandoSugerencias, setBuscandoSugerencias] = useState(false)
    const [conciliando, setConciliando] = useState(false)

    const cargar = async () => {
        setLoading(true)
        try {
            const [tx, res, alt] = await Promise.all([
                obtenerTransaccionesPendientes(),
                obtenerResumenBancario(),
                obtenerAlertasBancarias()
            ])
            setTransacciones(tx)
            setResumen(res)
            setAlertas(alt)
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error cargando datos bancarios')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
    }, [])

    const handleImportar = async () => {
        if (!textoExtracto.trim()) {
            toast.error('Pega el extracto bancario')
            return
        }

        setImportando(true)
        try {
            const lineas = textoExtracto.split('\n').filter(l => l.trim())
            const txParsed = lineas
                .map(l => parsearLineaExtracto(l, banco))
                .filter((tx): tx is NonNullable<typeof tx> => tx !== null)

            if (txParsed.length === 0) {
                toast.error('No se pudieron parsear transacciones')
                setImportando(false)
                return
            }

            const result = await importarTransacciones(banco, txParsed)

            if (result.success) {
                toast.success(`Importación completada`, {
                    description: `${result.importadas} nuevas, ${result.duplicadas} duplicadas`
                })
                setDialogImportar(false)
                setTextoExtracto('')
                cargar()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error importando')
        } finally {
            setImportando(false)
        }
    }

    const handleAbrirConciliacion = async (tx: TransaccionBancaria) => {
        setDialogConciliar(tx)
        setBuscandoSugerencias(true)
        try {
            const sug = await buscarSugerenciasConciliacion(tx.id)
            setSugerencias(sug)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setBuscandoSugerencias(false)
        }
    }

    const handleConciliar = async (pagoId: string) => {
        if (!dialogConciliar) return

        setConciliando(true)
        try {
            const result = await conciliarTransaccion(dialogConciliar.id, pagoId)
            if (result.success) {
                toast.success('¡Conciliación exitosa!')
                setDialogConciliar(null)
                cargar()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error conciliando')
        } finally {
            setConciliando(false)
        }
    }

    const handleIgnorar = async (txId: string) => {
        await ignorarTransaccion(txId, 'Ignorado manualmente')
        toast.success('Transacción ignorada')
        setDialogConciliar(null)
        cargar()
    }

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="h-6 w-6" />
                        Integración Bancaria
                    </h2>
                    <p className="text-muted-foreground">
                        Conciliación de depósitos con pagos
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button onClick={() => setDialogImportar(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Extracto
                    </Button>
                </div>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
                <div className="space-y-2">
                    {alertas.slice(0, 3).map((alerta, i) => (
                        <div
                            key={i}
                            className={cn(
                                'p-3 rounded-lg flex items-center gap-2',
                                alerta.prioridad === 'alta' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                            )}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{alerta.mensaje}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Resumen */}
            {resumen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-green-50">
                        <CardContent className="p-4 text-center">
                            <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-700">
                                {formatMoney(resumen.depositosHoy)}
                            </div>
                            <div className="text-sm text-green-600">Depósitos Hoy</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-50">
                        <CardContent className="p-4 text-center">
                            <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                            <div className="text-2xl font-bold text-yellow-700">
                                {resumen.transaccionesPendientes}
                            </div>
                            <div className="text-sm text-yellow-600">Pendientes</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                        <CardContent className="p-4 text-center">
                            <Landmark className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-blue-700">
                                {formatMoney(resumen.montoPendienteConciliar)}
                            </div>
                            <div className="text-sm text-blue-600">Por Conciliar</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50">
                        <CardContent className="p-4 text-center">
                            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                            <div className="text-sm font-medium text-emerald-700">
                                {resumen.ultimaConciliacion
                                    ? new Date(resumen.ultimaConciliacion).toLocaleDateString('es-PE')
                                    : 'Nunca'
                                }
                            </div>
                            <div className="text-sm text-emerald-600">Última Conciliación</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Lista de transacciones */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Transacciones Pendientes ({transacciones.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transacciones.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p>¡Todas las transacciones conciliadas!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transacciones.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="p-3 border rounded-lg flex items-center gap-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{tx.descripcion}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {tx.fecha} • {tx.banco.toUpperCase()}
                                            {tx.referencia && ` • Ref: ${tx.referencia}`}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">
                                            {formatMoney(tx.monto)}
                                        </div>
                                        <Badge variant="outline">Pendiente</Badge>
                                    </div>
                                    <Button size="sm" onClick={() => handleAbrirConciliacion(tx)}>
                                        <Link2 className="h-4 w-4 mr-1" />
                                        Conciliar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Importar */}
            <Dialog open={dialogImportar} onOpenChange={setDialogImportar}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Importar Extracto Bancario
                        </DialogTitle>
                        <DialogDescription>
                            Pega el extracto bancario para importar transacciones
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Banco</label>
                            <Select value={banco} onValueChange={(v) => setBanco(v as TipoBanco)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bcp">BCP</SelectItem>
                                    <SelectItem value="interbank">Interbank</SelectItem>
                                    <SelectItem value="bbva">BBVA</SelectItem>
                                    <SelectItem value="scotiabank">Scotiabank</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Pega el extracto (CSV, separado por comas/tabs)
                            </label>
                            <Textarea
                                rows={10}
                                placeholder="DD/MM/YYYY, DESCRIPCIÓN, REFERENCIA, MONTO
25/12/2025, DEP YAPE, CR-0042, 150.00
25/12/2025, TRANSFER, PAGO CUOTA, 200.00"
                                value={textoExtracto}
                                onChange={(e) => setTextoExtracto(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleImportar} disabled={importando} className="w-full">
                            {importando ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Importar Transacciones
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Conciliar */}
            <Dialog open={!!dialogConciliar} onOpenChange={(open) => !open && setDialogConciliar(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Conciliar Transacción
                        </DialogTitle>
                        <DialogDescription>
                            Vincula esta transacción bancaria con un pago registrado
                        </DialogDescription>
                    </DialogHeader>

                    {dialogConciliar && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="font-medium">{dialogConciliar.descripcion}</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatMoney(dialogConciliar.monto)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {dialogConciliar.fecha} • {dialogConciliar.banco.toUpperCase()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Sugerencias de pago</h4>
                                {buscandoSugerencias ? (
                                    <Skeleton className="h-20" />
                                ) : sugerencias.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No se encontraron pagos similares
                                    </p>
                                ) : (
                                    sugerencias.map((sug) => (
                                        <div
                                            key={sug.pagoId}
                                            className="p-3 border rounded-lg flex items-center gap-3"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">{sug.clienteNombre}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {sug.creditoCodigo} • {formatMoney(sug.montoPago)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {sug.razon}
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                sug.confianza >= 80 ? 'bg-green-500' :
                                                    sug.confianza >= 50 ? 'bg-yellow-500' : 'bg-gray-500'
                                            )}>
                                                {sug.confianza}%
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleConciliar(sug.pagoId)}
                                                disabled={conciliando}
                                            >
                                                {conciliando ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handleIgnorar(dialogConciliar.id)}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Ignorar esta transacción
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
