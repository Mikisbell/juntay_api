import { obtenerCajasActivas, obtenerResumenConsolidado } from '@/lib/actions/monitor-cajas-actions'
import { MonitorCajasTable } from '@/components/admin/MonitorCajasTable'
import { Activity } from 'lucide-react'

// Función del lado del servidor para refresh
async function refreshData() {
    'use server'
    const [cajas, resumen] = await Promise.all([
        obtenerCajasActivas(),
        obtenerResumenConsolidado()
    ])
    return { cajas, resumen }
}

export default async function MonitorCajasPage() {
    const [cajas, resumen] = await Promise.all([
        obtenerCajasActivas(),
        obtenerResumenConsolidado()
    ])

    return (
        <div className="container mx-auto py-8 max-w-7xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="h-8 w-8 text-blue-600" />
                    Monitor de Cajas en Tiempo Real
                </h1>
                <p className="text-slate-500 mt-1">
                    Supervisión activa de todas las operaciones de caja
                </p>
            </div>

            {/* Componente con auto-refresh */}
            <MonitorCajasTable
                cajasIniciales={cajas}
                resumenInicial={resumen}
                onRefresh={refreshData}
            />
        </div>
    )
}

// Deshabilitar caché para que siempre muestre datos frescos
export const dynamic = 'force-dynamic'
export const revalidate = 0
