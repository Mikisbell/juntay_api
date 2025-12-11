'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
    SheetClose
} from '@/components/ui/sheet'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cerrarCajaAction } from '@/lib/actions/caja-actions'
import {
    LockKeyhole,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    Loader2,
    Calculator
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
    saldoEsperado: number
    cajaId: string
}

const DENOMINACIONES = [
    { valor: 200, label: 'S/ 200' },
    { valor: 100, label: 'S/ 100' },
    { valor: 50, label: 'S/ 50' },
    { valor: 20, label: 'S/ 20' },
    { valor: 10, label: 'S/ 10' },
    { valor: 5, label: 'S/ 5' },
    { valor: 2, label: 'S/ 2' },
    { valor: 1, label: 'S/ 1' },
    { valor: 0.5, label: 'S/ 0.50' },
    { valor: 0.2, label: 'S/ 0.20' },
    { valor: 0.1, label: 'S/ 0.10' },
]

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(value)
}

export function CierreCajaSheet({ saldoEsperado, cajaId }: Props) {
    const [open, setOpen] = useState(false)
    const [montoContado, setMontoContado] = useState('')
    const [observaciones, setObservaciones] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [detalleAbierto, setDetalleAbierto] = useState(false)
    const [conteo, setConteo] = useState<Record<number, number>>({})

    const router = useRouter()
    const queryClient = useQueryClient()

    // Calcular monto desde denominaciones si se usa el desglose
    const totalDesglose = DENOMINACIONES.reduce((acc, d) => {
        return acc + (conteo[d.valor] || 0) * d.valor
    }, 0)

    // El monto final es el input directo o el desglose
    const montoFinal = detalleAbierto && totalDesglose > 0
        ? totalDesglose
        : parseFloat(montoContado) || 0

    // Calcular diferencia en tiempo real
    const diferencia = montoFinal - saldoEsperado
    const esPerfecto = Math.abs(diferencia) < 0.01
    const esSobrante = diferencia > 0.01
    const esFaltante = diferencia < -0.01

    const handleCantidadChange = (valor: number, cantidad: string) => {
        const nuevaCantidad = parseInt(cantidad) || 0
        setConteo(prev => ({ ...prev, [valor]: nuevaCantidad }))
        // Sincronizar con input principal
        const nuevoTotal = DENOMINACIONES.reduce((acc, d) => {
            if (d.valor === valor) return acc + nuevaCantidad * d.valor
            return acc + (conteo[d.valor] || 0) * d.valor
        }, 0)
        setMontoContado(nuevoTotal.toFixed(2))
    }

    const handleMontoDirecto = (value: string) => {
        setMontoContado(value)
        // Limpiar desglose si escriben directo
        if (detalleAbierto) {
            setConteo({})
        }
    }

    const handleCerrar = async () => {
        setLoading(true)
        try {
            const resp = await cerrarCajaAction(montoFinal, observaciones || undefined)

            if (resp.success) {
                // Invalidar cache y refrescar
                await queryClient.invalidateQueries({ queryKey: ['caja'] })
                setOpen(false)
                router.refresh()
            } else {
                // TODO: Usar toast en lugar de alert
                alert('Error: ' + resp.error)
            }
        } catch (e) {
            console.error(e)
            alert('Error inesperado al cerrar caja')
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    const resetForm = () => {
        setMontoContado('')
        setObservaciones('')
        setConteo({})
        setDetalleAbierto(false)
    }

    return (
        <>
            <Sheet open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen)
                if (!isOpen) resetForm()
            }}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        Cerrar Turno
                    </Button>
                </SheetTrigger>

                <SheetContent className="w-[420px] sm:w-[480px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <LockKeyhole className="h-5 w-5 text-slate-500" />
                            Cierre de Caja
                        </SheetTitle>
                        <SheetDescription>
                            Confirma el efectivo físico para cerrar tu turno
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
                        {/* Saldo esperado - TRANSPARENCIA */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                Saldo según sistema
                            </p>
                            <p className="text-3xl font-bold text-slate-900 font-mono">
                                {formatCurrency(saldoEsperado)}
                            </p>
                        </div>

                        {/* Input principal - SIMPLICIDAD */}
                        <div className="space-y-2">
                            <Label htmlFor="monto-contado" className="text-base font-medium">
                                ¿Cuánto contaste?
                            </Label>
                            <Input
                                id="monto-contado"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={montoContado}
                                onChange={(e) => handleMontoDirecto(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        if (montoFinal > 0) setShowConfirm(true)
                                    }
                                }}
                                className="text-2xl text-center font-bold h-14 font-mono"
                                autoFocus
                            />
                        </div>

                        {/* Desglose opcional - FLEXIBILIDAD */}
                        <Collapsible open={detalleAbierto} onOpenChange={setDetalleAbierto}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <Calculator className="h-4 w-4" />
                                        Desglose por denominación
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${detalleAbierto ? 'rotate-180' : ''}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg">
                                    {DENOMINACIONES.map((d) => (
                                        <div key={d.valor} className="flex items-center gap-2">
                                            <span className="text-xs text-slate-600 w-14">{d.label}</span>
                                            <Input
                                                type="number"
                                                className="h-8 text-right text-sm"
                                                placeholder="0"
                                                min="0"
                                                value={conteo[d.valor] || ''}
                                                onChange={(e) => handleCantidadChange(d.valor, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Diferencia en tiempo real - FEEDBACK INSTANTÁNEO */}
                        {montoFinal > 0 && (
                            <div className={`p-4 rounded-xl border-2 transition-all ${esPerfecto
                                ? 'bg-emerald-50 border-emerald-200'
                                : esSobrante
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-amber-50 border-amber-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {esPerfecto ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : esSobrante ? (
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-amber-600" />
                                        )}
                                        <span className={`font-medium ${esPerfecto ? 'text-emerald-700' : esSobrante ? 'text-blue-700' : 'text-amber-700'
                                            }`}>
                                            {esPerfecto ? '¡Cuadre perfecto!' : esSobrante ? 'Sobrante' : 'Faltante'}
                                        </span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`font-mono text-lg ${esPerfecto
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                            : esSobrante
                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                : 'bg-amber-100 text-amber-700 border-amber-300'
                                            }`}
                                    >
                                        {esPerfecto ? 'S/ 0.00' : `${esSobrante ? '+' : ''}${formatCurrency(diferencia)}`}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Observaciones - Solo si hay diferencia */}
                        {montoFinal > 0 && !esPerfecto && (
                            <div className="space-y-2">
                                <Label htmlFor="observaciones" className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    Explica la diferencia
                                </Label>
                                <Textarea
                                    id="observaciones"
                                    placeholder="Ej: Error en vuelto, billete roto..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            setShowConfirm(true)
                                        }
                                    }}
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>
                        )}
                    </div>

                    <SheetFooter className="border-t pt-4">
                        <SheetClose asChild>
                            <Button variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </SheetClose>
                        <Button
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                            disabled={montoFinal === 0 || loading}
                            onClick={() => setShowConfirm(true)}
                        >
                            Confirmar Cierre
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Diálogo de confirmación - NO alert() nativo */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar cierre de caja?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>Estás a punto de cerrar tu turno con:</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-slate-500">Contado:</span>
                                    <span className="font-bold font-mono">{formatCurrency(montoFinal)}</span>
                                    <span className="text-slate-500">Sistema:</span>
                                    <span className="font-mono">{formatCurrency(saldoEsperado)}</span>
                                    <span className="text-slate-500">Diferencia:</span>
                                    <span className={`font-mono font-bold ${esPerfecto ? 'text-emerald-600' : esFaltante ? 'text-amber-600' : 'text-blue-600'
                                        }`}>
                                        {esPerfecto ? 'S/ 0.00' : `${esSobrante ? '+' : ''}${formatCurrency(diferencia)}`}
                                    </span>
                                </div>
                                <p className="text-amber-600 text-sm font-medium">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCerrar}
                            disabled={loading}
                            className="bg-slate-900 hover:bg-slate-800"
                            autoFocus // Focus here to allow pressing Enter immediately
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cerrando...
                                </>
                            ) : (
                                'Sí, cerrar caja'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
