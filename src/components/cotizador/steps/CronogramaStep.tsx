'use client'

import { useCotizador, FrecuenciaPago } from '@/hooks/useCotizador'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        <div className="space-y-6 max-w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER PREMIUM: Resumen General */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
                                <Calendar className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold">Plan de Pagos</h2>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">
                            Configure las cuotas y fechas de pago. El sistema calcula automáticamente los intereses y saldos.
                        </p>
                    </div>

                    <div className="flex gap-6 text-right">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Capital</p>
                            <p className="text-2xl font-bold text-white">{formatearMonto(montoPrestamo)}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-700"></div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total a Pagar</p>
                            <p className="text-2xl font-bold text-emerald-400">{formatearMonto(totalAPagar)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-0 shadow-lg ring-1 ring-slate-200">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-blue-600" />
                                Configuración
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <Form {...form}>
                                <form className="space-y-5">
                                    {/* Frecuencia */}
                                    <FormField
                                        control={form.control}
                                        name="frecuenciaPago"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600 font-semibold">Frecuencia de Pago</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
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

                                    {/* Cuotas */}
                                    <FormField
                                        control={form.control}
                                        name="numeroCuotas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600 font-semibold">Número de Cuotas</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="52"
                                                            className="h-11 pl-4 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium text-lg"
                                                            {...field}
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                                            Cuotas
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Fecha Inicio */}
                                    <FormField
                                        control={form.control}
                                        name="fechaInicio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-600 font-semibold">Primer Vencimiento</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
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

                            {/* Resumen Tasa */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-semibold text-amber-700 uppercase">Tasa Aplicada</span>
                                    <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">
                                        {formatearFrecuencia(frecuenciaPago)}
                                    </Badge>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-amber-600">{tasaFraccionada.toFixed(2)}%</span>
                                    <span className="text-xs text-amber-600/80">interés por periodo</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUMNA DERECHA: TIMELINE DE PAGOS */}
                <div className="lg:col-span-8">
                    <Card className="border-0 shadow-lg ring-1 ring-slate-200 h-full">
                        <CardHeader className="bg-white border-b border-slate-100 py-5 sticky top-0 z-10 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Cronograma Detallado
                                </CardTitle>
                                <Badge className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1">
                                    {cronograma.length} {cronograma.length === 1 ? 'Cuota' : 'Cuotas'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cronograma.length > 0 ? (
                                <div className="overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
                                                <th className="px-6 py-4 font-semibold">Vencimiento</th>
                                                <th className="px-6 py-4 font-semibold text-right">Capital</th>
                                                <th className="px-6 py-4 font-semibold text-right">Interés</th>
                                                <th className="px-6 py-4 font-semibold text-right">Total</th>
                                                <th className="px-6 py-4 font-semibold text-right text-slate-400">Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {cronograma.map((cuota, index) => (
                                                <tr
                                                    key={cuota.numero}
                                                    className={`
                                                        group transition-colors hover:bg-blue-50/30
                                                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                                                    `}
                                                >
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            {cuota.numero}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">
                                                        {formatearFecha(cuota.fecha)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-500 font-medium">
                                                        {formatearMonto(cuota.capital)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-amber-600 font-medium">
                                                        {formatearMonto(cuota.interes)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="inline-block px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                                            {formatearMonto(cuota.total)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                                        {formatearMonto(cuota.saldo)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={2} className="px-6 py-4 font-bold text-slate-700 text-right uppercase text-xs tracking-wider">Totales Finales</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700">{formatearMonto(montoPrestamo)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-amber-600">{formatearMonto(totalIntereses)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600 text-base">{formatearMonto(totalAPagar)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Calculator className="h-12 w-12 mb-3 opacity-20" />
                                    <p>Configure los parámetros para ver el cronograma</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
