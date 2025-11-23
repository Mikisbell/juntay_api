'use client'

import { useCotizador, FrecuenciaPago } from '@/hooks/useCotizador'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Calculator, FileText } from 'lucide-react'

import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cronogramaSchema, CronogramaFormData } from '@/lib/validators/empeno-schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
    generarCronograma,
    calcularInteresFraccionado,
    calcularTotalIntereses,
    calcularTotalAPagar,
    formatearFrecuencia,
    formatearFecha,
    formatearMonto
} from '@/lib/utils/calculadora-credito'
import { Badge } from '@/components/ui/badge'

const FRECUENCIAS: { value: FrecuenciaPago; label: string }[] = [
    { value: 'DIARIO', label: 'Diario' },
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'QUINCENAL', label: 'Quincenal' },
    { value: 'TRES_SEMANAS', label: 'Tres Semanas' },
    { value: 'MENSUAL', label: 'Mensual' }
]

export default function CronogramaStep() {
    const {
        montoPrestamo,
        tasaInteres,
        frecuenciaPago,
        numeroCuotas,
        fechaInicio,
        cronograma,
        setFrecuenciaPago,
        setNumeroCuotas,
        setFechaInicio,
        setCronograma
    } = useCotizador()

    const form = useForm<CronogramaFormData>({
        resolver: zodResolver(cronogramaSchema),
        defaultValues: {
            frecuenciaPago: frecuenciaPago,
            numeroCuotas: numeroCuotas,
            fechaInicio: fechaInicio || new Date(new Date().setDate(new Date().getDate() + 1))
        },
        mode: 'onChange'
    })

    // Watch specific fields for sync (optimized)
    const watchedFrecuencia = useWatch({ control: form.control, name: 'frecuenciaPago' })
    const watchedCuotas = useWatch({ control: form.control, name: 'numeroCuotas' })
    const watchedFecha = useWatch({ control: form.control, name: 'fechaInicio' })

    // Sync to context only when values actually change
    useEffect(() => {
        if (watchedFrecuencia) setFrecuenciaPago(watchedFrecuencia)
    }, [watchedFrecuencia, setFrecuenciaPago])

    useEffect(() => {
        if (watchedCuotas) setNumeroCuotas(watchedCuotas)
    }, [watchedCuotas, setNumeroCuotas])

    useEffect(() => {
        if (watchedFecha) setFechaInicio(watchedFecha)
    }, [watchedFecha, setFechaInicio])

    // Generar cronograma automáticamente cuando cambien los parámetros
    useEffect(() => {
        if (montoPrestamo > 0 && numeroCuotas > 0 && fechaInicio) {
            const nuevoCronograma = generarCronograma(
                montoPrestamo,
                tasaInteres,
                frecuenciaPago,
                numeroCuotas,
                new Date(fechaInicio)
            )
            setCronograma(nuevoCronograma)
        }
    }, [montoPrestamo, tasaInteres, frecuenciaPago, numeroCuotas, fechaInicio])

    // Establecer fecha de inicio por defecto (mañana)
    useEffect(() => {
        if (!fechaInicio) {
            const manana = new Date()
            manana.setDate(manana.getDate() + 1)
            setFechaInicio(manana)
        }
    }, [])

    // Memoize expensive calculations - prevents re-computation on every render
    const tasaFraccionada = useMemo(
        () => calcularInteresFraccionado(tasaInteres, frecuenciaPago),
        [tasaInteres, frecuenciaPago]
    )

    const totalIntereses = useMemo(
        () => cronograma.length > 0 ? calcularTotalIntereses(cronograma) : 0,
        [cronograma]
    )

    const totalAPagar = useMemo(
        () => cronograma.length > 0 ? calcularTotalAPagar(cronograma) : 0,
        [cronograma]
    )

    return (
        <div className="space-y-4 max-w-full">
            {/* Configuración del Cronograma */}
            <Card className="border-t-4 border-t-purple-600 shadow-md">
                <CardHeader className="bg-slate-50 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calculator className="h-4 w-4 text-purple-600" />
                        Configuración del Cronograma
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <Form {...form}>
                        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Frecuencia de Pago */}
                            <FormField
                                control={form.control}
                                name="frecuenciaPago"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frecuencia de Pago *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                {FRECUENCIAS.map(freq => (
                                                    <SelectItem key={freq.value} value={freq.value}>
                                                        {freq.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Número de Cuotas */}
                            <FormField
                                control={form.control}
                                name="numeroCuotas"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Cuotas *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="52"
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fecha de Inicio */}
                            <FormField
                                control={form.control}
                                name="fechaInicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>

                    {/* Información Clave */}
                    <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700 mb-1">Monto Prestado</p>
                            <p className="text-xl font-bold text-blue-900">
                                {formatearMonto(montoPrestamo)}
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700 mb-1">Tasa {formatearFrecuencia(frecuenciaPago)}</p>
                            <p className="text-xl font-bold text-amber-600">
                                {tasaFraccionada.toFixed(2)}%
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-xs text-purple-700 mb-1">Total a Pagar</p>
                            <p className="text-xl font-bold text-purple-900">
                                {formatearMonto(totalAPagar)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla del Cronograma */}
            {cronograma.length > 0 && (
                <Card className="border-t-4 border-t-emerald-600 shadow-md">
                    <CardHeader className="bg-slate-50 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-emerald-600" />
                                Cronograma de Pagos
                            </CardTitle>
                            <Badge className="bg-emerald-600">{cronograma.length} cuotas</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b-2 border-slate-300">
                                        <th className="p-3 text-left font-semibold text-slate-700">N°</th>
                                        <th className="p-3 text-left font-semibold text-slate-700">Fecha</th>
                                        <th className="p-3 text-right font-semibold text-slate-700">Capital</th>
                                        <th className="p-3 text-right font-semibold text-slate-700">Interés</th>
                                        <th className="p-3 text-right font-semibold text-slate-700">Total</th>
                                        <th className="p-3 text-right font-semibold text-slate-700">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cronograma.map((cuota, index) => (
                                        <tr
                                            key={cuota.numero}
                                            className={`border-b border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                        >
                                            <td className="p-3 font-medium">{cuota.numero}</td>
                                            <td className="p-3 text-slate-600">{formatearFecha(cuota.fecha)}</td>
                                            <td className="p-3 text-right text-blue-600 font-medium">
                                                {formatearMonto(cuota.capital)}
                                            </td>
                                            <td className="p-3 text-right text-amber-600 font-medium">
                                                {formatearMonto(cuota.interes)}
                                            </td>
                                            <td className="p-3 text-right text-emerald-600 font-bold">
                                                {formatearMonto(cuota.total)}
                                            </td>
                                            <td className="p-3 text-right text-slate-500">
                                                {formatearMonto(cuota.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-200 border-t-2 border-slate-400 font-bold">
                                        <td colSpan={2} className="p-3">TOTALES</td>
                                        <td className="p-3 text-right text-blue-700">
                                            {formatearMonto(montoPrestamo)}
                                        </td>
                                        <td className="p-3 text-right text-amber-700">
                                            {formatearMonto(totalIntereses)}
                                        </td>
                                        <td className="p-3 text-right text-emerald-700">
                                            {formatearMonto(totalAPagar)}
                                        </td>
                                        <td className="p-3 text-right text-slate-600">S/ 0.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Resumen Final */}
                        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300 rounded-lg p-4">
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Cuotas</p>
                                    <p className="text-lg font-bold text-slate-900">{numeroCuotas}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Frecuencia</p>
                                    <p className="text-lg font-bold text-slate-900">{formatearFrecuencia(frecuenciaPago)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Total Intereses</p>
                                    <p className="text-lg font-bold text-amber-600">{formatearMonto(totalIntereses)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Total a Pagar</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatearMonto(totalAPagar)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
