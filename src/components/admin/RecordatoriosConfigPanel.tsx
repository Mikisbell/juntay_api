'use client'

import { useEffect, useState } from 'react'
import {
    Clock,
    Calendar,
    Bell,
    Save,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
    obtenerConfiguracionRecordatorios,
    actualizarConfiguracionRecordatorios,
    type ConfiguracionRecordatorios
} from '@/lib/actions/recordatorios-config-actions'

const DIAS_SEMANA = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
]

const TIPOS_RECORDATORIO = [
    { value: 'VENCE_3_DIAS', label: '3 días antes' },
    { value: 'VENCE_MANANA', label: '1 día antes' },
    { value: 'VENCE_HOY', label: 'Día del vencimiento' },
    { value: 'VENCIDO', label: 'En mora (después)' }
]

/**
 * Panel de Configuración de Recordatorios
 */
export function RecordatoriosConfigPanel() {
    const [config, setConfig] = useState<ConfiguracionRecordatorios | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const cargarConfig = async () => {
        setLoading(true)
        try {
            const data = await obtenerConfiguracionRecordatorios()
            setConfig(data)
        } catch (err) {
            console.error('Error cargando config:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarConfig()
    }, [])

    const guardarConfig = async () => {
        if (!config) return

        setSaving(true)
        try {
            const resultado = await actualizarConfiguracionRecordatorios({
                hora_inicio: config.hora_inicio,
                hora_fin: config.hora_fin,
                dias_habiles: config.dias_habiles,
                activo: config.activo,
                tipos_activos: config.tipos_activos
            })

            if (resultado.success) {
                toast.success('Configuración guardada')
            } else {
                toast.error('Error', { description: resultado.error })
            }
        } catch {
            toast.error('Error guardando configuración')
        } finally {
            setSaving(false)
        }
    }

    const toggleDia = (dia: number) => {
        if (!config) return
        const nuevos = config.dias_habiles.includes(dia)
            ? config.dias_habiles.filter(d => d !== dia)
            : [...config.dias_habiles, dia].sort()
        setConfig({ ...config, dias_habiles: nuevos })
    }

    const toggleTipo = (tipo: string) => {
        if (!config) return
        const nuevos = config.tipos_activos.includes(tipo)
            ? config.tipos_activos.filter(t => t !== tipo)
            : [...config.tipos_activos, tipo]
        setConfig({ ...config, tipos_activos: nuevos })
    }

    if (loading || !config) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Configuración de Recordatorios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Configuración de Recordatorios
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="activo-toggle"
                            checked={config.activo}
                            onCheckedChange={(v) => setConfig({ ...config, activo: v === true })}
                        />
                        <label htmlFor="activo-toggle" className="text-sm text-muted-foreground cursor-pointer">
                            {config.activo ? 'Activo' : 'Desactivado'}
                        </label>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Horario */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horario de Envío
                    </Label>
                    <div className="flex items-center gap-3">
                        <Input
                            type="time"
                            value={config.hora_inicio}
                            onChange={(e) => setConfig({ ...config, hora_inicio: e.target.value })}
                            className="w-32"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                            type="time"
                            value={config.hora_fin}
                            onChange={(e) => setConfig({ ...config, hora_fin: e.target.value })}
                            className="w-32"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Solo se enviarán mensajes dentro de este horario
                    </p>
                </div>

                {/* Días */}
                <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Días Hábiles
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                        {DIAS_SEMANA.map((dia) => (
                            <Button
                                key={dia.value}
                                variant={config.dias_habiles.includes(dia.value) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleDia(dia.value)}
                                className="w-12"
                            >
                                {dia.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Tipos de Recordatorio */}
                <div className="space-y-3">
                    <Label>Tipos de Recordatorio Activos</Label>
                    <div className="space-y-2">
                        {TIPOS_RECORDATORIO.map((tipo) => (
                            <div key={tipo.value} className="flex items-center gap-2">
                                <Checkbox
                                    id={tipo.value}
                                    checked={config.tipos_activos.includes(tipo.value)}
                                    onCheckedChange={() => toggleTipo(tipo.value)}
                                />
                                <label htmlFor={tipo.value} className="text-sm cursor-pointer">
                                    {tipo.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={guardarConfig} disabled={saving}>
                        {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar Configuración
                    </Button>
                    <Button variant="outline" onClick={cargarConfig} disabled={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Recargar
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                    Última actualización: {new Date(config.updated_at).toLocaleString('es-PE')}
                </p>
            </CardContent>
        </Card>
    )
}
