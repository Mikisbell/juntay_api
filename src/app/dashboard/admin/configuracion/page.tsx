'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, Shield, Percent, Calendar, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import {
    obtenerConfigIntereses,
    actualizarConfigIntereses,
    type ConfigIntereses,
    CONFIG_INTERESES_DEFAULT
} from '@/lib/actions/config-intereses-actions'

export default function ConfiguracionPage() {
    const [config, setConfig] = useState<ConfigIntereses>(CONFIG_INTERESES_DEFAULT)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Cargar configuración al montar
    useEffect(() => {
        async function loadConfig() {
            try {
                const data = await obtenerConfigIntereses()
                setConfig(data)
            } catch (err) {
                console.error('Error cargando config:', err)
                setError('Error cargando configuración')
            } finally {
                setLoading(false)
            }
        }
        loadConfig()
    }, [])

    // Guardar configuración
    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSaved(false)

        const result = await actualizarConfigIntereses(config)

        if (result.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } else {
            setError(result.error || 'Error guardando configuración')
        }

        setSaving(false)
    }

    // Actualizar campo
    const updateField = (field: keyof ConfigIntereses, value: number | boolean | string) => {
        setConfig(prev => ({ ...prev, [field]: value }))
        setSaved(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex-1 space-y-8 p-8 pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Configuración del Sistema
                        </h2>
                        <p className="text-muted-foreground">
                            Administración de parámetros globales y reglas de negocio.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saved && (
                            <span className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                Guardado
                            </span>
                        )}
                        {error && (
                            <span className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                {error}
                            </span>
                        )}
                        <Button
                            className="gap-2 shadow-lg shadow-primary/20"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="financiero" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="financiero">Financiero</TabsTrigger>
                        <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Información de la Empresa</CardTitle>
                                <CardDescription>Datos que aparecen en los contratos y tickets.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre Comercial</Label>
                                        <Input id="nombre" defaultValue="JUNTAY Casa de Empeño" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ruc">RUC</Label>
                                        <Input id="ruc" defaultValue="20123456789" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección Principal</Label>
                                        <Input id="direccion" defaultValue="Av. Principal 123, Lima" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono de Contacto</Label>
                                        <Input id="telefono" defaultValue="+51 999 888 777" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financiero" className="space-y-4">
                        {/* Configuración de Mora - NUEVO */}
                        <Card className="border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    Configuración de Mora
                                </CardTitle>
                                <CardDescription>
                                    Parámetros para el cálculo de intereses moratorios. Estos valores afectan directamente la cobranza.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-amber-600" />
                                            Tasa de Mora Diaria (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={config.tasa_mora_diaria}
                                            onChange={(e) => updateField('tasa_mora_diaria', parseFloat(e.target.value) || 0)}
                                            className="bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Equivale a <strong>{(config.tasa_mora_diaria * 30).toFixed(1)}%</strong> mensual
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-amber-600" />
                                            Días de Gracia
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={config.dias_gracia}
                                            onChange={(e) => updateField('dias_gracia', parseInt(e.target.value) || 0)}
                                            className="bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Días sin mora después del vencimiento
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-amber-600" />
                                            Tope Mora Mensual (%)
                                        </Label>
                                        <Input
                                            type="number"
                                            step="1"
                                            min="0"
                                            max="100"
                                            value={config.tope_mora_mensual || 15}
                                            onChange={(e) => updateField('tope_mora_mensual', parseInt(e.target.value) || 15)}
                                            className="bg-white"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Límite máximo de mora por mes
                                        </p>
                                    </div>
                                </div>

                                {/* Preview de cálculo */}
                                <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border">
                                    <h4 className="text-sm font-medium mb-2">📊 Ejemplo de Cálculo</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Para un préstamo de <strong>S/ 1,000</strong> vencido hace <strong>10 días</strong>:
                                    </p>
                                    <ul className="text-sm mt-2 space-y-1">
                                        <li>• Días de mora efectivos: {Math.max(0, 10 - config.dias_gracia)} días</li>
                                        <li>• Mora calculada: S/ {(1000 * (config.tasa_mora_diaria / 100) * Math.max(0, 10 - config.dias_gracia)).toFixed(2)}</li>
                                        <li>• Tope aplicado: S/ {Math.min(
                                            1000 * (config.tasa_mora_diaria / 100) * Math.max(0, 10 - config.dias_gracia),
                                            1000 * ((config.tope_mora_mensual || 15) / 100)
                                        ).toFixed(2)}</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parámetros de Crédito */}
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Parámetros de Crédito</CardTitle>
                                <CardDescription>Reglas para el cálculo de intereses y plazos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Período Base (días)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={config.base_dias}
                                            onChange={(e) => updateField('base_dias', parseInt(e.target.value) || 30)}
                                        />
                                        <p className="text-xs text-muted-foreground">Duración estándar de un préstamo.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Interés Mínimo (días)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={config.interes_minimo_dias}
                                            onChange={(e) => updateField('interes_minimo_dias', parseInt(e.target.value) || 1)}
                                        />
                                        <p className="text-xs text-muted-foreground">Días mínimos de interés a cobrar.</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Capitalización Mensual</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Capitalizar el interés devengado cada mes.
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={config.capitalizacion_mensual}
                                        onChange={(e) => updateField('capitalizacion_mensual', e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="seguridad" className="space-y-4">
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Control de Acceso</CardTitle>
                                <CardDescription>Gestión de permisos y seguridad.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Autenticación de Dos Factores</Label>
                                        <p className="text-sm text-muted-foreground">Requerir 2FA para administradores.</p>
                                    </div>
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
