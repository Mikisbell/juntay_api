'use client'

import { useEffect } from 'react'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { Button } from '@/components/ui/button'
import {
    PlusCircle,
    Search,
    DollarSign,
    AlertTriangle,
    Package,
    RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function DashboardPage() {
    const router = useRouter()

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault()
                router.push('/dashboard/mostrador/nuevo-empeno')
            }
            if (e.key === 'F2') {
                e.preventDefault()
                router.push('/dashboard/buscar')
            }
            if (e.key === 'F3') {
                e.preventDefault()
                router.push('/dashboard/caja')
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router])

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h2>
                    <p className="text-slate-500">Bienvenido de nuevo, Admin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/mostrador/nuevo-empeno">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Empeño (F1)
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPIs DEL NEGOCIO */}
            <DashboardStats />

            {/* ZONA DE ACCIÓN (Accesos Directos Visuales) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* Tarjeta de Acción 1 */}
                <Link href="/dashboard/mostrador/nuevo-empeno" className="group">
                    <div className="flex h-full flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                        <div className="space-y-2">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <PlusCircle className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Nueva Operación</h3>
                            <p className="text-sm text-slate-500">Registrar un nuevo contrato de empeño (Oro o Electro).</p>
                        </div>
                    </div>
                </Link>

                {/* Tarjeta de Acción 2 */}
                <Link href="/dashboard/caja" className="group">
                    <div className="flex h-full flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <div className="space-y-2">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Gestión de Caja</h3>
                            <p className="text-sm text-slate-500">Apertura, cierre y arqueo de caja operativa.</p>
                        </div>
                    </div>
                </Link>

                {/* Tarjeta de Acción 3 */}
                <Link href="/dashboard/inventario" className="group">
                    <div className="flex h-full flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md">
                        <div className="space-y-2">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Package className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-slate-900">Consultar Inventario</h3>
                            <p className="text-sm text-slate-500">Buscar prendas en custodia o disponibles para remate.</p>
                        </div>
                    </div>
                </Link>

            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Atención Requerida Hoy</h2>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contrato</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Mock Data - Replace with real data later */}
                            <TableRow className="bg-rose-50 hover:bg-rose-100">
                                <TableCell className="font-medium">CON-2024-001</TableCell>
                                <TableCell>JUAN PEREZ</TableCell>
                                <TableCell className="text-rose-700 font-bold">HOY</TableCell>
                                <TableCell>S/ 1,050.00</TableCell>
                                <TableCell><Badge variant="destructive">VENCE HOY</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-200">
                                        Llamar
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow className="bg-amber-50 hover:bg-amber-100">
                                <TableCell className="font-medium">CON-2024-002</TableCell>
                                <TableCell>ANA MARTINEZ</TableCell>
                                <TableCell>Mañana</TableCell>
                                <TableCell>S/ 1,200.00</TableCell>
                                <TableCell><Badge variant="secondary" className="bg-amber-100 text-amber-800">PRÓXIMO</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-200">
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
