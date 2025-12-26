'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Check,
    Crown,
    Zap,
    Building2,
    Users,
    CreditCard,
    FileText,
    AlertTriangle,
    Sparkles
} from 'lucide-react'
import { obtenerPlanes, obtenerPlanActual, Plan } from '@/lib/actions/planes-actions'
import { obtenerFacturas, Factura } from '@/lib/actions/facturacion-actions'
import { obtenerUsageActual, UsageActual, obtenerAlertasLimites } from '@/lib/actions/limites-actions'
import { cambiarPlan } from '@/lib/actions/suscripciones-actions'
import { useToast } from '@/hooks/use-toast'

export default function SuscripcionPage() {
    const { toast } = useToast()
    const [planes, setPlanes] = useState<Plan[]>([])
    const [planActual, setPlanActual] = useState<{ plan: Plan | null; suscripcion: { estado: string; dias_restantes_trial: number } | null } | null>(null)
    const [usage, setUsage] = useState<UsageActual | null>(null)
    const [facturas, setFacturas] = useState<Factura[]>([])
    const [alertas, setAlertas] = useState<{ tipo: 'warning' | 'error'; recurso: string; mensaje: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [cambiandoPlan, setCambiandoPlan] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        setLoading(true)
        try {
            const [planesData, planActualData, usageData, facturasData, alertasData] = await Promise.all([
                obtenerPlanes(),
                obtenerPlanActual(),
                obtenerUsageActual(),
                obtenerFacturas(5),
                obtenerAlertasLimites()
            ])
            setPlanes(planesData)
            setPlanActual(planActualData)
            setUsage(usageData)
            setFacturas(facturasData)
            setAlertas(alertasData)
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCambiarPlan(planId: string) {
        setCambiandoPlan(true)
        try {
            const resultado = await cambiarPlan(planId)
            if (resultado.success) {
                toast({
                    title: '¡Plan actualizado!',
                    description: 'Tu suscripción ha sido actualizada correctamente.',
                })
                cargarDatos()
            } else {
                toast({
                    title: 'Error',
                    description: resultado.error || 'No se pudo cambiar el plan',
                    variant: 'destructive'
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado',
                variant: 'destructive'
            })
        } finally {
            setCambiandoPlan(false)
        }
    }

    const getPlanIcon = (nombre: string) => {
        switch (nombre) {
            case 'basico': return <Zap className="h-6 w-6" />
            case 'pro': return <Crown className="h-6 w-6" />
            case 'enterprise': return <Building2 className="h-6 w-6" />
            default: return <Zap className="h-6 w-6" />
        }
    }

    const getPlanColor = (nombre: string) => {
        switch (nombre) {
            case 'basico': return 'from-blue-500 to-blue-600'
            case 'pro': return 'from-purple-500 to-purple-600'
            case 'enterprise': return 'from-amber-500 to-amber-600'
            default: return 'from-slate-500 to-slate-600'
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-slate-200 rounded w-64" />
                    <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-slate-200 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Suscripción</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Gestiona tu plan y ve tu uso actual
                </p>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
                <div className="space-y-2">
                    {alertas.map((alerta, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 p-4 rounded-lg ${alerta.tipo === 'error'
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                                }`}
                        >
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <span>{alerta.mensaje}</span>
                            <Button size="sm" variant="outline" className="ml-auto">
                                Actualizar Plan
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Plan Actual + Uso */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Plan Actual */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Tu Plan Actual</CardTitle>
                            {planActual?.suscripcion?.estado === 'trial' && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                    Trial - {planActual.suscripcion.dias_restantes_trial} días restantes
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {planActual?.plan ? (
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(planActual.plan.nombre)} text-white`}>
                                    {getPlanIcon(planActual.plan.nombre)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{planActual.plan.nombre_display}</h3>
                                    <p className="text-2xl font-bold text-primary">
                                        S/ {planActual.plan.precio_mensual}
                                        <span className="text-sm font-normal text-slate-500">/mes</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500">Sin plan activo</p>
                        )}
                    </CardContent>
                </Card>

                {/* Uso Actual */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Uso del Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {usage && (
                            <>
                                <UsageBar
                                    label="Usuarios"
                                    actual={usage.usuarios.actual}
                                    maximo={usage.usuarios.maximo}
                                />
                                <UsageBar
                                    label="Sucursales"
                                    actual={usage.sucursales.actual}
                                    maximo={usage.sucursales.maximo}
                                />
                                <UsageBar
                                    label="Créditos este mes"
                                    actual={usage.creditosMes.actual}
                                    maximo={usage.creditosMes.maximo}
                                />
                                <UsageBar
                                    label="Créditos activos"
                                    actual={usage.creditosActivos.actual}
                                    maximo={usage.creditosActivos.maximo}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Planes Disponibles */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Planes Disponibles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {planes.map((plan) => {
                        const isActual = planActual?.plan?.id === plan.id
                        return (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden transition-all hover:shadow-lg ${plan.destacado ? 'border-2 border-purple-500 shadow-purple-100' : ''
                                    } ${isActual ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            >
                                {plan.destacado && (
                                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        POPULAR
                                    </div>
                                )}
                                <CardHeader>
                                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${getPlanColor(plan.nombre)} text-white w-fit`}>
                                        {getPlanIcon(plan.nombre)}
                                    </div>
                                    <CardTitle className="mt-3">{plan.nombre_display}</CardTitle>
                                    <CardDescription>{plan.descripcion}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <span className="text-4xl font-bold">S/ {plan.precio_mensual}</span>
                                        <span className="text-slate-500">/mes</span>
                                        {plan.precio_anual && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                o S/ {plan.precio_anual}/año (ahorra 2 meses)
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            {plan.max_usuarios === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_usuarios} usuarios`}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            {plan.max_sucursales === -1 ? 'Sucursales ilimitadas' : `Hasta ${plan.max_sucursales} sucursales`}
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            {plan.max_creditos_mes === -1 ? 'Créditos ilimitados' : `${plan.max_creditos_mes} créditos/mes`}
                                        </li>
                                        {plan.features.slice(0, 3).map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full"
                                        variant={isActual ? 'outline' : plan.destacado ? 'default' : 'outline'}
                                        disabled={isActual || cambiandoPlan}
                                        onClick={() => handleCambiarPlan(plan.id)}
                                    >
                                        {isActual ? 'Plan Actual' : 'Seleccionar'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Historial de Facturas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Historial de Facturas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {facturas.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            No hay facturas aún
                        </p>
                    ) : (
                        <div className="divide-y">
                            {facturas.map((factura) => (
                                <div key={factura.id} className="py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{factura.numero}</p>
                                        <p className="text-sm text-slate-500">{factura.concepto}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">S/ {factura.total.toFixed(2)}</p>
                                        <Badge variant={factura.estado === 'paid' ? 'default' : 'secondary'}>
                                            {factura.estado === 'paid' ? 'Pagada' :
                                                factura.estado === 'pending' ? 'Pendiente' : factura.estado}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function UsageBar({ label, actual, maximo }: { label: string; actual: number; maximo: number }) {
    const porcentaje = maximo === -1 ? 0 : Math.min(100, Math.round((actual / maximo) * 100))
    const ilimitado = maximo === -1

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium">
                    {actual} / {ilimitado ? '∞' : maximo}
                </span>
            </div>
            <Progress
                value={ilimitado ? 10 : porcentaje}
                className={`h-2 ${porcentaje >= 90 ? '[&>div]:bg-red-500' :
                        porcentaje >= 70 ? '[&>div]:bg-amber-500' :
                            '[&>div]:bg-emerald-500'
                    }`}
            />
        </div>
    )
}
