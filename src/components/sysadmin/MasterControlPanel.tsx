'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Building2,
    Plus,
    Search,
    TrendingUp,
    Users,
    Wallet,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    DollarSign,
    MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    listarEmpresasConMetricas,
    obtenerKPIsGlobales,
    type EmpresaResumen
} from '@/lib/actions/super-admin-actions'
import { CreateEmpresaWizard } from './CreateEmpresaWizard'

interface EmpresaConMetricas extends EmpresaResumen {
    sucursales_count: number
    empleados_count: number
    cartera_total: number
}

export function MasterControlPanel() {
    const router = useRouter()
    const [empresas, setEmpresas] = useState<EmpresaConMetricas[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showWizard, setShowWizard] = useState(false)
    const [kpis, setKpis] = useState<{
        totalEmpresas: number
        empresasActivas: number
        empresasSuspendidas: number
        totalSucursales: number
        totalEmpleados: number
        carteraGlobal: number
        mrrEstimado: number
    } | null>(null)

    const cargar = async () => {
        setLoading(true)
        try {
            const [empData, kpiData] = await Promise.all([
                listarEmpresasConMetricas(),
                obtenerKPIsGlobales()
            ])
            setEmpresas(empData)
            setKpis(kpiData)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
    }, [])

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(n)

    const filteredEmpresas = empresas.filter(e =>
        e.razon_social.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.nombre_comercial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.ruc?.includes(searchQuery)
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-12" />
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                            <ShieldAlert className="h-6 w-6 text-white" />
                        </div>
                        Master Control Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestión centralizada de tenants y monitoreo de plataforma
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button
                        onClick={() => setShowWizard(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Empresa
                    </Button>
                </div>
            </div>

            {/* KPIs Dashboard */}
            {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Empresas Activas
                                        </p>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                            {kpis.empresasActivas}
                                            <span className="text-base font-normal text-blue-500">/{kpis.totalEmpresas}</span>
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-blue-500/10">
                                        <Building2 className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Total Sucursales
                                        </p>
                                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                            {kpis.totalSucursales}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-purple-500/10">
                                        <MapPin className="h-6 w-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            Cartera Global
                                        </p>
                                        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {formatMoney(kpis.carteraGlobal)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-emerald-500/10">
                                        <Wallet className="h-6 w-6 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                            MRR Estimado
                                        </p>
                                        <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                                            ${kpis.mrrEstimado.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-amber-500/10">
                                        <DollarSign className="h-6 w-6 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Search & Filters */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Directorio de Empresas
                            <Badge variant="secondary">{filteredEmpresas.length}</Badge>
                        </CardTitle>
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, RUC..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEmpresas.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No se encontraron empresas' : 'No hay empresas registradas'}
                            </p>
                            <Button className="mt-4" onClick={() => setShowWizard(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear primera empresa
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredEmpresas.map((empresa, idx) => (
                                <motion.div
                                    key={empresa.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                                            "border-l-4",
                                            empresa.activo
                                                ? "border-l-emerald-500 hover:border-l-emerald-600"
                                                : "border-l-red-500 hover:border-l-red-600 opacity-75"
                                        )}
                                        onClick={() => router.push(`/dashboard/sysadmin/empresas/${empresa.id}`)}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg truncate">
                                                            {empresa.nombre_comercial}
                                                        </h3>
                                                        {empresa.activo ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Suspendido
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {empresa.razon_social}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                                        <Badge variant="outline" className="font-mono">
                                                            RUC: {empresa.ruc || 'N/A'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {empresa.plan_id || 'Free'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 text-blue-600">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                <span className="font-bold">{empresa.sucursales_count}</span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">Sucursales</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 text-purple-600">
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span className="font-bold">{empresa.empleados_count}</span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">Empleados</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="flex items-center justify-center gap-1 text-emerald-600">
                                                                <TrendingUp className="h-3.5 w-3.5" />
                                                                <span className="font-bold text-xs">
                                                                    {formatMoney(empresa.cartera_total)}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">Cartera</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Empresa Wizard */}
            <CreateEmpresaWizard
                open={showWizard}
                onOpenChange={setShowWizard}
                onSuccess={cargar}
            />
        </div>
    )
}
