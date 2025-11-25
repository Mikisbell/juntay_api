'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import {
    User,
    Package,
    Calculator,
    FileText,
    Check,
    Printer,
    Send,
    Loader2,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
    formatearMonto,
    formatearFecha,
    formatearFrecuencia,
    calcularTotalIntereses,
    calcularTotalAPagar
} from '@/lib/utils/calculadora-credito'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { handleAppError } from '@/lib/utils/error-handler'
import { registrarEmpeno } from '@/lib/actions/contratos-actions'
import { usePrint } from '@/hooks/usePrint'
import { TicketTemplate } from '@/components/printing/TicketTemplate'
import { ContratoLegal } from '@/components/printing/ContratoLegal'
import { useRouter } from 'next/navigation'

export default function ResumenStep() {
    const {
        cliente,
        detallesGarantia,
        montoPrestamo,
        tasaInteres,
        frecuenciaPago,
        numeroCuotas,
        fechaInicio,
        cronograma
    } = useCotizador()

    const [enviarWhatsapp, setEnviarWhatsapp] = useState(false)
    const [imprimirAuto, setImprimirAuto] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [guardadoExitoso, setGuardadoExitoso] = useState(false)
    const [contratoIdGenerado, setContratoIdGenerado] = useState<string | null>(null)
    const router = useRouter()

    const totalIntereses = cronograma.length > 0 ? calcularTotalIntereses(cronograma) : 0
    const totalAPagar = cronograma.length > 0 ? calcularTotalAPagar(cronograma) : 0

    const handleConfirmar = async () => {
        if (!cliente || !fechaInicio) {
            toast.error('Faltan datos requeridos para confirmar')
            return
        }

        setGuardando(true)
        const loadingToast = toast.loading('Guardando empeño...')

        try {
            // Construir objeto completo para el server action
            const datosEmpeno = {
                cliente: {
                    id: cliente.id,
                    dni: cliente.dni,
                    nombres: cliente.nombres,
                    apellido_paterno: cliente.apellido_paterno,
                    apellido_materno: cliente.apellido_materno
                },
                detallesGarantia: {
                    ...detallesGarantia,
                    // Asegurar que el estado sea uno de los valores permitidos por el schema
                    estado_bien: detallesGarantia.estado_bien as 'NUEVO' | 'BUENO' | 'REGULAR' | 'MALO' | 'EXCELENTE',
                    montoPrestamo,
                    tasaInteres,
                    subcategoria: detallesGarantia.categoria // Use categoria as subcategoria fallback
                },
                condicionesPago: {
                    frecuenciaPago,
                    numeroCuotas,
                    fechaInicio
                },
                opciones: {
                    enviarWhatsapp,
                    imprimirAuto
                }
            }

            console.log('[DEBUG] datosEmpeno being sent:', JSON.stringify(datosEmpeno, null, 2))
            console.log('[DEBUG] detallesGarantia.valorMercado:', detallesGarantia.valorMercado)
            console.log('[DEBUG] montoPrestamo:', montoPrestamo)

            const contratoId = await registrarEmpeno(datosEmpeno)
            setContratoIdGenerado(contratoId)

            toast.success('¡Empeño registrado exitosamente!', {
                id: loadingToast,
                description: `Contrato #${contratoId} creado correctamente`,
                duration: 5000
            })
            setGuardadoExitoso(true)

            // Limpiar estado local de borrador si existe
            if (typeof window !== 'undefined') {
                localStorage.removeItem('empeno_draft')
            }

        } catch (error) {
            handleAppError(error, 'Error al guardar el empeño')
        } finally {
            setGuardando(false)
        }
    }

    const { print } = usePrint()

    const handleImprimirTicket = () => {
        if (!cliente || !detallesGarantia) return

        print(
            <TicketTemplate
                contratoId={contratoIdGenerado || 'PENDIENTE'}
                cliente={{
                    nombres: cliente.nombres,
                    apellidos: `${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim(),
                    documento: cliente.dni // Assuming dni is the document number
                }}
                garantia={{
                    descripcion: detallesGarantia.descripcion,
                    marca: detallesGarantia.marca,
                    modelo: detallesGarantia.modelo,
                    serie: detallesGarantia.serie
                }}
                prestamo={{
                    monto: montoPrestamo,
                    interes: tasaInteres,
                    plazo: cronograma.length * (frecuenciaPago === 'DIARIO' ? 1 : frecuenciaPago === 'SEMANAL' ? 7 : 30), // Estimado
                    fechaVencimiento: cronograma.length > 0 ? new Date(cronograma[cronograma.length - 1].fecha) : new Date(),
                    totalPagar: totalAPagar
                }}
                fechaEmision={new Date()}
            />
        )
    }

    const handleImprimirContrato = () => {
        if (!cliente || !detallesGarantia) return

        print(
            <ContratoLegal
                contratoId={contratoIdGenerado || 'PENDIENTE'}
                cliente={{
                    nombres: cliente.nombres,
                    apellidos: `${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim(),
                    tipoDocumento: 'DNI', // Default or derived
                    numeroDocumento: cliente.dni, // Assuming dni is the document number
                    direccion: '' // Optional in interface
                }}
                garantia={{
                    descripcion: detallesGarantia.descripcion,
                    marca: detallesGarantia.marca,
                    modelo: detallesGarantia.modelo,
                    serie: detallesGarantia.serie,
                    estado: detallesGarantia.estado_bien,
                    valorTasacion: detallesGarantia.valorMercado
                }}
                prestamo={{
                    monto: montoPrestamo,
                    tasaInteres: tasaInteres,
                    plazo: cronograma.length,
                    fechaInicio: fechaInicio || new Date(),
                    fechaVencimiento: cronograma.length > 0 ? new Date(cronograma[cronograma.length - 1].fecha) : new Date(),
                    totalPagar: totalAPagar
                }}
            />
        )
    }

    if (guardadoExitoso) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">¡Empeño Registrado!</h2>
                <p className="text-slate-500 text-center max-w-md">
                    El contrato ha sido generado exitosamente. Puedes imprimir los documentos o ir al dashboard.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-sm">
                    <Button
                        size="lg"
                        className="w-full gap-2 bg-slate-800 hover:bg-slate-700"
                        onClick={handleImprimirTicket}
                    >
                        <Printer className="w-5 h-5" />
                        Imprimir Ticket (80mm)
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleImprimirContrato}
                    >
                        <FileText className="w-5 h-5" />
                        Imprimir Contrato (A4)
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => router.push('/dashboard')}
                    >
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-full">
            {/* Títul o */}
            <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-slate-900">Resumen del Contrato de Empeño</h2>
                <p className="text-sm text-slate-600 mt-1">Revise toda la información antes de confirmar</p>
            </div>

            {/* Datos del Cliente */}
            <Card className="border-t-4 border-t-blue-600 shadow-md">
                <CardHeader className="bg-slate-50 py-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4 text-blue-600" />
                        Datos del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Nombre Completo</p>
                            <p className="font-semibold text-slate-900">
                                {cliente?.nombres} {cliente?.apellido_paterno} {cliente?.apellido_materno}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Documento</p>
                            <p className="font-semibold text-slate-900">{cliente?.dni}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Datos de la Garantía */}
            <Card className="border-t-4 border-t-purple-600 shadow-md">
                <CardHeader className="bg-slate-50 py-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="h-4 w-4 text-purple-600" />
                        Garantía / Bien Empeñado
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Categoría</p>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                {detallesGarantia.categoria || 'Sin especificar'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Marca</p>
                            <p className="font-semibold text-slate-900">{detallesGarantia.marca || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Modelo</p>
                            <p className="font-semibold text-slate-900">{detallesGarantia.modelo || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Serie/IMEI</p>
                            <p className="font-mono text-sm text-slate-900">{detallesGarantia.serie || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Estado</p>
                            <Badge variant="outline">{detallesGarantia.estado_bien}</Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Valor Mercado</p>
                            <p className="font-semibold text-slate-900">
                                {formatearMonto(detallesGarantia.valorMercado)}
                            </p>
                        </div>
                    </div>

                    {/* ⚠️ ADVERTENCIA LTV si préstamo excede valor de mercado */}
                    {montoPrestamo > detallesGarantia.valorMercado && (
                        <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-amber-900 text-sm">
                                        ⚠️ Préstamo excede el valor de mercado
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        El monto prestado (S/ {montoPrestamo.toFixed(2)}) es mayor al valor de mercado del bien
                                        (S/ {detallesGarantia.valorMercado.toFixed(2)}).
                                        LTV: {((montoPrestamo / detallesGarantia.valorMercado) * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1 font-medium">
                                        Esta operación representa un riesgo elevado. Verificar con gerencia si es necesario.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {detallesGarantia.descripcion && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Descripción</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border">
                                {detallesGarantia.descripcion}
                            </p>
                        </div>
                    )}

                    {/* Fotos Preview */}
                    {detallesGarantia.fotos && detallesGarantia.fotos.length > 0 && (
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Fotos ({detallesGarantia.fotos.length})</p>
                            <div className="flex gap-2 flex-wrap">
                                {detallesGarantia.fotos.slice(0, 6).map((foto, idx) => (
                                    <div
                                        key={idx}
                                        className="w-16 h-16 rounded border-2 border-slate-200 overflow-hidden"
                                    >
                                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {detallesGarantia.fotos.length > 6 && (
                                    <div className="w-16 h-16 rounded border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                        <span className="text-xs text-slate-500">
                                            +{detallesGarantia.fotos.length - 6}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Condiciones del Préstamo */}
            <Card className="border-t-4 border-t-emerald-600 shadow-md">
                <CardHeader className="bg-slate-50 py-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calculator className="h-4 w-4 text-emerald-600" />
                        Condiciones del Préstamo
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 bg-white">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <p className="text-xs text-blue-700 mb-1">Monto Prestado</p>
                            <p className="text-lg font-bold text-blue-900">{formatearMonto(montoPrestamo)}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                            <p className="text-xs text-amber-700 mb-1">Tasa Interés</p>
                            <p className="text-lg font-bold text-amber-600">{tasaInteres}%</p>
                            <p className="text-xs text-amber-600">mensual</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                            <p className="text-xs text-purple-700 mb-1">Frecuencia</p>
                            <p className="text-base font-bold text-purple-900">{formatearFrecuencia(frecuenciaPago)}</p>
                            <p className="text-xs text-purple-600">{numeroCuotas} cuotas</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                            <p className="text-xs text-emerald-700 mb-1">Total a Pagar</p>
                            <p className="text-lg font-bold text-emerald-900">{formatearMonto(totalAPagar)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cronograma Resumido */}
            <Card className="border-t-4 border-t-slate-600 shadow-md">
                <CardHeader className="bg-slate-50 py-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-slate-600" />
                        Cronograma de Pagos
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 bg-white">
                    {cronograma.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 border-b">
                                        <tr>
                                            <th className="p-2 text-left">Cuota</th>
                                            <th className="p-2 text-left">Fecha</th>
                                            <th className="p-2 text-right">Capital</th>
                                            <th className="p-2 text-right">Interés</th>
                                            <th className="p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Primeras 3 cuotas */}
                                        {cronograma.slice(0, 3).map(cuota => (
                                            <tr key={cuota.numero} className="border-b hover:bg-slate-50">
                                                <td className="p-2">#{cuota.numero}</td>
                                                <td className="p-2 text-slate-600">{formatearFecha(cuota.fecha)}</td>
                                                <td className="p-2 text-right text-blue-600">{formatearMonto(cuota.capital)}</td>
                                                <td className="p-2 text-right text-amber-600">{formatearMonto(cuota.interes)}</td>
                                                <td className="p-2 text-right font-semibold">{formatearMonto(cuota.total)}</td>
                                            </tr>
                                        ))}
                                        {cronograma.length > 6 && (
                                            <tr>
                                                <td colSpan={5} className="p-2 text-center text-slate-400 text-xs">
                                                    ... {cronograma.length - 6} cuotas más ...
                                                </td>
                                            </tr>
                                        )}
                                        {/* Últimas 3 cuotas */}
                                        {cronograma.length > 3 && cronograma.slice(-3).map(cuota => (
                                            <tr key={cuota.numero} className="border-b hover:bg-slate-50">
                                                <td className="p-2">#{cuota.numero}</td>
                                                <td className="p-2 text-slate-600">{formatearFecha(cuota.fecha)}</td>
                                                <td className="p-2 text-right text-blue-600">{formatearMonto(cuota.capital)}</td>
                                                <td className="p-2 text-right text-amber-600">{formatearMonto(cuota.interes)}</td>
                                                <td className="p-2 text-right font-semibold">{formatearMonto(cuota.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-200 font-bold">
                                        <tr>
                                            <td colSpan={2} className="p-2">TOTALES</td>
                                            <td className="p-2 text-right text-blue-700">{formatearMonto(montoPrestamo)}</td>
                                            <td className="p-2 text-right text-amber-700">{formatearMonto(totalIntereses)}</td>
                                            <td className="p-2 text-right text-emerald-700">{formatearMonto(totalAPagar)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-slate-500">No hay cronograma generado</p>
                    )}
                </CardContent>
            </Card>

            {/* Opciones y Confirmación */}
            <Card className="border-2 border-emerald-500 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {/* Checkboxes */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="whatsapp"
                                    checked={enviarWhatsapp}
                                    onCheckedChange={(checked) => setEnviarWhatsapp(checked === true)}
                                />
                                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                                    <Send className="w-4 h-4 text-emerald-600" />
                                    Enviar documentos por WhatsApp
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="imprimir"
                                    checked={imprimirAuto}
                                    onCheckedChange={(checked) => setImprimirAuto(checked === true)}
                                />
                                <Label htmlFor="imprimir" className="flex items-center gap-2 cursor-pointer">
                                    <Printer className="w-4 h-4 text-blue-600" />
                                    Imprimir automáticamente
                                </Label>
                            </div>
                        </div>

                        <Separator />

                        {/* Botón Confirmar */}
                        {/* Botón Confirmar con Modal */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Guardando Empeño...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Confirmar y Registrar Empeño
                                        </>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-emerald-700">
                                        <Check className="w-5 h-5" />
                                        Confirmar Nuevo Empeño
                                    </AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div className="space-y-4 pt-2">
                                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                                <p className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Resumen de la Operación
                                                </p>
                                                <ul className="space-y-2 text-sm text-amber-800">
                                                    <li className="flex justify-between">
                                                        <span>Cliente:</span>
                                                        <span className="font-medium">{cliente?.nombres} {cliente?.apellido_paterno} {cliente?.apellido_materno}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>Préstamo:</span>
                                                        <span className="font-bold text-lg">{formatearMonto(montoPrestamo)}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>Interés:</span>
                                                        <span className="font-medium">{tasaInteres}% ({formatearFrecuencia(frecuenciaPago)})</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>Cuotas:</span>
                                                        <span className="font-medium">{numeroCuotas} cuotas</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Al confirmar, se generarán los contratos legales y se registrará la salida de efectivo en caja. Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Revisar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleConfirmar}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        Confirmar Operación
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <p className="text-xs text-center text-slate-600">
                            Al confirmar, se generarán los documentos del contrato y se guardará el empeño en el sistema
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
