'use client'

import { useState } from 'react'
import { ReporteMensual } from '@/components/reportes/ReporteMensual'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { subMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

// Datos de ejemplo - en producción vendría de una API
const datosEjemplo = {
    creditosOtorgados: 45,
    montoTotalPrestado: 85000,
    creditosPagados: 38,
    montoRecuperado: 72000,
    interesesGanados: 12500,
    creditosVencidos: 7,
    prendasEjecutadas: 3,
    ventaPrendas: 4500,
    clientesNuevos: 12,
    clientesRecurrentes: 28
}

const datosMesAnterior = {
    creditosOtorgados: 42,
    montoTotalPrestado: 78000,
    creditosPagados: 35,
    montoRecuperado: 65000,
    interesesGanados: 11200,
    creditosVencidos: 5,
    prendasEjecutadas: 2,
    ventaPrendas: 3200,
    clientesNuevos: 10,
    clientesRecurrentes: 25
}

export default function ReporteMensualPage() {
    const [mesSeleccionado, setMesSeleccionado] = useState<Date>(new Date())

    // Generar últimos 6 meses para el selector
    const mesesDisponibles = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i))

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header con Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Reportes Mensuales
                        </h2>
                        <p className="text-muted-foreground">
                            Análisis de desempeño y métricas del negocio.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-slate-500" />
                        <Select
                            value={format(mesSeleccionado, 'yyyy-MM')}
                            onValueChange={(value) => {
                                const [year, month] = value.split('-').map(Number)
                                setMesSeleccionado(new Date(year, month - 1))
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Seleccionar mes" />
                            </SelectTrigger>
                            <SelectContent>
                                {mesesDisponibles.map((mes) => (
                                    <SelectItem key={format(mes, 'yyyy-MM')} value={format(mes, 'yyyy-MM')}>
                                        {format(mes, "MMMM yyyy", { locale: es })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Componente de Reporte */}
                <ReporteMensual
                    mes={mesSeleccionado}
                    datos={datosEjemplo}
                    datosMesAnterior={datosMesAnterior}
                />

            </div>
        </div>
    )
}
