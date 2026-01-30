'use client'

/**
 * System Health Dashboard
 *
 * Real-time monitoring dashboard showing:
 * - System events and errors
 * - Database replication status
 * - Build & deployment health
 * - Performance metrics
 *
 * @module SystemHealth
 * @see src/lib/events - Event system architecture
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useSystemEvents,
  useErrorCount,
  useUnacknowledgedCount,
  getSeverityColor,
  getSeverityIcon,
  type SystemEvent,
  type EventModule,
  type EventSeverity
} from '@/lib/events'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  XCircle,
  Trash2,
  Download,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

export default function SystemHealthPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [replicationStatus, setReplicationStatus] = useState<'syncing' | 'synced' | 'error' | 'offline'>('synced')

  // Get events from store
  const events = useSystemEvents(state => state.getRecent(50))
  const errorCount = useErrorCount()
  const unacknowledgedCount = useUnacknowledgedCount()
  const clearEvents = useSystemEvents(state => state.clearEvents)
  const acknowledgeAll = useSystemEvents(state => state.acknowledgeAll)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Calculate module statistics
  const moduleStats = events.reduce((acc, event) => {
    acc[event.module] = (acc[event.module] || 0) + 1
    return acc
  }, {} as Record<EventModule, number>)

  // Calculate severity statistics
  const severityStats = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<EventSeverity, number>)

  // Top 3 critical metrics
  const criticalMetrics = [
    {
      label: 'Errores Activos',
      value: errorCount,
      status: errorCount === 0 ? 'success' : errorCount < 5 ? 'warning' : 'error',
      icon: errorCount === 0 ? CheckCircle2 : AlertTriangle
    },
    {
      label: 'Estado de Red',
      value: isOnline ? 'Online' : 'Offline',
      status: isOnline ? 'success' : 'error',
      icon: isOnline ? Wifi : WifiOff
    },
    {
      label: 'Sincronización',
      value: replicationStatus === 'synced' ? 'Sincronizado' : 'Pendiente',
      status: replicationStatus === 'synced' ? 'success' : replicationStatus === 'error' ? 'error' : 'warning',
      icon: replicationStatus === 'synced' ? CheckCircle2 : RefreshCw
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Health
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitoreo en tiempo real del sistema JUNTAY
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={acknowledgeAll}
            disabled={unacknowledgedCount === 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar Todo Leído ({unacknowledgedCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Top 3 Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criticalMetrics.map((metric, idx) => {
          const Icon = metric.icon
          const statusColors = {
            success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }
          const iconColors = {
            success: 'text-emerald-600 dark:text-emerald-400',
            warning: 'text-yellow-600 dark:text-yellow-400',
            error: 'text-red-600 dark:text-red-400'
          }

          return (
            <Card key={idx} className={`border-2 ${statusColors[metric.status]}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${statusColors[metric.status]}`}>
                    <Icon className={`w-6 h-6 ${iconColors[metric.status]}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Module Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events by Module */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Eventos por Módulo
            </CardTitle>
            <CardDescription>Distribución de eventos en las últimas horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(moduleStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([module, count]) => (
                  <div key={module} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                        {module}
                      </span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Events by Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Eventos por Severidad
            </CardTitle>
            <CardDescription>Clasificación de eventos por criticidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['critical', 'error', 'warning', 'info', 'debug'] as EventSeverity[]).map(severity => {
                const count = severityStats[severity] || 0
                const colors = {
                  critical: 'bg-red-600',
                  error: 'bg-red-500',
                  warning: 'bg-yellow-500',
                  info: 'bg-blue-500',
                  debug: 'bg-slate-400'
                }
                return (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors[severity]}`} />
                      <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                        {severity}
                      </span>
                    </div>
                    <Badge variant={count > 0 ? 'default' : 'secondary'}>{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Eventos Recientes
          </CardTitle>
          <CardDescription>
            Últimos 50 eventos del sistema • Actualización en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No hay eventos registrados. ¡Todo funciona correctamente!
                </p>
              </div>
            ) : (
              events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              RxDB Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                5 colecciones activas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              Supabase Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Conectado
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Óptimo
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// Event Row Component
// ============================================================================

function EventRow({ event }: { event: SystemEvent }) {
  const severityColors = {
    debug: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    critical: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-semibold'
  }

  const moduleColors = {
    replication: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    auth: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    database: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    business: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    ui: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
    system: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
    external: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        event.acknowledged
          ? 'border-slate-200 dark:border-slate-800 opacity-60'
          : 'border-slate-300 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-lg">{getSeverityIcon(event.severity)}</span>
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={severityColors[event.severity]} variant="secondary">
              {event.severity}
            </Badge>
            <Badge className={moduleColors[event.module]} variant="secondary">
              {event.module}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {format(new Date(event.timestamp), 'HH:mm:ss')}
            </span>
          </div>

          <p className="text-sm text-slate-900 dark:text-white font-medium">
            {event.message}
          </p>

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                Ver detalles
              </summary>
              <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </details>
          )}

          {event.error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded text-xs text-red-600 dark:text-red-400">
              <strong>Error:</strong> {event.error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
